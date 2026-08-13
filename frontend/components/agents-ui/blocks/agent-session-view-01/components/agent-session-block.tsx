'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, type MotionProps, motion } from 'motion/react';
import {
  useAgent,
  useSessionContext,
  useSessionMessages,
  useLocalParticipant
} from '@livekit/components-react';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { cn } from '@/lib/shadcn/utils';
import { TileLayout } from './tile-view';
import { Shield, Landmark, Wallet, HelpCircle, Loader2, Globe, Lock, Activity, Cpu } from 'lucide-react';

const MotionMessage = motion.create(Shimmer);

// Translations Dictionary for Chat Screen
const CHAT_TRANSLATIONS: Record<string, any> = {
  English: {
    headerTitle: "Jan Sahay",
    headerSubtitle: "Citizen AI Voice Assistant",
    transcriptHeader: "Live Transcript",
    trySayingHeader: "Try saying",
    listeningText: "Listening to your voice...",
    speakingText: "Jan Sahay is speaking...",
    thinkingText: "Processing response...",
    mutedText: "Microphone is turned off",
    idleText: "Connected • Ready to help",
    guideMuted: "Click the microphone button at the bottom of the screen to unmute your microphone.",
    guideActive: "Ask about PM-Kisan, report cyber crimes, verify UPI links, or ask for basic savings guidance.",
    prompts: [
      "How do I report UPI fraud?",
      "Which government schemes am I qualified for?",
      "Explain PM Kisan.",
      "How can I avoid online scams?",
      "What should I do if someone asks for my OTP?"
    ],
    statusConnecting: "Connecting..."
  },
  "Hindi (हिन्दी)": {
    headerTitle: "जन सहाय (Jan Sahay)",
    headerSubtitle: "नागरिक एआई वॉयस असिस्टेंट",
    transcriptHeader: "लाइव ट्रांसक्रिप्ट (बातचीत)",
    trySayingHeader: "बोलकर देखें",
    listeningText: "आपकी आवाज़ सुन रहे हैं...",
    speakingText: "जन सहाय बोल रही है...",
    thinkingText: "प्रतिक्रिया संसाधित की जा रही है...",
    mutedText: "माइक्रोफोन बंद है",
    idleText: "कनेक्टेड • मदद के लिए तैयार",
    guideMuted: "अपने माइक्रोफोन को चालू करने के लिए स्क्रीन के नीचे दिए गए माइक्रोफोन बटन पर क्लिक करें।",
    guideActive: "पीएम-किसान के बारे में पूछें, साइबर अपराध की रिपोर्ट करें, यूपीआई लिंक सत्यापित करें, या बुनियादी बचत सलाह लें।",
    prompts: [
      "मैं यूपीआई धोखाधड़ी की रिपोर्ट कैसे करूं?",
      "मैं किन सरकारी योजनाओं के लिए पात्र हूं?",
      "पीएम किसान के बारे में बताएं।",
      "मैं ऑनलाइन घोटालों से कैसे बच सकता हूं?",
      "अगर कोई मेरा ओटीपी मांगे तो मुझे क्या करना चाहिए?"
    ],
    statusConnecting: "कनेक्ट किया जा रहा है..."
  }
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-transparent pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

function JanSahayAvatar({ state }: { state: string }) {
  let borderColor = 'border-slate-300';
  let glowColor = 'shadow-transparent';

  if (state === 'muted') {
    borderColor = 'border-rose-500';
    glowColor = 'shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-4 ring-rose-500/5';
  } else if (state === 'listening') {
    borderColor = 'border-blue-500';
    glowColor = 'shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-4 ring-blue-500/5';
  } else if (state === 'speaking') {
    borderColor = 'border-emerald-500';
    glowColor = 'shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-4 ring-emerald-500/5';
  } else if (state === 'thinking') {
    borderColor = 'border-amber-500';
    glowColor = 'shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-4 ring-amber-500/5';
  }

  return (
    <div className="relative flex flex-col items-center justify-center my-8 md:my-10">
      {/* Outer soundwave concentric rings */}
      {(state === 'listening' || state === 'speaking' || state === 'muted') && (
        <>
          <div className={cn(
            "absolute w-64 h-64 rounded-full blur-sm opacity-10 animate-ping",
            state === 'muted' ? "bg-rose-500" : state === 'listening' ? "bg-blue-500" : "bg-emerald-500"
          )} style={{ animationDuration: '2.5s' }} />

          <div className={cn(
            "absolute w-72 h-72 rounded-full border border-dashed animate-spin opacity-20",
            state === 'muted' ? "border-rose-500/20" : state === 'listening' ? "border-blue-500/20" : "border-emerald-550/20"
          )} style={{ animationDuration: '20s' }} />
        </>
      )}

      {/* Circular Avatar Wrapper containing the custom uploaded image */}
      <div className={cn(
        "w-48 h-48 rounded-full border-4 bg-white flex items-center justify-center shadow-md transition-all duration-500 overflow-hidden relative z-10",
        borderColor,
        glowColor
      )}>
        <img
          src="/jan_sahay_avatar.jpg"
          alt="Jan Sahay Voice Assistant Avatar"
          className="w-full h-full object-cover rounded-full"
        />

        {/* Loader overlay for processing state */}
        {state === 'thinking' && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

export interface AgentSessionView_01Props {
  preConnectMessage?: string;
  supportsChatInput?: boolean;
  supportsVideoInput?: boolean;
  supportsScreenShare?: boolean;
  isPreConnectBufferEnabled?: boolean;
  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;
  className?: string;
}

export function AgentSessionView_01({
  preConnectMessage = 'Connecting to Jan Sahay Voice Assistant... Please wait.',
  supportsChatInput = true,
  supportsVideoInput = true,
  supportsScreenShare = true,
  isPreConnectBufferEnabled = true,
  audioVisualizerType,
  audioVisualizerColor,
  audioVisualizerColorShift,
  audioVisualizerBarCount,
  audioVisualizerGridRowCount,
  audioVisualizerGridColumnCount,
  audioVisualizerRadialBarCount,
  audioVisualizerRadialRadius,
  audioVisualizerWaveLineWidth,
  ref,
  className,
  ...props
}: React.ComponentProps<'section'> & AgentSessionView_01Props) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { state: agentState } = useAgent();
  const { isMicrophoneEnabled } = useLocalParticipant();

  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const isHindi = selectedLanguage === "Hindi (हिन्दी)";
  const t = isHindi ? CHAT_TRANSLATIONS["Hindi (हिन्दी)"] : CHAT_TRANSLATIONS["English"];

  const controls: AgentControlBarControls = {
    leave: true,
    microphone: true,
    chat: supportsChatInput,
    camera: supportsVideoInput,
    screenShare: supportsScreenShare,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Determine status indicators based on state
  let statusText = t.statusConnecting;
  let statusColorClass = "bg-amber-100 text-amber-800 border-amber-250";
  let displayState = "connecting";

  if (session.isConnected) {
    if (!isMicrophoneEnabled) {
      statusText = t.mutedText;
      statusColorClass = "bg-rose-100 text-rose-800 border-rose-250 animate-pulse";
      displayState = "muted";
    } else if (agentState === 'listening') {
      statusText = t.listeningText;
      statusColorClass = "bg-blue-100 text-blue-800 border-blue-250 animate-pulse";
      displayState = "listening";
    } else if (agentState === 'speaking') {
      statusText = t.speakingText;
      statusColorClass = "bg-emerald-100 text-emerald-805 border-emerald-250";
      displayState = "speaking";
    } else if (agentState === 'thinking') {
      statusText = t.thinkingText;
      statusColorClass = "bg-amber-100 text-amber-808 border-amber-250";
      displayState = "thinking";
    } else {
      statusText = t.idleText;
      statusColorClass = "bg-slate-100 text-slate-700 border-slate-205";
      displayState = "idle";
    }
  }

  return (
    <section
      ref={ref}
      className={cn('bg-[#F1F5F9] text-slate-808 relative z-10 h-full w-full overflow-hidden flex flex-col', className)}
      {...props}
    >
      {/* Top Banner Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#2E7D32] shrink-0" />

      {/* Session Header (Navy Blue Govt Style with dynamic language option) */}
      <header className="bg-[#0F4C81] text-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <h1 className="font-extrabold text-white text-base">{t.headerTitle}</h1>
            <p className="text-[10px] font-medium text-slate-200">{t.headerSubtitle}</p>
          </div>
        </div>

        {/* Telemetry secure indicators */}
        <div className="hidden lg:flex items-center gap-3 text-[10px] text-slate-200 font-bold bg-slate-900/20 px-3 py-1.5 rounded border border-white/10">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-400" /> SSL Encrypted</span>
          <span className="h-3 w-px bg-white/10" />
          <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-400" /> Low Latency</span>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-2.5 py-1 rounded text-xs text-white">
            <Globe className="w-3.5 h-3.5" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent focus:outline-none border-0 p-0 text-xs font-bold cursor-pointer text-white [&>option]:bg-[#0F4C81]"
            >
              <option>English</option>
              <option>Hindi (हिन्दी)</option>
            </select>
          </div>

          {/* Dynamic Status Badge */}
          <div className={cn("px-4 py-1.5 rounded text-xs font-bold border flex items-center gap-2 shadow-xs", statusColorClass)}>
            {displayState === 'connecting' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {statusText}
          </div>
        </div>
      </header>

      {/* Main Content Workspace Split */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-center p-6 gap-6 max-w-7xl mx-auto w-full overflow-hidden relative z-10">

        {/* Left Card: Voice Box Activator Panel */}
        <div className="flex-1 flex flex-col items-center justify-between text-center bg-white rounded border border-slate-200 shadow-sm p-6 sm:p-8">

          {/* Top warning stats */}
          {!isMicrophoneEnabled && (
            <div className="bg-rose-50 border border-rose-200 rounded p-3 text-rose-900 text-xs font-bold leading-relaxed w-full">
              ⚠️ {t.guideMuted}
            </div>
          )}

          <JanSahayAvatar state={displayState} />

          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
              {displayState === 'speaking' ? t.speakingText : displayState === 'listening' ? t.listeningText : displayState === 'muted' ? t.mutedText : t.statusConnecting}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-normal max-w-sm mx-auto font-semibold">
              {displayState === 'muted' ? t.guideMuted : t.guideActive}
            </p>
          </div>

          {/* Example prompt pills list */}
          <div className="mt-6 border-t border-slate-100 pt-5 w-full max-w-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-left">{t.trySayingHeader}</p>
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
              {t.prompts.map((p: string, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 rounded px-3.5 py-2.5 text-xs text-left text-slate-700 font-bold transition-colors cursor-pointer flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#0F4C81] shrink-0" />
                  <span>"{p}"</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: High-Contrast Transcript */}
        <div className="flex-1 flex flex-col bg-white rounded border border-slate-200 shadow-sm overflow-hidden relative">

          {/* Transcript title section */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t.transcriptHeader}</span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0F4C81]">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Transcript lines list */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <AgentChatTranscript
              agentState={agentState}
              messages={messages}
              className="mx-auto w-full [&_.is-user>div]:bg-slate-100 [&_.is-user>div]:border-slate-250 [&_.is-user>div]:text-slate-900 [&_.is-user>div]:rounded-lg [&_.is-user>div]:shadow-xs [&_.is-assistant>div]:bg-sky-50 [&_.is-assistant>div]:border-sky-150 [&_.is-assistant>div]:text-slate-900 [&_.is-assistant>div]:rounded-lg [&_.is-assistant>div]:shadow-xs [&>div>div]:px-0 [&>div>div]:pt-2"
            />
          </div>
        </div>
      </div>

      {/* Control Area Panel */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 shrink-0 flex items-center justify-center shadow-xs relative z-10">
        <div className="w-full max-w-xl">
          <AgentControlBar
            variant="livekit"
            controls={controls}
            isChatOpen={chatOpen}
            isConnected={session.isConnected}
            onDisconnect={session.end}
            onIsChatOpenChange={setChatOpen}
          />
        </div>
      </footer>
    </section>
  );
}