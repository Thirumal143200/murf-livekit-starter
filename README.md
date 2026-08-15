# Jan Sahay (जन सहायक)

A Voice-First Financial Companion for Bharat 🇮🇳

![Jan Sahay Story Banner](docs/screenshots/jan_sahay_story_banner.png)

> Built for the **Murf AI "10 Days of Voice Agents – VoiceForBharat Edition" Challenge** (Financial Services Track).

---

## 📖 The Story That Started It All

Imagine a small shopkeeper in India named **Ramesh**.

One evening, Ramesh receives an urgent SMS on his mobile phone:
> *"Your bank account will be blocked tonight. Verify your KYC immediately by clicking the link below."*

Anxious and rushed, he clicks the link. Within minutes, he realizes it was a phishing scam and an unauthorized transaction has taken place from his account.

Gripped with panic, Ramesh is flooded with urgent questions:
- *What should he do right now?*
- *Who should he contact to block his account before more money is lost?*
- *How does he file a cyber fraud report under the 1930 National Helpline?*
- *Are there government welfare schemes like PM-KISAN or Atal Pension Yojana that can support his family?*

The answers exist across fragmented government portals and bank websites—but finding authoritative guidance during a crisis is overwhelmingly difficult. Most portals are text-heavy, loaded with bureaucratic jargon, or written only in formal English.

That exact challenge inspired **Jan Sahay (जन सहायक)**: a citizen-focused, voice-first AI companion engineered to make **financial literacy, fraud prevention, government welfare schemes, and emergency triage** accessible to every citizen. Instead of navigating complex portals or waiting in long bank queues, citizens can simply speak naturally in Hindi, Hinglish, or English to an empathetic AI voice assistant.

---

## 🏛️ The 4 Core Functional Pillars

Rather than building an open-ended chatbot, Jan Sahay is structured around four foundational pillars designed specifically for citizen welfare and digital financial security:

