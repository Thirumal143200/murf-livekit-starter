# Jan Sahayak (जन सहायक) — Visual Screenshots & User Interface

This folder contains UI screenshot references and visual component documentation for the Jan Sahayak multilingual voice companion interface.

## Interface Components

### 1. Main Welcome Screen & Avatar
- **Avatar Asset**: `frontend/public/jan-sahay-avatar.png`
- **Features**: Clean dark mode landing view with interactive audio session initialization button and branded Murf AI + LiveKit indicators.

### 2. Live Audio Visualizer
- **Component**: `@agents-ui/agent-audio-visualizer-bar` / `wave` / `aura`
- **Features**: Real-time reactive audio frequency bar visualizer during active voice conversations.

### 3. Real-Time Transcript & Handoff Banner
- **Component**: `@agents-ui/agent-chat-transcript`
- **Features**: Live streaming text transcripts with dynamic agent handoff banners when transferring conversation context to the **Government Scheme Specialist Agent** or triggering **Human Escalation**.

### 4. Call Control Bar
- **Component**: `@agents-ui/agent-control-bar`
- **Features**: Toggle microphone, mute/unmute, disconnect call, and view session status.

---

*System Architecture Diagram available at [docs/architecture.png](../architecture.png)*
