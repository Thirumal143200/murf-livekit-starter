import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    tokenize,
    room_io,
    UserInputTranscribedEvent,
    function_tool,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")

try:
    from prompt import SYSTEM_PROMPT
except ImportError:
    from src.prompt import SYSTEM_PROMPT

try:
    import db
except ImportError:
    import src.db as db


class Assistant(Agent):
    def __init__(self, user_id: str, instructions: str = SYSTEM_PROMPT) -> None:
        super().__init__(instructions=instructions)
        self.user_id = user_id

    @function_tool
    async def lookup_caller(self) -> str:
        """Looks up the current caller's details and saved facts in the database.
        Always execute this tool at the very beginning of the call to check if they are a returning caller.
        """
        logger.info(f"Tool lookup_caller called for current user: {self.user_id}")
        user_info = db.get_user(self.user_id)
        if user_info:
            import json
            return json.dumps(user_info)
        return f"No record found for user ID: {self.user_id}"

    @function_tool
    async def save_caller_facts(self, name: str, language_preference: str, facts: dict) -> str:
        """Saves current caller's details and facts (e.g. checked schemes, eligibility answers) to the database.
        Always verify the caller has given verbal permission/consent before calling this.
        
        Args:
            name: The caller's name.
            language_preference: The caller's preferred language (e.g., Hindi, English, Hinglish).
            facts: A dictionary of key-value pairs representing facts about the caller (e.g., eligibility, schemes checked). Do not store account or ID numbers.
        """
        logger.info(f"Tool save_caller_facts called for user_id: {self.user_id}, name: {name}")
        # Clean facts from any ID numbers or account numbers
        cleaned_facts = {}
        for k, v in facts.items():
            if "id" in k.lower() or "account" in k.lower() or "number" in k.lower():
                continue
            cleaned_facts[k] = v
        
        db.save_user(self.user_id, name, language_preference, cleaned_facts)
        return f"Successfully saved details for user {name} (ID: {self.user_id})."

    @function_tool
    async def check_scheme_eligibility(
        self,
        age: int,
        has_bank_account: bool,
        is_income_taxpayer: bool = False,
        girl_child_age: int = -1,
    ) -> str:
        """Determines eligibility and returns a personalized document checklist for Indian government financial schemes (PMJDY, PMSBY, PMJJBY, APY, SSY).
        
        Call this tool when the caller asks if they can apply for a scheme, wants to check eligibility, or asks what documents they need to submit.
        You must first ask the caller for their age and if they already have a savings bank account.
        If they ask about Atal Pension Yojana (APY), you must also ask if they pay income tax.
        If they ask about Sukanya Samriddhi Yojana (SSY), you must also ask for the age of their girl child.

        Args:
            age: The current age of the caller in years.
            has_bank_account: True if the caller already has a savings bank account, False otherwise.
            is_income_taxpayer: True if the caller pays income tax, False if not. Required for APY.
            girl_child_age: The age of the girl child in years (0 to 10). Pass -1 if not applicable or checking for other schemes. Required for SSY.
        """
        import json
        import os
        import asyncio

        logger.info(f"Tool check_scheme_eligibility called for user: {self.user_id} with args age: {age}, bank: {has_bank_account}, taxpayer: {is_income_taxpayer}, girl_child_age: {girl_child_age}")
        
        # Simulate network latency of 500ms
        await asyncio.sleep(0.5)

        # Build absolute path to schemes_db.json
        base_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(base_dir, "schemes_db.json")

        try:
            with open(db_path, "r", encoding="utf-8") as f:
                db_data = json.load(f)
        except Exception as e:
            logger.error(f"Failed to read schemes_db.json: {e}")
            # Handle failure path out loud
            return (
                "Error: System connection timeout. I am unable to connect to the official schemes eligibility database at this moment. "
                "Please check back later or verify manually at your nearest bank branch. Note: The database rules were last known to be updated as of August 2026."
            )

        metadata = db_data.get("metadata", {})
        last_updated = metadata.get("last_updated", "August 2026")
        schemes = db_data.get("schemes", {})

        results = []
        results.append(f"Scheme Eligibility Assessment & Required Documents (As of {last_updated}):")

        # 1. PMJDY (Jan Dhan)
        pmjdy = schemes.get("PMJDY")
        if pmjdy:
            eligible = True
            reasons = []
            if age < pmjdy["min_age"]:
                eligible = False
                reasons.append(f"Age must be at least {pmjdy['min_age']} years.")
            
            status = "Eligible" if eligible else "Not Eligible"
            results.append(f"\n- {pmjdy['name']}: {status}")
            if eligible:
                if has_bank_account:
                    results.append("  (Note: You already have a bank account. PMJDY is primarily for unbanked citizens to open a zero-balance account, but you can consult your bank if you want a BSBD account.)")
                results.append("  Benefits:")
                for b in pmjdy["benefits"]:
                    results.append(f"    * {b}")
                results.append("  Required Documents:")
                for d in pmjdy["documents"]:
                    results.append(f"    * {d}")
            else:
                results.append(f"  Reason: {', '.join(reasons)}")

        # 2. PMSBY (Suraksha Bima)
        pmsby = schemes.get("PMSBY")
        if pmsby:
            eligible = True
            reasons = []
            if not (pmsby["min_age"] <= age <= pmsby["max_age"]):
                eligible = False
                reasons.append(f"Age must be between {pmsby['min_age']} and {pmsby['max_age']} years.")
            
            status = "Eligible" if eligible else "Not Eligible"
            results.append(f"\n- {pmsby['name']}: {status}")
            if eligible:
                if not has_bank_account:
                    results.append("  (Note: You must open or have a savings bank account to link the premium auto-debit.)")
                results.append("  Benefits:")
                for b in pmsby["benefits"]:
                    results.append(f"    * {b}")
                results.append("  Required Documents:")
                for d in pmsby["documents"]:
                    results.append(f"    * {d}")
            else:
                results.append(f"  Reason: {', '.join(reasons)}")

        # 3. PMJJBY (Jeevan Jyoti)
        pmjjby = schemes.get("PMJJBY")
        if pmjjby:
            eligible = True
            reasons = []
            if not (pmjjby["min_age"] <= age <= pmjjby["max_age"]):
                eligible = False
                reasons.append(f"Age must be between {pmjjby['min_age']} and {pmjjby['max_age']} years.")
            
            status = "Eligible" if eligible else "Not Eligible"
            results.append(f"\n- {pmjjby['name']}: {status}")
            if eligible:
                if not has_bank_account:
                    results.append("  (Note: You must open or have a savings bank account to link the premium auto-debit.)")
                results.append("  Benefits:")
                for b in pmjjby["benefits"]:
                    results.append(f"    * {b}")
                results.append("  Required Documents:")
                for d in pmjjby["documents"]:
                    results.append(f"    * {d}")
            else:
                results.append(f"  Reason: {', '.join(reasons)}")

        # 4. APY (Atal Pension)
        apy = schemes.get("APY")
        if apy:
            eligible = True
            reasons = []
            if not (apy["min_age"] <= age <= apy["max_age"]):
                eligible = False
                reasons.append(f"Age must be between {apy['min_age']} and {apy['max_age']} years.")
            if is_income_taxpayer:
                eligible = False
                reasons.append("Income taxpayers are not eligible to join Atal Pension Yojana as of October 2022 rules.")
            
            status = "Eligible" if eligible else "Not Eligible"
            results.append(f"\n- {apy['name']}: {status}")
            if eligible:
                if not has_bank_account:
                    results.append("  (Note: You must open or have a savings bank account to link the pension auto-debit.)")
                results.append("  Benefits:")
                for b in apy["benefits"]:
                    results.append(f"    * {b}")
                results.append("  Required Documents:")
                for d in apy["documents"]:
                    results.append(f"    * {d}")
            else:
                results.append(f"  Reason: {', '.join(reasons)}")

        # 5. SSY (Sukanya Samriddhi)
        ssy = schemes.get("SSY")
        if ssy:
            eligible = True
            reasons = []
            if girl_child_age < 0 or girl_child_age > 10:
                eligible = False
                reasons.append("Sukanya Samriddhi Yojana requires a girl child aged 10 years or younger.")
            
            status = "Eligible" if eligible else "Not Eligible (or Not Applicable)"
            results.append(f"\n- {ssy['name']}: {status}")
            if eligible:
                results.append("  Benefits:")
                for b in ssy["benefits"]:
                    results.append(f"    * {b}")
                results.append("  Required Documents:")
                for d in ssy["documents"]:
                    results.append(f"    * {d}")
            else:
                results.append(f"  Reason: {', '.join(reasons)}")

        return "\n".join(results)


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    # Logging setup
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Initialize SQLite database
    db.init_db()

    # Retrieve the participant's identity
    user_id = "unknown_user"
    for p_identity in ctx.room.remote_participants.keys():
        user_id = p_identity
        break

    logger.info(f"Active connection with user_id: {user_id}")

    instructions = f"{SYSTEM_PROMPT}\n\nCURRENT USER CALL INFO:\n- Current Caller User ID: {user_id}\n- IMPORTANT: You MUST immediately call `lookup_caller` at the very start of the conversation. If a record is returned, welcome the user back by name and reference their previous interaction (e.g. 'नमस्ते Ramesh जी, पिछली बार हमने आपके Atal Pension Yojana के बारे में बात की थी। क्या उससे जुड़ा कोई सवाल है?'). If no record is found, greet them as a new user."


    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        stt=deepgram.STT(model="nova-3", language="multi"),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        llm=google.LLM(
                model="gemini-3.5-flash",
            ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        tts=murf.TTS(
                voice="Anisha", # make sure locale key is not hardcoded
                style="Conversation",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True
            ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(user_id=user_id, instructions=instructions),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