```
                  ┌──────────────────────────────┐
                  │         JAN SAHAY            │
                  │   Citizen Voice Companion    │
                  └──────────────┬───────────────┘
                                 │
     ┌──────────────────┬────────┴─────────┬──────────────────┐
     ▼                  ▼                  ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Financial   │ │    Fraud     │ │  Government  │ │  Human &     │
│   Literacy   │ │  Prevention  │ │   Schemes    │ │ Escalation   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

1. **💰 Financial Literacy**: Jargon-free explanations of savings accounts, mutual fund SIP return calculations, loan EMI estimations, and interest rate basics.
2. **🛡️ Fraud Prevention**: Real-time coaching on OTP/PIN security, recognizing phishing SMS, identifying fake calls, and securing compromised banking apps.
3. **🏛️ Government Welfare Schemes**: Deterministic eligibility calculations and document checklists for **PM-KISAN**, **PMJDY**, **PMSBY**, **PMJJBY**, **Atal Pension Yojana (APY)**, **Sukanya Samriddhi (SSY)**, and **PM Mudra Yojana**.
4. **📞 Human Escalation & Emergency Triage**: Automated creation of escalation support tickets, step-by-step guidance for National Cyber Crime Reporting (**1930**), and direct handoff to human specialists.

---

## 1. Project Overview

**Jan Sahay (जन सहायक)** is an Indian multilingual AI voice companion engineered to bridge the digital and financial literacy gap for millions of citizens across Bharat. Operating through natural, conversational Hindi, Hinglish, and regional voice interactions, Jan Sahay helps everyday users navigate government welfare schemes, understand core banking services, calculate financial investments, recognize financial fraud, and access human expert assistance when required.

Powered by low-latency real-time voice streaming with **Murf Falcon TTS**, **LiveKit WebRTC**, **Deepgram STT**, and **Google Gemini 3.6 Flash**, Jan Sahay delivers human-like conversational responses with authentic Indian voice inflections.

---

## 2. Problem Statement

Financial literacy in India remains unevenly distributed:
- **Language & Literacy Barriers**: Complex financial terminology in formal English or written text creates high entry barriers for rural and semi-urban populations.
- **Scheme Awareness Gap**: Hundreds of central and state welfare programs (e.g., PM-KISAN, Ayushman Bharat, Atal Pension Yojana) exist, but eligible citizens often do not know how to apply or benefit.
- **Digital Payment & Fraud Vulnerabilities**: Rapid adoption of UPI and digital banking has led to an increase in phishing, OTP scams, and deceptive financial frauds.
- **Complex Calculators**: Traditional financial calculation tools (SIP, EMI, interest rates) require digital fluency and mathematical confidence that many first-time banking users lack.

---

## 3. Target Users

1. **First-Time Banking & Rural Citizens**: Farmers, small shopkeepers, micro-entrepreneurs, and homemakers seeking clear guidance in local conversational languages.
2. **Senior Citizens**: Individuals looking for easy voice-assisted information on pension schemes, fixed deposits, and social security programs without navigating complex websites.
3. **Digital Payment Beginners**: Users seeking safe explanations of UPI, digital wallets, bank transfers, and fraud prevention rules.
4. **Scheme Applicants**: Citizens seeking eligibility criteria, required documents, and step-by-step procedures for government initiatives.

---

## 4. Why Voice?

- **Zero-Literacy Barrier**: Voice is the most inclusive interface—users do not need to type, read dense web pages, or struggle with complex mobile menus.
- **Empathetic & Conversational**: Natural spoken dialogue in familiar Indian accents builds immediate trust and reduces anxiety around financial decisions.
- **Hands-Free & Accessible**: Spoken interactions work effortlessly across mobile WebRTC applications and traditional telephone landlines/mobile networks (SIP).
- **Instant Clarification**: Spoken back-and-forth dialogue allows users to ask immediate follow-up questions when a concept is unclear.

---

## 5. Key Features

- 🎙️ **Multilingual Voice Conversation**: Spoken dialogue in natural Hindi, Hinglish, and Indian-accented English.
- 🔊 **Murf Falcon High-Fidelity TTS**: Ultra-low latency voice synthesis tailored with natural Indian accents (`en-IN-pooja` / `Anisha`).
- 🧠 **Persistent User Memory**: SQLite database tracking caller history, previous scheme inquiries, preferred language, and personal context across calls.
- 🛠️ **Financial Tools & Calculators**: Real-time SIP return calculations, loan EMI estimations, and scheme searches.
- 📑 **Government Scheme Specialist**: Multi-agent specialist architecture for deep, authoritative scheme breakdowns.
- 🔄 **Agent-to-Agent Context Handoff**: Dynamic transfer between the general assistant and specialist agent with full conversation history retention.
- 📞 **Outbound SIP Telephony**: Proactive voice calling for scheme updates, reminders, and follow-ups over telephone networks.
- 🆘 **Human Escalation Engine**: Automated detection and seamless handoff to human specialists for complex or sensitive cases.
- 📊 **Call Analytics & Logging**: Granular analytics capturing conversation duration, intent, sentiment, topics, and resolution status.
- 🛡️ **Safety & Privacy Guardrails**: Automated PII masking, strict fraud alerts, and refusal of guaranteed return promises or credential requests.

---

## 6. Day 1–Day 10 Journey

| Day | Feature Milestone | Key Implementation Deliverables |
|---|---|---|
| **Day 1** | Initial Voice Pipeline | Established base LiveKit agent session using Murf Falcon TTS, Deepgram STT, and LLM orchestration. |
| **Day 2** | Personality & Guardrails | Defined Jan Sahay persona, Hindi/Hinglish instructions, financial domain boundary, and safety guardrails in `prompt.py`. |
| **Day 3** | Frontend User Experience | Developed Next.js 15 web interface with real-time audio visualizers (Bar/Wave/Grid), transcript drawer, and control bar. |
| **Day 4** | Persistent Memory Layer | Integrated SQLite database (`caller_data.db`, `db.py`) with `lookup_caller()` and `save_caller_memory()` tools. |
| **Day 5** | Financial Tools & Datasets | Created `schemes_db.json` dataset and built `search_schemes()`, `calculate_sip()`, and `calculate_emi()` tools. |
| **Day 6** | Outbound Telephony Calling | Implemented `outbound_call.py` and LiveKit SIP telephony integration (`backend/src/telephony/`) for proactive calls. |
| **Day 7** | Human Escalation Engine | Added `escalate_to_human()` function tool, escalation audit logging, and live agent transfer workflows. |
| **Day 8** | Call Analytics & Dashboard | Built `log_call_analytics()` logging pipeline and SQLite analytics table structure tracking call sentiment and intents. |
| **Day 9** | Specialist Agent Handoff | Implemented `specialist_prompts.py`, `transfer_to_scheme_specialist()` multi-agent handoff, dynamic voice switching, and UI banners. |
| **Day 10** | Final Audits & Release | Full codebase verification, architecture diagram generation, environment security audit, test suite run, and public release documentation. |

---

## 7. System Architecture

### 1. Real-Time Audio Streaming Flow

```mermaid
flowchart LR
    A["🎙️ Citizen Speaks Audio"] --> B["⚡ LiveKit WebRTC<br/>Real-Time Transport"]
    B --> C["🗣️ Deepgram Nova-3<br/>Streaming Speech-to-Text"]
    C --> D["🧠 Google Gemini 3.6 Flash<br/>Reasoning & Intent"]
    D --> E["💰 Financial Tools Engine<br/>+ Caller Memory DB"]
    E --> F["🔊 Murf Falcon TTS<br/>Ultra-Fast Indian Voices"]
    F --> G["🗣️ Natural Voice<br/>Playback to Citizen"]

    G -.-> A

    style A fill:#1E293B,stroke:#38BDF8,color:#fff
    style B fill:#0284C7,stroke:#38BDF8,color:#fff
    style C fill:#0D9488,stroke:#2DD4BF,color:#fff
    style D fill:#6366F1,stroke:#A5B4FC,color:#fff
    style E fill:#D97706,stroke:#FDE68A,color:#fff
    style F fill:#EA580C,stroke:#FDBA74,color:#fff
    style G fill:#10B981,stroke:#6EE7B7,color:#fff
