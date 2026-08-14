'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, type MotionProps, motion } from 'motion/react';
import {
  useAgent,
  useSessionContext,
  useSessionMessages,
  useLocalParticipant,
  useChat
} from '@livekit/components-react';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { cn } from '@/lib/shadcn/utils';
import { TileLayout } from './tile-view';
import {
  Shield,
  Landmark,
  Wallet,
  HelpCircle,
  Loader2,
  Globe,
  Lock,
  Activity,
  Cpu,
  ShieldAlert,
  TrendingUp,
  Briefcase,
  Sprout,
  ArrowRight
} from 'lucide-react';

const MotionMessage = motion.create(Shimmer);

// Translations Dictionary for Chat Screen
const CHAT_TRANSLATIONS: Record<string, any> = {
  English: {
    headerTitle: "Jan Sahay",
    headerSubtitle: "Citizen AI Voice Assistant",
    transcriptHeader: "Live Transcript",
    trySayingHeader: "Try saying",
    specialistHeader: "Connect to Specialist Guide",
    listeningText: "Listening to your voice...",
    speakingText: "Jan Sahay is speaking...",
    thinkingText: "Processing response...",
    mutedText: "Microphone is turned off",
    idleText: "Connected • Ready to help",
    guideMuted: "Click the microphone button at the bottom of the screen to unmute your microphone.",
    guideActive: "Ask about PM-Kisan, report cyber crimes, verify UPI links, or connect with a specialist below.",
    prompts: [
      "I was scammed on UPI, help me freeze my account!",
      "How much pension will I get under Atal Pension Yojana?",
      "Can I get a 5 Lakh Mudra business loan without collateral?",
      "My paddy crop was damaged by heavy rain, how to claim insurance?"
    ],
    statusConnecting: "Connecting..."
  },
  "Hindi (हिन्दी)": {
    headerTitle: "जन सहाय (Jan Sahay)",
    headerSubtitle: "नागरिक एआई वॉयस असिस्टेंट",
    transcriptHeader: "लाइव ट्रांसक्रिप्ट (बातचीत)",
    trySayingHeader: "बोलकर देखें",
    specialistHeader: "सीधे विशेषज्ञ से कनेक्ट करें",
    listeningText: "आपकी आवाज़ सुन रहे हैं...",
    speakingText: "जन सहाय बोल रही है...",
    thinkingText: "प्रतिक्रिया संसाधित की जा रही है...",
    mutedText: "माइक्रोफोन बंद है",
    idleText: "कनेक्टेड • मदद के लिए तैयार",
    guideMuted: "अपने माइक्रोफोन को चालू करने के लिए स्क्रीन के नीचे दिए गए माइक्रोफोन बटन पर क्लिक करें।",
    guideActive: "सरकारी योजनाओं के बारे में पूछें, साइबर फ्रॉड रिपोर्ट करें, या नीचे दिए गए विशेषज्ञ से जुड़ें।",
    prompts: [
      "मेरे साथ यूपीआई फ्रॉड हो गया है, तुरंत मदद करें!",
      "अटल पेंशन योजना में मुझे कितनी पेंशन मिलेगी?",
      "क्या मुझे 5 लाख का मुद्रा लोन बिना गारंटी मिल सकता है?",
      "बारिश से मेरी धान की फसल खराब हो गई है, क्लेम कैसे मिलेगा?"
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

function JanSahayAvatar({
  state,
  activeSpecialist
}: {
  state: string;
  activeSpecialist: 'general' | 'fraud' | 'pension' | 'loan' | 'agri'
}) {
  let borderColor = 'border-slate-300';
  let glowColor = 'shadow-transparent';

  if (state === 'muted') {
    borderColor = 'border-rose-500';
    glowColor = 'shadow-[0_0_24px_rgba(244,63,94,0.35)] ring-4 ring-rose-500/10';
  } else if (state === 'listening') {
    borderColor = 'border-blue-500';
    glowColor = 'shadow-[0_0_24px_rgba(59,130,246,0.35)] ring-4 ring-blue-500/10';
  } else if (state === 'speaking') {
    borderColor = 'border-emerald-500';
    glowColor = 'shadow-[0_0_24px_rgba(16,185,129,0.35)] ring-4 ring-emerald-500/10';
  } else if (state === 'thinking') {
    borderColor = 'border-amber-500';
    glowColor = 'shadow-[0_0_24px_rgba(245,158,11,0.35)] ring-4 ring-amber-500/10';
  }

  // Specialist badge metadata
  const specialistMeta = {
    general: { title: "Jan Sahay Chief Assistant", icon: "🏛️", badgeClass: "bg-sky-100 text-[#0F4C81] border-sky-300" },
    fraud: { title: "Cyber Safety & Fraud Recovery Specialist", icon: "🛡️", badgeClass: "bg-rose-100 text-rose-900 border-rose-300" },
    pension: { title: "Pension & Retirement Specialist", icon: "📈", badgeClass: "bg-indigo-100 text-indigo-900 border-indigo-300" },
    loan: { title: "Business Loan & Micro-Credit Specialist", icon: "💼", badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300" },
    agri: { title: "Agri-Financial & Crop Specialist", icon: "🌾", badgeClass: "bg-amber-100 text-amber-900 border-amber-300" },
  }[activeSpecialist];

  return (
    <div className="flex flex-col items-center justify-center my-3">
      {/* Active Specialist Tag Pill */}
      <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold shadow-2xs mb-2 transition-all duration-300", specialistMeta.badgeClass)}>
        <span>{specialistMeta.icon}</span>
        <span>{specialistMeta.title}</span>
      </div>

      <div className="relative flex items-center justify-center">
        {/* Outer Pulse Rings */}
        {state === 'speaking' && (
          <div className="absolute w-32 h-32 rounded-full bg-emerald-500/25 animate-ping" />
        )}
        {state === 'listening' && (
          <div className="absolute w-32 h-32 rounded-full bg-blue-500/25 animate-pulse" />
        )}
        {state === 'thinking' && (
          <div className="absolute w-32 h-32 rounded-full bg-amber-500/25 animate-spin" />
        )}

        {/* Main Avatar Photo of Jan Sahay / Specialist */}
        <div className={cn(
          "w-28 h-28 rounded-full border-4 overflow-hidden bg-white transition-all duration-300 shadow-lg relative z-10",
          borderColor,
          glowColor
        )}>
          <img
            src="/jan_sahay_avatar.jpg"
            alt={specialistMeta.title}
            className="w-full h-full object-cover object-top"
          />
          {/* Bottom Floating Specialist Icon Badge */}
          <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-sm">
            {specialistMeta.icon}
          </div>
        </div>
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
  const { send: sendChatMessage } = useChat();
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

  // Automatically detect the active specialist from message stream or default to general
  let activeSpecialist: 'general' | 'fraud' | 'pension' | 'loan' | 'agri' = 'general';
  for (const m of messages) {
    if (m.from?.isLocal !== true) {
      const lower = m.message.toLowerCase();
      if (lower.includes('cyber safety') || lower.includes('fraud recovery') || lower.includes('cybercrime') || lower.includes('साइबर सुरक्षा')) {
        activeSpecialist = 'fraud';
      } else if (lower.includes('pension specialist') || lower.includes('atal pension') || lower.includes('पेंशन विशेषज्ञ')) {
        activeSpecialist = 'pension';
      } else if (lower.includes('business loan') || lower.includes('mudra') || lower.includes('svanidhi') || lower.includes('मुद्रा')) {
        activeSpecialist = 'loan';
      } else if (lower.includes('crop specialist') || lower.includes('fasal bima') || lower.includes('pm-kisan') || lower.includes('कृषि विशेषज्ञ')) {
        activeSpecialist = 'agri';
      }
    }
  }

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handler to connect to a specialist directly via button click
  const handleConnectSpecialist = async (specialistType: 'fraud' | 'pension' | 'loan' | 'agri') => {
    const prompts: Record<string, { en: string; hi: string }> = {
      fraud: {
        en: "I need immediate help with an online cyber fraud / UPI scam. Please connect me to the Cyber Safety & Fraud Recovery Specialist.",
        hi: "मेरे साथ वित्तीय फ्रॉड हुआ है। कृपया मुझे तुरंत साइबर सुरक्षा एवं फ्रॉड रिकवरी विशेषज्ञ से कनेक्ट करें।"
      },
      pension: {
        en: "I want to calculate my pension contributions. Please connect me to the Pension & Retirement Specialist.",
        hi: "मुझे अटल पेंशन योजना के बारे में जानना है। कृपया मुझे पेंशन एवं रिटायरमेंट विशेषज्ञ से कनेक्ट करें।"
      },
      loan: {
        en: "I need guidance on a PM Mudra business loan. Please connect me to the Business Loan & Micro-Credit Specialist.",
        hi: "मुझे व्यापार के लिए मुद्रा लोन चाहिए। कृपया मुझे व्यवसाय ऋण विशेषज्ञ से कनेक्ट करें।"
      },
      agri: {
        en: "I need assistance with PM-KISAN and Crop Insurance damage claims. Please connect me to the Agri-Financial Specialist.",
        hi: "मेरी फसल का नुकसान हुआ है। कृपया मुझे कृषि-वित्तीय एवं फसल बीमा विशेषज्ञ से कनेक्ट करें।"
      }
    };

    const textToSend = isHindi ? prompts[specialistType].hi : prompts[specialistType].en;
    if (sendChatMessage) {
      try {
        await sendChatMessage(textToSend);
      } catch (err) {
        console.error("Failed to send specialist connect message:", err);
      }
    }
  };

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
      if (activeSpecialist === 'fraud') {
        statusText = isHindi ? "साइबर सुरक्षा विशेषज्ञ बोल रहे हैं..." : "Cyber Safety Specialist is speaking...";
      } else if (activeSpecialist === 'pension') {
        statusText = isHindi ? "पेंशन विशेषज्ञ बोल रहे हैं..." : "Pension Specialist is speaking...";
      } else if (activeSpecialist === 'loan') {
        statusText = isHindi ? "व्यवसाय ऋण विशेषज्ञ बोल रहे हैं..." : "Business Loan Specialist is speaking...";
      } else if (activeSpecialist === 'agri') {
        statusText = isHindi ? "कृषि विशेषज्ञ बोल रहे हैं..." : "Agri-Financial Specialist is speaking...";
      } else {
        statusText = t.speakingText;
      }
      statusColorClass = "bg-emerald-100 text-emerald-800 border-emerald-250";
      displayState = "speaking";
    } else if (agentState === 'thinking') {
      if (activeSpecialist === 'fraud') {
        statusText = isHindi ? "साइबर सुरक्षा विशेषज्ञ मार्गदर्शन तैयार कर रहे हैं..." : "Cyber Safety Specialist is formulating guidance...";
      } else if (activeSpecialist === 'pension') {
        statusText = isHindi ? "पेंशन विशेषज्ञ मार्गदर्शन तैयार कर रहे हैं..." : "Pension Specialist is formulating guidance...";
      } else if (activeSpecialist === 'loan') {
        statusText = isHindi ? "व्यवसाय ऋण विशेषज्ञ मार्गदर्शन तैयार कर रहे हैं..." : "Business Loan Specialist is formulating guidance...";
      } else if (activeSpecialist === 'agri') {
        statusText = isHindi ? "कृषि विशेषज्ञ मार्गदर्शन तैयार कर रहे हैं..." : "Agri-Financial Specialist is formulating guidance...";
      } else {
        statusText = t.thinkingText;
      }
      statusColorClass = "bg-amber-100 text-amber-800 border-amber-250";
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
      className={cn('bg-[#F1F5F9] text-slate-800 relative z-10 h-full w-full overflow-hidden flex flex-col', className)}
      {...props}
    >
      {/* Top Banner Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#2E7D32] shrink-0" />

      {/* Session Header */}
      <header className="bg-[#0F4C81] text-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/40 shadow-xs shrink-0 bg-white">
            <img src="/jan_sahay_avatar.jpg" alt="Jan Sahay" className="w-full h-full object-cover object-top" />
          </div>
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
        <div className="flex-1 flex flex-col items-center justify-between text-center bg-white rounded border border-slate-200 shadow-sm p-6 sm:p-8 overflow-y-auto">

          {/* Top warning stats */}
          {!isMicrophoneEnabled && (
            <div className="bg-rose-50 border border-rose-200 rounded p-3 text-rose-900 text-xs font-bold leading-relaxed w-full mb-3">
              ⚠️ {t.guideMuted}
            </div>
          )}

          {/* Avatar with Dynamic Specialist Badge & Theme */}
          <JanSahayAvatar state={displayState} activeSpecialist={activeSpecialist} />

          <div className="space-y-1.5 max-w-md">
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
              {displayState === 'speaking' ? t.speakingText : displayState === 'listening' ? t.listeningText : displayState === 'muted' ? t.mutedText : t.statusConnecting}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-normal max-w-sm mx-auto font-semibold">
              {displayState === 'muted' ? t.guideMuted : t.guideActive}
            </p>
          </div>

          {/* Direct Specialist Connect Buttons (Click to Connect) */}
          <div className="mt-5 w-full max-w-md border-t border-slate-100 pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-left flex items-center justify-between">
              <span>{t.specialistHeader}</span>
              <span className="text-[9px] text-[#0F4C81] font-extrabold">One-Click Handoff</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleConnectSpecialist('fraud')}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded border text-xs font-bold text-left transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer",
                  activeSpecialist === 'fraud'
                    ? "bg-rose-100 border-rose-400 text-rose-950 ring-2 ring-rose-500/20"
                    : "bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100"
                )}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="truncate">{isHindi ? 'साइबर फ्रॉड विशेषज्ञ' : 'Cyber Fraud Specialist'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleConnectSpecialist('pension')}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded border text-xs font-bold text-left transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer",
                  activeSpecialist === 'pension'
                    ? "bg-indigo-100 border-indigo-400 text-indigo-950 ring-2 ring-indigo-500/20"
                    : "bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100"
                )}
              >
                <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">{isHindi ? 'पेंशन विशेषज्ञ (APY)' : 'Pension Specialist'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleConnectSpecialist('loan')}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded border text-xs font-bold text-left transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer",
                  activeSpecialist === 'loan'
                    ? "bg-emerald-100 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/20"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100"
                )}
              >
                <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{isHindi ? 'मुद्रा लोन विशेषज्ञ' : 'Business Loan Specialist'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleConnectSpecialist('agri')}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded border text-xs font-bold text-left transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer",
                  activeSpecialist === 'agri'
                    ? "bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-500/20"
                    : "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100"
                )}
              >
                <Sprout className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">{isHindi ? 'फसल बीमा विशेषज्ञ' : 'Crop Specialist'}</span>
              </button>
            </div>
          </div>

          {/* Example prompt pills list */}
          <div className="mt-4 border-t border-slate-100 pt-3.5 w-full max-w-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-left">{t.trySayingHeader}</p>
            <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1">
              {t.prompts.map((p: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => sendChatMessage && sendChatMessage(p)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 rounded px-3 py-1.5 text-xs text-left text-slate-700 font-bold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#0F4C81] shrink-0" />
                  <span className="truncate">"{p}"</span>
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
              className="mx-auto w-full [&>div>div]:px-0 [&>div>div]:pt-2"
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