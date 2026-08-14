'use client';

import { type ComponentProps } from 'react';
import { AnimatePresence } from 'motion/react';
import { type AgentState, type ReceivedMessage } from '@livekit/components-react';
import { AgentChatIndicator } from '@/components/agents-ui/agent-chat-indicator';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { MessageResponse } from '@/components/ai-elements/message';
import { ArrowRightLeft, User, Shield, TrendingUp, Briefcase, Sprout, ShieldAlert, LogOut, LogIn } from 'lucide-react';

/**
 * Props for the AgentChatTranscript component.
 */
export interface AgentChatTranscriptProps extends ComponentProps<'div'> {
  /**
   * The current state of the agent. When 'thinking', displays a loading indicator.
   */
  agentState?: AgentState;
  /**
   * Array of messages to display in the transcript.
   * @defaultValue []
   */
  messages?: ReceivedMessage[];
  /**
   * Additional CSS class names to apply to the conversation container.
   */
  className?: string;
}

const SPEAKER_NAMES: Record<string, string> = {
  general: 'Jan Sahay',
  fraud: 'Cyber Safety & Fraud Recovery Specialist',
  pension: 'Pension & Retirement Specialist',
  loan: 'Business Loan & Micro-Credit Specialist',
  agri: 'Agri-Financial & Crop Insurance Specialist',
};

/**
 * Helper to identify the assistant specialist persona from message content and detect specialist join & leave events.
 */
function inspectMessagePersona(
  messageText: string,
  currentSpeaker: string
): {
  speakerDisplayName: string;
  speakerBadgeText: string;
  speakerIcon: string;
  badgeBg: string;
  handoffEvents?: {
    leftText: string;
    joinedText: string;
  };
  nextSpeaker: string;
} {
  const lower = messageText.toLowerCase();

  let targetSpeaker = currentSpeaker;

  if (
    lower.includes('cyber safety') ||
    lower.includes('fraud recovery') ||
    lower.includes('cybercrime') ||
    lower.includes('साइबर सुरक्षा') ||
    lower.includes('फ्रॉड')
  ) {
    targetSpeaker = 'fraud';
  } else if (
    lower.includes('pension specialist') ||
    lower.includes('atal pension') ||
    lower.includes('पेंशन विशेषज्ञ') ||
    lower.includes('अटल पेंशन')
  ) {
    targetSpeaker = 'pension';
  } else if (
    lower.includes('business loan') ||
    lower.includes('mudra') ||
    lower.includes('svanidhi') ||
    lower.includes('मुद्रा') ||
    lower.includes('व्यवसाय ऋण')
  ) {
    targetSpeaker = 'loan';
  } else if (
    lower.includes('crop specialist') ||
    lower.includes('fasal bima') ||
    lower.includes('pm-kisan') ||
    lower.includes('kisan credit') ||
    lower.includes('कृषि विशेषज्ञ') ||
    lower.includes('फसल बीमा')
  ) {
    targetSpeaker = 'agri';
  }

  const isSwitching = targetSpeaker !== currentSpeaker && targetSpeaker !== 'general';
  const handoffEvents = isSwitching
    ? {
      leftText: `${SPEAKER_NAMES[currentSpeaker] || 'Jan Sahay'} left the conversation`,
      joinedText: `${SPEAKER_NAMES[targetSpeaker]} joined the consultation`,
    }
    : undefined;

  if (targetSpeaker === 'fraud') {
    return {
      speakerDisplayName: 'Cyber Safety & Fraud Specialist',
      speakerBadgeText: 'Fraud Specialist',
      speakerIcon: '🛡️',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      handoffEvents,
      nextSpeaker: 'fraud',
    };
  }

  if (targetSpeaker === 'pension') {
    return {
      speakerDisplayName: 'Pension & Retirement Specialist',
      speakerBadgeText: 'Pension Specialist',
      speakerIcon: '📈',
      badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      handoffEvents,
      nextSpeaker: 'pension',
    };
  }

  if (targetSpeaker === 'loan') {
    return {
      speakerDisplayName: 'Business Loan & Micro-Credit Specialist',
      speakerBadgeText: 'Loan Specialist',
      speakerIcon: '💼',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      handoffEvents,
      nextSpeaker: 'loan',
    };
  }

  if (targetSpeaker === 'agri') {
    return {
      speakerDisplayName: 'Agri-Financial & Crop Specialist',
      speakerBadgeText: 'Agri Specialist',
      speakerIcon: '🌾',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      handoffEvents,
      nextSpeaker: 'agri',
    };
  }

  return {
    speakerDisplayName: 'Jan Sahay Assistant',
    speakerBadgeText: 'Chief Assistant',
    speakerIcon: '🏛️',
    badgeBg: 'bg-sky-100 text-[#0F4C81] border-sky-300',
    handoffEvents,
    nextSpeaker: currentSpeaker,
  };
}