```

### 2. Multi-Tier System Diagram

```
                                 ┌─────────────────────────┐
                                 │   User (Web / Phone)    │
                                 └────────────┬────────────┘
                                              │ Audio Stream
                                              ▼
                                 ┌─────────────────────────┐
                                 │  LiveKit WebRTC Server  │
                                 └────────────┬────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
                      ▼                                               ▼
      ┌───────────────────────────────┐               ┌───────────────────────────────┐
      │  Speech-To-Text (Deepgram)    │               │    Text-To-Speech (Murf)      │
      └───────────────┬───────────────┘               └───────────────▲───────────────┘
                      │ Transcribed Text                              │ Synthesized Audio
                      ▼                                               │
┌─────────────────────────────────────────────────────────────────────┴────────────────┐
│                        Main Jan Sahay Agent (Gemini 3.6 Flash)                       │
│                                                                                      │
│   ┌────────────────┐   ┌─────────────────┐   ┌────────────────┐   ┌──────────────┐   │
│   │ Memory (SQLite)│   │ Financial Tools │   │ Govt Specialist│   │  Escalation  │   │
│   └────────────────┘   └─────────────────┘   └────────────────┘   └──────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. How the Voice Pipeline Works

1. **Audio Capture & Transport**: The user speaks into the web browser or phone. LiveKit WebRTC streams low-latency audio chunks directly to the backend session runner.
2. **Speech Recognition (STT)**: Deepgram's `nova-3` speech-to-text engine transcribes multilingual input (Hindi, Hinglish, English) into clean text tokens.
3. **Agent Reasoning (LLM)**: The core LLM (**Gemini 3.6 Flash**) processes the transcription against the system prompt, caller memory, conversation history, and active safety rules.
4. **Tool Execution**: If required, the agent calls registered Python tools (`lookup_caller`, `search_schemes`, `calculate_sip`, `calculate_emi`, `transfer_to_scheme_specialist`, `escalate_to_human`).
5. **Speech Synthesis (TTS)**: The text output is streamed to **Murf Falcon TTS**, generating natural, human-like voice audio with Indian accent inflections (`en-IN-pooja` / `Anisha`).
6. **Playback & Visualizer Sync**: Audio is streamed back through LiveKit, triggering real-time canvas visualizer animations and transcript updates on the frontend.

