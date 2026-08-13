'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AgentSessionView_01 } from '@/components/agents-ui/blocks/agent-session-view-01';
import { WelcomeView } from '@/components/app/welcome-view';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(AgentSessionView_01);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const { isConnected, start } = useSessionContext();
  const { resolvedTheme } = useTheme();

  const [isCallEnded, setIsCallEnded] = useState(false);
  const [micError, setMicError] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'schemes' | 'fraud' | 'complaint' | 'escalations' | 'dashboard'>('home');
  const [callDuration, setCallDuration] = useState<number | null>(null);
  const wasConnected = useRef(false);
  const callStartTime = useRef<number | null>(null);

  // Monitor connection lifecycle to detect Call Ended state
  useEffect(() => {
    if (isConnected) {
      wasConnected.current = true;
      setIsCallEnded(false);
      callStartTime.current = Date.now();
    } else if (wasConnected.current && !isConnected) {
      setIsCallEnded(true);
      wasConnected.current = false;
      if (callStartTime.current) {
        const durationSecs = Math.floor((Date.now() - callStartTime.current) / 1000);
        setCallDuration(durationSecs);
      }
    }
  }, [isConnected]);

  // Request/verify mic permissions before starting LiveKit call
  const handleStartCall = async () => {
    setMicError(false);
    try {
      if (typeof window !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }

      // Proceed to start session
      await start();
    } catch (err: any) {
      console.error('Microphone check or session start failed:', err);
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.message?.toLowerCase().includes('permission denied') ||
        err.message?.toLowerCase().includes('allowed')
      ) {
        setMicError(true);
      } else {
        // Fallback to start
        try {
          await start();
        } catch (startErr) {
          console.error('LiveKit connection start failed:', startErr);
        }
      }
    }
  };

  const handleRestartCall = () => {
    setIsCallEnded(false);
    setMicError(false);
    handleStartCall();
  };

  return (
    <AnimatePresence mode="wait">
      {/* Welcome / Tab / Call Ended / Mic Error views */}
      {(!isConnected || micError) && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          startButtonText={appConfig.startButtonText || "Start Voice Assistant"}
          onStartCall={handleStartCall}
          isCallEnded={isCallEnded}
          onRestartCall={handleRestartCall}
          micError={micError}
          onDismissMicError={() => setMicError(false)}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          callDuration={callDuration}
        />
      )}
      {/* Active Session view */}
      {isConnected && !micError && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          supportsChatInput={appConfig.supportsChatInput}
          supportsVideoInput={appConfig.supportsVideoInput}
          supportsScreenShare={appConfig.supportsScreenShare}
          isPreConnectBufferEnabled={appConfig.isPreConnectBufferEnabled}
          audioVisualizerType={appConfig.audioVisualizerType}
          audioVisualizerColor={
            resolvedTheme === 'dark'
              ? appConfig.audioVisualizerColorDark
              : appConfig.audioVisualizerColor
          }
          audioVisualizerColorShift={appConfig.audioVisualizerColorShift}
          audioVisualizerBarCount={appConfig.audioVisualizerBarCount}
          audioVisualizerGridRowCount={appConfig.audioVisualizerGridRowCount}
          audioVisualizerGridColumnCount={appConfig.audioVisualizerGridColumnCount}
          audioVisualizerRadialBarCount={appConfig.audioVisualizerRadialBarCount}
          audioVisualizerRadialRadius={appConfig.audioVisualizerRadialRadius}
          audioVisualizerWaveLineWidth={appConfig.audioVisualizerWaveLineWidth}
          className="fixed inset-0"
        />
      )}
    </AnimatePresence>
  );
}