/**
 * A chat transcript component that displays conversation messages with high-contrast black text,
 * timestamps, join and leave notices, and specialist thinking indicators.
 */
export function AgentChatTranscript({
  agentState,
  messages = [],
  className,
  ...props
}: AgentChatTranscriptProps) {
  let trackedSpeaker = 'general';

  // Determine active speaker thinking label and styling
  for (const m of messages) {
    if (m.from?.isLocal !== true) {
      const lower = m.message.toLowerCase();
      if (lower.includes('cyber safety') || lower.includes('fraud recovery') || lower.includes('cybercrime') || lower.includes('साइबर सुरक्षा')) {
        trackedSpeaker = 'fraud';
      } else if (lower.includes('pension specialist') || lower.includes('atal pension') || lower.includes('पेंशन विशेषज्ञ')) {
        trackedSpeaker = 'pension';
      } else if (lower.includes('business loan') || lower.includes('mudra') || lower.includes('svanidhi') || lower.includes('मुद्रा')) {
        trackedSpeaker = 'loan';
      } else if (lower.includes('crop specialist') || lower.includes('fasal bima') || lower.includes('pm-kisan') || lower.includes('कृषि विशेषज्ञ')) {
        trackedSpeaker = 'agri';
      }
    }
  }

  const thinkingMeta = {
    general: { text: "Jan Sahay is formulating guidance...", icon: "🏛️", cls: "bg-sky-50 text-[#0F4C81] border-sky-200" },
    fraud: { text: "Cyber Safety Specialist is formulating guidance...", icon: "🛡️", cls: "bg-rose-50 text-rose-900 border-rose-300" },
    pension: { text: "Pension Specialist is formulating guidance...", icon: "📈", cls: "bg-indigo-50 text-indigo-900 border-indigo-300" },
    loan: { text: "Business Loan Specialist is formulating guidance...", icon: "💼", cls: "bg-emerald-50 text-emerald-900 border-emerald-300" },
    agri: { text: "Agri-Financial Specialist is formulating guidance...", icon: "🌾", cls: "bg-amber-50 text-amber-900 border-amber-300" },
  }[trackedSpeaker as 'general' | 'fraud' | 'pension' | 'loan' | 'agri'] || { text: "Jan Sahay is formulating guidance...", icon: "🏛️", cls: "bg-sky-50 text-[#0F4C81] border-sky-200" };

  return (
    <Conversation className={className} {...props}>
      <ConversationContent>
        {/* Initial Conversation Start Notifications */}
        <div className="flex flex-col items-center justify-center gap-2 my-3 text-center">
          {/* User Start Notice */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>👤 You started the conversation</span>
          </div>

          {/* Primary Agent Join Notice with Avatar */}
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-300 text-[#0F4C81] text-[11px] font-extrabold px-3.5 py-1.5 rounded-full shadow-2xs">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-[#0F4C81]/30 shrink-0 bg-white">
              <img src="/jan_sahay_avatar.jpg" alt="Jan Sahay" className="w-full h-full object-cover object-top" />
            </div>
            <span>Jan Sahay AI Assistant connected</span>
          </div>
        </div>

        {/* Message Stream */}
        {messages.map((receivedMessage) => {
          const { id, timestamp, from, message } = receivedMessage;
          const locale = typeof navigator !== 'undefined' ? navigator.language ?? 'en-US' : 'en-US';
          const isUser = from?.isLocal === true;
          const time = new Date(timestamp);
          const timeStr = time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          let handoffEvents: { leftText: string; joinedText: string } | undefined;
          let persona = inspectMessagePersona(message, trackedSpeaker);

          if (!isUser) {
            handoffEvents = persona.handoffEvents;
            trackedSpeaker = persona.nextSpeaker;
          }

          return (
            <div key={id} className="flex flex-col gap-1 w-full my-2">
              {/* Specialist Leave & Join Announcement Banners */}
              {handoffEvents && (
                <div className="flex flex-col items-center justify-center gap-2 my-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Previous Agent Left Event */}
                  <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span>🔴 {handoffEvents.leftText}</span>
                  </div>

                  {/* New Specialist Joined Event */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 text-emerald-950 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full shadow-xs">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-emerald-500 shrink-0 bg-white">
                      <img src="/jan_sahay_avatar.jpg" alt="Specialist" className="w-full h-full object-cover object-top" />
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>🟢 {handoffEvents.joinedText}</span>
                  </div>
                </div>
              )}

              {/* Message Header indicating who is speaking */}
              {isUser ? (
                <div className="flex items-center justify-end gap-1.5 px-1 text-[11px] font-extrabold text-slate-700">
                  <span>👤 You</span>
                  <span className="text-[10px] font-normal text-slate-400">({timeStr})</span>
                </div>
              ) : (
                <div className="flex items-center justify-start gap-2 px-1 text-[11px] font-extrabold text-slate-900">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-300 shrink-0 bg-white shadow-2xs">
                    <img src="/jan_sahay_avatar.jpg" alt="Assistant" className="w-full h-full object-cover object-top" />
                  </div>
                  <span>{persona.speakerDisplayName}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${persona.badgeBg}`}>
                    {persona.speakerBadgeText}
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">({timeStr})</span>
                </div>
              )}

              {/* Message Bubble with Crisp High-Contrast Black Text */}
              <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                {isUser ? (
                  <div className="max-w-[85%] bg-[#0F4C81] text-white font-medium px-4 py-3 rounded-2xl rounded-tr-xs shadow-sm text-sm leading-relaxed [&_*]:text-white [&_p]:text-white [&_p]:mb-0 select-text">
                    <MessageResponse className="text-white font-medium [&_*]:text-white [&_p]:text-white">{message}</MessageResponse>
                  </div>
                ) : (
                  <div className="max-w-[90%] bg-white border-2 border-slate-300 text-slate-950 font-medium px-4 py-3 rounded-2xl rounded-tl-xs shadow-sm text-sm leading-relaxed [&_*]:text-slate-950 [&_p]:text-slate-950 [&_p]:mb-0 [&_strong]:text-black [&_strong]:font-bold select-text">
                    <MessageResponse className="text-slate-950 font-medium [&_*]:text-slate-950 [&_p]:text-slate-950">{message}</MessageResponse>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Dynamic Specialist Thinking Indicator */}
        <AnimatePresence>
          {agentState === 'thinking' && (
            <div className={`flex items-center gap-2.5 text-xs font-bold border px-3.5 py-2 rounded-lg my-2 w-fit shadow-2xs animate-in fade-in duration-200 ${thinkingMeta.cls}`}>
              <div className="w-4 h-4 rounded-full overflow-hidden border border-current/30 shrink-0 bg-white">
                <img src="/jan_sahay_avatar.jpg" alt="Specialist" className="w-full h-full object-cover object-top" />
              </div>
              <AgentChatIndicator size="sm" />
              <span>{thinkingMeta.text}</span>
            </div>
          )}
        </AnimatePresence>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}