---

## 9. Technology Stack

### Backend & Agent Core
- **Language**: Python 3.10+
- **Agent Framework**: `livekit-agents` v0.10.x
- **TTS Engine**: Murf Falcon (`livekit-plugins-murf` / Murf AI API)
- **STT Engine**: Deepgram Nova-3 (`livekit-plugins-deepgram`)
- **LLM Provider**: Google Gemini 3.6 Flash (`gemini-3.6-flash` via `livekit-plugins-google`)
- **Database**: SQLite3 (`caller_data.db` via `db.py`)
- **Telephony**: LiveKit SIP Outbound (`livekit-api`)

### Frontend
- **Framework**: Next.js 15 (React 19, TypeScript)
- **Styling**: Vanilla CSS / Tailwind CSS v4, Radix UI
- **LiveKit SDK**: `@livekit/components-react`, `livekit-client`
- **Visualizers**: `@agents-ui/agent-audio-visualizer-bar`, wave, grid
- **Icons**: Lucide React, Phosphor Icons

---

## 10. Agent Architecture

Jan Sahay follows an event-driven agent pattern powered by `livekit-agents`:

- **System Prompt Layer** (`backend/src/prompt.py`): Enforces identity, empathetic tone, short output lengths (under 25-30 words per turn for low latency), language switching, and domain boundaries.
- **Session Lifecycle**: Initialized inside `my_agent(ctx: JobContext)`, subscribing to audio tracks and registering function tools.
- **Context Injection**: On participant connection, the agent executes `lookup_caller()` to recall user profile details before uttering the opening greeting.

---

## 11. Specialist Agent and Handoff

When a user asks detailed or complex questions about government schemes (e.g., eligibility verification, application steps, document checklists), the main agent uses the `transfer_to_scheme_specialist` tool.

### Handoff Mechanics (`backend/src/specialist_prompts.py`)
1. **Context Summary**: The main agent synthesizes the user's specific scheme interest and background into a handoff context string.
2. **Persona Switch**: The assistant updates its instructions to the **Government Scheme Specialist Agent** system prompt.
3. **Voice Adjustment**: Switch to specialist voice properties to signify the expert handoff to the user.
4. **UI Banner Trigger**: A custom transcript message `[SPECIALIST_HANDOFF]` is emitted, displaying a visual handoff badge in the frontend UI.

---

## 12. Memory

Jan Sahay maintains session and long-term memory via SQLite (`backend/src/db.py` / `caller_data.db`):

- **Caller Profiles Table** (`callers`): Stores `user_id`, `name`, `phone`, `preferred_language`, `notes`, `created_at`, `updated_at`.
- **Call History Table** (`call_history`): Tracks past call topics, schemes inquired about, and resolution notes.
- **Function Tools**:
  - `lookup_caller(user_id)`: Fetches user record and past scheme interactions at call start.
  - `save_caller_memory(user_id, preferred_language, scheme_interest, notes)`: Updates user profile during or after a conversation.

---

## 13. Tools

Registered agent function tools (`backend/src/agent.py`):

1. `lookup_caller`: Retrieves stored caller profile and previous interaction notes.
2. `save_caller_memory`: Persists new caller preference and scheme interests.
3. `search_schemes`: Queries `schemes_db.json` for details on PM-KISAN, Ayushman Bharat, APY, PM JJBY, PM SBY, Sukanya Samriddhi, PM MUDRA, and KCC.
4. `calculate_sip`: Calculates mutual fund SIP future wealth given monthly deposit, annual rate, and tenure.
5. `calculate_emi`: Calculates monthly EMI loan installments given principal, annual interest rate, and tenure.
6. `transfer_to_scheme_specialist`: Executes handoff to the Government Scheme Specialist Agent.
7. `escalate_to_human`: Triggers human agent transfer for complex or out-of-scope inquiries.
8. `log_call_analytics`: Records call summary, duration, sentiment, and resolved topics into SQLite.

---

## 14. Outbound Calling

Jan Sahay supports proactive outbound calling to deliver scheme updates, pension reminders, and financial guidance over telephone lines:

- **Trigger Script**: `backend/src/outbound_call.py`
- **Telephony Agent**: `backend/src/telephony/agent.py` & `dial.py`
- **Workflow**: Initiates a LiveKit SIP call dispatch using `SIP_OUTBOUND_TRUNK_ID` to dial a destination phone number. Once answered, Jan Sahay welcomes the caller with a tailored outbound message (e.g. scheme eligibility notification).

---

## 15. Human Escalation

For scenarios where automated assistance is insufficient or the user demands human intervention:

- **Trigger Tool**: `escalate_to_human(user_id, reason, summary)`
- **Workflow**:
  1. The agent logs an escalation record in the SQLite `escalations` table.
  2. The agent speaks a reassuring transfer message: *"मैं आपकी बात हमारे मानव विशेषज्ञ से जोड़ रहा हूँ..."*
  3. Emits `[HUMAN_ESCALATION]` event to the frontend UI for live agent routing.

---

## 16. Analytics

Calls are logged to enable operational oversight and service quality improvement:

- **Table**: `call_analytics` in SQLite database.
- **Logged Attributes**: `session_id`, `user_id`, `call_duration_seconds`, `sentiment` (Positive/Neutral/Negative), `intent`, `topics_discussed`, `resolution_status` (Resolved/Escalated).
- **Analytics Tool**: `log_call_analytics()` automatically called at session teardown.

---

## 17. Safety and Privacy

Jan Sahay incorporates strict financial guardrails and privacy protections:

- 🔒 **No Sensitive Credentials**: Never requests OTPs, passwords, PINs, or full bank account numbers. If mentioned by the user, the agent immediately redacts and issues a safety warning.
- 🚫 **No Investment Guarantees**: Expressly refuses to promise guaranteed stock market returns or speculative financial advice.
- 🚨 **Fraud Awareness**: Warns users against unauthorized calls asking for money transfers or remote app downloads.
- 🛡️ **PII Protection**: Pre-processes and masks sensitive identity information prior to storage or LLM processing.

---

## 18. Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and `pnpm` (or `npm`)
- Git

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Thirumal143200/murf-livekit-starter.git
   cd murf-livekit-starter
   ```

2. **Set up Backend Environment**:
   ```bash
   cd backend
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate

   pip install -e .
   ```

3. **Set up Frontend Dependencies**:
   ```bash
   cd ../frontend
   pnpm install
   ```

---

## 19. Environment Variables

Copy `.env.example` to `.env.local` in both `backend/` and `frontend/`:

```bash
# Root / Backend environment file (.env.local)

# LiveKit WebRTC Credentials
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here

# Murf AI (TTS) Key
MURF_API_KEY=your_murf_api_key_here

# Deepgram (STT) Key
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Google Gemini (LLM) Key
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL=gemini-3.6-flash
```

> **IMPORTANT**: Never commit `.env` or `.env.local` files containing real API secrets to source control.

---

## 20. How to Run

### Option A: Standard Dev Server Launch

1. **Start Backend Agent**:
   ```bash
   cd backend
   .venv\Scripts\activate
   python src/agent.py dev
   ```

2. **Start Frontend App**:
   ```bash
   cd frontend
   pnpm dev
   ```

3. **Open Application**:
   Navigate to `http://localhost:3000` in your web browser.

### Option B: Windows Automated Script
Run the included PowerShell launch script:
```powershell
.\start_app.ps1
```

---

## 21. How to Test a Conversation

1. Click **Connect** on the frontend interface (`http://localhost:3000`).
2. **Greeting**: Jan Sahay will greet you in Hindi/Hinglish.
3. **Test Memory**: Say *"मेरा नाम रमेश है और मुझे किसान सम्मान निधि के बारे में जानना है।"*
4. **Test Scheme Search**: Ask *"PM KISAN scheme में सालाना कितना पैसा मिलता है?"*
5. **Test Calculator**: Ask *"अगर मैं हर महीने 1000 रुपये SIP में 5 साल तक लगाऊँ तो कितना रिटर्न मिलेगा?"*
6. **Test Specialist Handoff**: Say *"क्या आप मुझे Sarkari Yojna Specialist से कनेक्ट कर सकते हैं?"*
7. **Test Escalation**: Say *"मुझे किसी इंसान से बात करनी है, कॉल ट्रांसफर करो।"*

