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
        INSERT OR IGNORE INTO users (user_id, name, language_preference, facts, last_interaction)
        VALUES ('sadd', 'Shreya', 'English', '{"previous_scheme": "Atal Pension Yojana"}', ?)
    """, (datetime.now().isoformat(),))
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
    # Check if table has old schema and drop if necessary to migrate
    try:
        cursor.execute("SELECT failure_category FROM call_outcomes LIMIT 1")
    except sqlite3.OperationalError:
        cursor.execute("DROP TABLE IF EXISTS call_outcomes")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS call_outcomes (
            call_id TEXT PRIMARY KEY,
            user_id TEXT,
            is_sip INTEGER,
            status TEXT DEFAULT 'failed',
            failure_category TEXT DEFAULT 'Incomplete task',
            duration INTEGER DEFAULT 0,
            language TEXT DEFAULT 'English',
            agent_latency_sum REAL DEFAULT 0.0,
            agent_latency_count INTEGER DEFAULT 0,
            outcome_type TEXT DEFAULT 'None',
            created_at TEXT
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
 
 
def init_call_outcome(call_id: str, user_id: str, is_sip: bool, language: str = 'English'):
    """Inserts a new call outcome record as 'failed' at the start of a call."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    created_at = datetime.now().isoformat()
    cursor.execute("""
        INSERT OR IGNORE INTO call_outcomes (call_id, user_id, is_sip, status, failure_category, duration, language, agent_latency_sum, agent_latency_count, outcome_type, created_at)
        VALUES (?, ?, ?, 'failed', 'Incomplete task', 0, ?, 0.0, 0, 'None', ?)
    """, (call_id, user_id, 1 if is_sip else 0, language, created_at))
    conn.commit()
    conn.close()


def update_call_progress(call_id: str, duration: int = None, status: str = None, failure_category: str = None, outcome_type: str = None):
    """Updates call parameters as the call progresses or ends."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if duration is not None:
        cursor.execute("UPDATE call_outcomes SET duration = ? WHERE call_id = ?", (duration, call_id))
    if status is not None:
        cursor.execute("UPDATE call_outcomes SET status = ? WHERE call_id = ?", (status, call_id))
    if failure_category is not None:
        cursor.execute("UPDATE call_outcomes SET failure_category = ? WHERE call_id = ?", (failure_category, call_id))
    if outcome_type is not None:
        cursor.execute("UPDATE call_outcomes SET outcome_type = ? WHERE call_id = ?", (outcome_type, call_id))
    conn.commit()
    conn.close()


def finalize_call_outcome(call_id: str, duration: int):
    """Updates final call duration and refines default failure category to 'User hang-up' if they spent time on the call."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE call_outcomes 
        SET duration = ?, 
            failure_category = CASE 
                WHEN status = 'failed' AND failure_category = 'Incomplete task' AND ? > 5 THEN 'User hang-up'
                ELSE failure_category 
            END
        WHERE call_id = ?
    """, (duration, duration, call_id))
    conn.commit()
    conn.close()


def add_latency_measurement(call_id: str, latency_sec: float):
    """Logs an agent response latency measurement."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE call_outcomes 
        SET agent_latency_sum = agent_latency_sum + ?, 
            agent_latency_count = agent_latency_count + 1 
        WHERE call_id = ?
    """, (latency_sec, call_id))
    conn.commit()
    conn.close()


def get_call_stats():
    """Returns detailed statistics for the dashboard."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        # 1. Base counts
        cursor.execute("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success, SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed FROM call_outcomes")
        row = cursor.fetchone()
        total = row['total'] or 0
        success = row['success'] or 0
        failed = row['failed'] or 0

        # 2. Channel counts (Browser vs SIP)
        cursor.execute("SELECT is_sip, COUNT(*) as count, SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success, SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed FROM call_outcomes GROUP BY is_sip")
        channels = {
            "browser": {"total": 0, "success": 0, "failed": 0},
            "sip": {"total": 0, "success": 0, "failed": 0}
        }
        for r in cursor.fetchall():
            key = "sip" if r['is_sip'] == 1 else "browser"
            channels[key] = {
                "total": r['count'] or 0,
                "success": r['success'] or 0,
                "failed": r['failed'] or 0
            }

        # 3. Failure categories breakdown
        cursor.execute("SELECT failure_category, COUNT(*) as count FROM call_outcomes WHERE status = 'failed' GROUP BY failure_category")
        failures = {}
        for r in cursor.fetchall():
            failures[r['failure_category']] = r['count']

        # 4. Latency
        cursor.execute("SELECT SUM(agent_latency_sum), SUM(agent_latency_count) FROM call_outcomes WHERE agent_latency_count > 0")
        l_row = cursor.fetchone()
        avg_latency = 0.0
        if l_row and l_row[1] and l_row[1] > 0:
            avg_latency = round(l_row[0] / l_row[1], 2)

        # 5. Call history (recent 10 calls)
        cursor.execute("SELECT call_id, user_id, is_sip, status, failure_category, duration, language, created_at, outcome_type FROM call_outcomes ORDER BY created_at DESC LIMIT 10")
        history = []
        for r in cursor.fetchall():
            history.append({
                "call_id": r['call_id'],
                "user_id": r['user_id'],
                "is_sip": bool(r['is_sip']),
                "status": r['status'],
                "failure_category": r['failure_category'],
                "duration": r['duration'],
                "language": r['language'],
                "outcome_type": r['outcome_type'],
                "created_at": r['created_at']
            })
    except sqlite3.OperationalError:
        total, success, failed, avg_latency = 0, 0, 0, 0.0
        channels = {
            "browser": {"total": 0, "success": 0, "failed": 0},
            "sip": {"total": 0, "success": 0, "failed": 0}
        }
        failures = {}
        history = []

    conn.close()
    return {
        "total": total,
        "success": success,
        "failed": failed,
        "channels": channels,
        "failures": failures,
        "avg_latency": avg_latency,
        "history": history
    }


def clear_call_log():
    """Deletes all records from the call_outcomes table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM call_outcomes")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()


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
        elif cmd == "get_dashboard_stats":
            stats = get_call_stats()
            print(json.dumps(stats))
        elif cmd == "clear_call_log":
            clear_call_log()
            print(json.dumps({"success": True}))
