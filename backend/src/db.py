import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "caller_data.db")

def init_db():
    """Initializes the SQLite database and creates the users and escalations tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            name TEXT,
            language_preference TEXT,
            facts TEXT,
            last_interaction TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS escalations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference_id TEXT UNIQUE,
            caller_id TEXT,
            caller_name TEXT,
            situation TEXT,
            what_happened TEXT,
            checked_facts TEXT,
            urgency TEXT,
            language TEXT,
            follow_up_method TEXT,
            contact_details TEXT,
            created_at TEXT,
            status TEXT DEFAULT 'open'
        )
    """)
    conn.commit()
    conn.close()


def get_user(user_id: str):
    """Retrieves user details from the database by user_id."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT user_id, name, language_preference, facts, last_interaction FROM users WHERE user_id = ?",
        (user_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        try:
            facts = json.loads(row[3])
        except Exception:
            facts = {}
        return {
            "user_id": row[0],
            "name": row[1],
            "language_preference": row[2],
            "facts": facts,
            "last_interaction": row[4]
        }
    return None

def save_user(user_id: str, name: str, language_preference: str, facts: dict):
    """Saves or updates user details and facts in the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    facts_str = json.dumps(facts)
    last_interaction = datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO users (user_id, name, language_preference, facts, last_interaction)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            name = excluded.name,
            language_preference = excluded.language_preference,
            facts = excluded.facts,
            last_interaction = excluded.last_interaction
    """, (user_id, name, language_preference, facts_str, last_interaction))
    conn.commit()
    conn.close()
    return {
        "user_id": user_id,
        "name": name,
        "language_preference": language_preference,
        "facts": facts,
        "last_interaction": last_interaction
    }

import re

def remove_private_info(text: str) -> str:
    if not text:
        return text
    
    # 1. Credit/Debit Cards: 13 to 19 digits, possibly separated by spaces or hyphens
    card_pattern = r'\b(?:\d[ -]*?){13,19}\b'
    # 2. Aadhaar Cards: 12 digits, often with space/hyphen grouping
    aadhaar_pattern = r'\b\d{4}[ -]?\d{4}[ -]?\d{4}\b'
    # 3. PAN card: 5 uppercase letters, 4 digits, 1 uppercase letter
    pan_pattern = r'\b[A-Z]{5}\d{4}[A-Z]\b'
    # 4. Bank Account numbers: 9 to 18 digits (standard range for Indian banks)
    account_pattern = r'\b\d{9,18}\b'
    
    # 5. PINs / OTPs / Passwords / CVV
    keyword_code_pattern = r'\b(?:pin|otp|password|pwd|passcode|cvv|code)\b\s*[:=-]?\s*[a-zA-Z0-9]+'
    
    sanitized = text
    sanitized = re.sub(pan_pattern, "[REDACTED PAN]", sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(card_pattern, "[REDACTED CARD]", sanitized)
    sanitized = re.sub(aadhaar_pattern, "[REDACTED AADHAAR]", sanitized)
    
    # We should avoid redacting normal numbers if possible, but let's replace 9-18 digit account numbers
    sanitized = re.sub(account_pattern, "[REDACTED ACCOUNT]", sanitized)
    
    def redact_sensitive_keyword(match):
        val = match.group(0)
        keyword_match = re.search(r'\b(?:pin|otp|password|pwd|passcode|cvv|code)\b', val, re.IGNORECASE)
        if keyword_match:
            return f"{keyword_match.group(0)}: [REDACTED]"
        return "[REDACTED]"
        
    sanitized = re.sub(keyword_code_pattern, redact_sensitive_keyword, sanitized, flags=re.IGNORECASE)
    return sanitized

def trigger_webhook(payload: dict):
    webhook_url = os.environ.get("WEBHOOK_URL")
    if not webhook_url:
        return
    try:
        import urllib.request
        import json
        import sys
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            webhook_url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            pass
    except Exception as e:
        import sys
        print(f"Webhook delivery failed: {e}", file=sys.stderr)

def create_escalation(
    caller_id: str,
    caller_name: str,
    situation: str,
    what_happened: str,
    checked_facts: dict,
    urgency: str,
    language: str,
    follow_up_method: str,
    contact_details: str
) -> str:
    """Inserts or updates a human support escalation request and returns its unique Reference ID."""
    import random
    
    # Sanitize private information
    caller_name = remove_private_info(caller_name)
    situation = remove_private_info(situation)
    what_happened = remove_private_info(what_happened)
    contact_details = remove_private_info(contact_details)
    
    # Normalize urgency
    urgency = urgency.capitalize().strip() if urgency else "Low"
    urgency_ranks = {"Low": 1, "Medium": 2, "High": 3, "Emergency": 4}
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if a duplicate ticket is already open (same caller and same situation)
    cursor.execute("""
        SELECT id, reference_id, what_happened, checked_facts, urgency 
        FROM escalations 
        WHERE caller_id = ? AND situation = ? AND status = 'open'
    """, (caller_id, situation))
    existing = cursor.fetchone()
    
    if existing:
        db_id, reference_id, prev_what_happened, prev_checked_facts_str, prev_urgency = existing
        
        # Format the updated details
        timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        updated_what_happened = f"{prev_what_happened}\n\n[Updated {timestamp_str}]: {what_happened}"
        
        # Merge checked facts
        try:
            prev_facts = json.loads(prev_checked_facts_str) if prev_checked_facts_str else {}
        except Exception:
            prev_facts = {}
        
        merged_facts = {**prev_facts, **(checked_facts or {})}
        merged_facts_str = json.dumps(merged_facts)
        
        # Determine urgency (keep the higher level)
        prev_rank = urgency_ranks.get(prev_urgency, 1)
        new_rank = urgency_ranks.get(urgency, 1)
        final_urgency = prev_urgency if prev_rank >= new_rank else urgency
        
        updated_at = datetime.now().isoformat()
        
        cursor.execute("""
            UPDATE escalations 
            SET what_happened = ?, checked_facts = ?, urgency = ?, created_at = ?, contact_details = ?, follow_up_method = ?, language = ?
            WHERE id = ?
        """, (updated_what_happened, merged_facts_str, final_urgency, updated_at, contact_details, follow_up_method, language, db_id))
        conn.commit()
        conn.close()
        
        trigger_webhook({
            "event": "escalation_updated",
            "reference_id": reference_id,
            "caller_name": caller_name,
            "situation": situation,
            "what_happened": updated_what_happened,
            "urgency": final_urgency,
            "language": language,
            "follow_up_method": follow_up_method,
            "contact_details": contact_details,
            "updated_at": updated_at
        })
        return reference_id
    
    # Generate new reference ID: ESC-YYYYMMDD-XXXX
    date_str = datetime.now().strftime("%Y%m%d")
    random_suffix = "".join(random.choices("0123456789", k=4))
    reference_id = f"ESC-{date_str}-{random_suffix}"
    
    checked_facts_str = json.dumps(checked_facts)
    created_at = datetime.now().isoformat()
    
    cursor.execute("""
        INSERT INTO escalations (
            reference_id, caller_id, caller_name, situation, what_happened,
            checked_facts, urgency, language, follow_up_method, contact_details,
            created_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
    """, (
        reference_id, caller_id, caller_name, situation, what_happened,
        checked_facts_str, urgency, language, follow_up_method, contact_details,
        created_at
    ))
    conn.commit()
    conn.close()
    
    trigger_webhook({
        "event": "escalation_created",
        "reference_id": reference_id,
        "caller_name": caller_name,
        "situation": situation,
        "what_happened": what_happened,
        "urgency": urgency,
        "language": language,
        "follow_up_method": follow_up_method,
        "contact_details": contact_details,
        "created_at": created_at
    })
    return reference_id

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "get_escalations_json":
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            try:
                cursor.execute("SELECT * FROM escalations ORDER BY id DESC")
                rows = cursor.fetchall()
                result = []
                for r in rows:
                    item = dict(r)
                    try:
                        item["checked_facts"] = json.loads(item["checked_facts"])
                    except Exception:
                        pass
                    result.append(item)
                print(json.dumps(result))
            except sqlite3.OperationalError as e:
                # Table might not exist yet if no call has been made to initialize it
                print(json.dumps([]))
            conn.close()
        elif cmd == "update_status" and len(sys.argv) > 3:
            ticket_id = sys.argv[2]
            new_status = sys.argv[3]
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("UPDATE escalations SET status = ? WHERE id = ?", (new_status, ticket_id))
            conn.commit()
            conn.close()
            print(json.dumps({"success": True}))
        elif cmd == "delete_ticket" and len(sys.argv) > 2:
            ticket_id = sys.argv[2]
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM escalations WHERE id = ?", (ticket_id,))
            conn.commit()
            conn.close()
            print(json.dumps({"success": True}))