---

## 22. Screenshots / Interface Views

- **Main Voice View**: Interactive canvas with reactive audio wave visualizer, multilingual transcript drawer, and session status indicators.
- **Transcript Drawer**: Real-time text rendering with active speaker indication and language switching support.
- **Handoff Banner**: Visual notification badge when transitioning to specialist roles or human escalation.
- **Call Analytics Dashboard**: Operational oversight capturing duration, sentiment, user intent, and caller history records.

---

## 23. Challenges and Solutions

| Challenge | Root Cause | Implemented Solution |
|---|---|---|
| High Spoken Latency | Large LLM response generation times and long TTS chunks | Enforced short response limits (< 25 words per turn), set `thinking_budget: 0`, and enabled streaming audio from Murf Falcon TTS. |
| Mixed Hinglish Recognition | Standard STT models struggle with Indian code-switching | Configured Deepgram `nova-3` with `language="multi"` for accurate Hinglish phoneme capture. |
| Memory Across Sessions | Voice agents often forget caller details upon disconnect | Built SQLite persistent storage (`db.py`) executing `lookup_caller()` automatically on participant join. |
| Schema Hallucinations | General LLMs mixing up government scheme criteria | Created authoritative local dataset (`schemes_db.json`) and forced retrieval via `search_schemes()`. |

---

## 24. Future Improvements

- 🌐 **Expanded Regional Dialects**: Add direct voice support for Tamil, Telugu, Marathi, Bengali, and Gujarati.
- 📱 **WhatsApp Voice Note Integration**: Allow citizens to send voice notes via WhatsApp and receive instant voice response audio.
- 📑 **Document Verification OCR**: Integrate vision/OCR tools to let users upload identity documents for scheme eligibility checks.
- 📶 **Low-Bandwidth Offline Voice**: Optimizing lightweight local STT/TTS models for low-connectivity rural areas.

---

## 25. Repository Structure

```
murf-livekit-starter/
├── .env.example                  # Root environment variable template
├── .gitignore                    # Git ignore configuration
├── AGENTS.md                     # Agent development guidelines
├── README.md                     # Main project documentation
├── start_app.ps1                 # Windows automated startup script
├── start_app.sh                  # Linux/macOS startup script
├── docs/                         # Architectural documentation
├── backend/
│   ├── .env.example              # Backend environment template
│   ├── .gitignore                # Backend git ignore
│   ├── pyproject.toml            # Python package & dependencies config
│   ├── caller_data.db            # SQLite database file (ignored in git)
│   ├── src/
│   │   ├── agent.py              # Main Jan Sahay voice agent logic & tools
│   │   ├── db.py                 # SQLite database helper functions
│   │   ├── prompt.py             # System prompt & safety instructions
│   │   ├── specialist_prompts.py # Government scheme specialist prompts
│   │   ├── outbound_call.py      # Outbound call trigger script
│   │   ├── schemes_db.json       # Government schemes database
│   │   └── telephony/
│   │       ├── agent.py          # Telephony SIP voice agent
│   │       └── dial.py           # SIP dialing helper
│   └── tests/
│       └── test_agent.py         # Pytest test suite
└── frontend/
    ├── .env.example              # Frontend environment template
    ├── .gitignore                # Frontend git ignore
    ├── package.json              # Next.js dependencies & scripts
    ├── app/                      # Next.js App Router pages & token API
    ├── components/               # UI components & audio visualizer
    ├── public/                   # Static assets & avatar images
    └── styles/                   # CSS styling files
```

---

## 26. Credits / Challenge

Developed for **10 Days of Voice Agents – VoiceForBharat Edition** by **Murf AI**.

- **Track**: Financial Services
- **Project**: Jan Sahay (जन सहायक)
- **Repository**: [Thirumal143200/murf-livekit-starter](https://github.com/Thirumal143200/murf-livekit-starter.git)
- **Technologies**: Murf AI (Falcon TTS), LiveKit WebRTC, Deepgram Nova-3 STT, Google Gemini 3.6 Flash, Next.js 15.