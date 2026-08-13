"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface CallStats {
  total: number;
  successful: number;
  failed: number;
}

function AnimatedCounter({ value, duration = 1800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) return;

    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        prevValue.current = end;
      }
    }

    requestAnimationFrame(tick);
  }, [value, duration]);

  return <>{display.toLocaleString("en-US")}</>;
}

function getSuccessRate(successful: number, total: number): string {
  if (total === 0) return "0.0%";
  return (successful / total * 100).toFixed(1) + "%";
}

function getFailRate(failed: number, total: number): string {
  if (total === 0) return "0.0%";
  return (failed / total * 100).toFixed(1) + "%";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<CallStats>({ total: 0, successful: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("—");

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const data: CallStats = await res.json();
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Failed to fetch dashboard stats:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const cards = [
    {
      label: "Total Calls",
      value: stats.total,
      badge: "All channels combined",
      badgeIcon: "📊",
      icon: "📞",
      accentClass: "from-blue-500/20 to-blue-600/10",
      iconBg: "bg-blue-500/15",
      valueColor: "text-blue-400",
      badgeBg: "bg-blue-500/10 text-blue-400",
      dotColor: "bg-blue-400",
      glowColor: "hover:shadow-blue-500/20",
      borderColor: "hover:border-blue-500/30",
    },
    {
      label: "Successful Calls",
      value: stats.successful,
      badge: `${getSuccessRate(stats.successful, stats.total)} success rate`,
      badgeIcon: "✓",
      icon: "✅",
      accentClass: "from-emerald-500/20 to-emerald-600/10",
      iconBg: "bg-emerald-500/15",
      valueColor: "text-emerald-400",
      badgeBg: "bg-emerald-500/10 text-emerald-400",
      dotColor: "bg-emerald-400",
      glowColor: "hover:shadow-emerald-500/20",
      borderColor: "hover:border-emerald-500/30",
    },
    {
      label: "Failed Calls",
      value: stats.failed,
      badge: `${getFailRate(stats.failed, stats.total)} failure rate`,
      badgeIcon: "⚠",
      icon: "❌",
      accentClass: "from-red-500/20 to-red-600/10",
      iconBg: "bg-red-500/15",
      valueColor: "text-red-400",
      badgeBg: "bg-red-500/10 text-red-400",
      dotColor: "bg-red-400",
      glowColor: "hover:shadow-red-500/20",
      borderColor: "hover:border-red-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#111538] to-[#1a1040] flex flex-col items-center relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed top-[-150px] left-[-100px] w-[600px] h-[600px] rounded-full bg-blue-500/[0.08] blur-[120px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full bg-red-500/[0.06] blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />

      {/* Header */}
      <header className="relative z-10 text-center pt-14 pb-4 px-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <a
            href="/"
            className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm font-medium"
          >
            ← Back to Agent
          </a>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent">
          Jan Sahay Dashboard
        </h1>
        <p className="text-slate-400/70 text-sm mt-2 font-light">
          Real-time voice agent call performance
        </p>
      </header>

      {/* Metric Cards */}
      <main className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-8 w-full max-w-4xl">
        {cards.map((card) => (
          <article
            key={card.label}
            className={`
              group relative rounded-2xl p-6
              bg-white/[0.04] backdrop-blur-xl
              border border-white/[0.08]
              shadow-lg shadow-black/20
              transition-all duration-300 ease-out
              hover:translate-y-[-4px] hover:scale-[1.02]
              hover:shadow-2xl ${card.glowColor} ${card.borderColor}
            `}
          >
            {/* Top: icon + status dot */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${card.iconBg}`}>
                {card.icon}
              </div>
              <span className={`w-2.5 h-2.5 rounded-full ${card.dotColor} animate-pulse`} />
            </div>

            {/* Label */}
            <span className="text-xs font-medium text-slate-400/80 uppercase tracking-wider">
              {card.label}
            </span>

            {/* Value */}
            <div className={`text-4xl font-extrabold tracking-tighter mt-2 mb-3 ${card.valueColor} tabular-nums`}>
              {loading ? (
                <span className="inline-block w-20 h-10 rounded-lg bg-white/5 animate-pulse" />
              ) : (
                <AnimatedCounter value={card.value} />
              )}
            </div>

            {/* Badge */}
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${card.badgeBg}`}>
              {card.badgeIcon} {card.badge}
            </span>
          </article>
        ))}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-slate-500/60 text-xs">
        Last updated · {lastUpdated}
        <span className="mx-2">·</span>
        Auto-refreshes every 30s
      </footer>
    </div>
  );
}
