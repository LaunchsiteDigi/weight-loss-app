"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { type RegisterActionState, register } from "./(auth)/actions";
import { useActionState } from "react";
import { toast } from "@/components/chat/toast";

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
];

const C = {
  sage: "#8BA888",
  sageDark: "#6E8E6A",
  sageMid: "#9DBF98",
  sagePale: "#DDE8DA",
  sageFaint: "#EFF3ED",
  sageXFaint: "#F6F8F5",
  bg: "#FAFAF7",
  text: "#1A1A18",
  textMuted: "#6B6B65",
  textFaint: "#A3A39D",
  border: "#E5E5DF",
  white: "#FFFFFF",
};

const CONVERSATIONS = [
  { user: "Had a chicken salad for lunch", bot: "Logged! 420 cal — you're at 1,180 for today. Right on track!" },
  { user: "Just took my Ozempic shot, 0.5mg", bot: "Logged! Next dose is due Sunday, Jan 19. I'll remind you the morning of." },
  { user: "Did 30 min on the treadmill, incline 6", bot: "Nice! ~320 cal burned. That's 4 cardio sessions this week — you're crushing it." },
  { user: "Hit 185 on bench press today, new PR!", bot: "New personal record! You're up 15 lbs since last month. Strength is trending up." },
  { user: "Feeling nauseous after my shot, is that normal?", bot: "Nausea is common early on with GLP-1s. Eat smaller meals, stay hydrated, and it usually fades in a few days." },
  { user: "Am I getting enough protein?", bot: "You've averaged 95g/day this week. For muscle building at your weight, aim closer to 130g. Try adding a shake post-workout." },
  { user: "What should I do at the gym tomorrow?", bot: "Tomorrow's a pull day — deadlifts, rows, and curls. I'll text you the full plan at 7am." },
  { user: "How am I doing this week?", bot: "Great week! Avg 1,650 cal/day, down 1.2 lbs. You hit your goal 5 of 7 days." },
  { user: "When do I move up to 1mg?", bot: "You've been on 0.5mg for 4 weeks. Your prescriber usually steps up at week 4–6. Worth checking in with them!" },
  { user: "My legs are so sore from yesterday", bot: "That's normal after heavy squats. Light walking and stretching today will help. Rest day recommended tomorrow." },
];

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-[22px_22px_22px_6px] px-5 py-3.5" style={{ background: C.sageFaint, border: `1px solid ${C.sagePale}` }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="size-[7px] rounded-full" style={{ background: C.sageMid, animation: `dotBounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
      ))}
    </div>
  );
}

function AnimatedBubbles() {
  const [convIndex, setConvIndex] = useState(0);
  const [userVisible, setUserVisible] = useState(false);
  const [botVisible, setBotVisible] = useState(false);
  const [typingVisible, setTypingVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => { timeouts.current.forEach(clearTimeout); timeouts.current = []; };
  const delay = (ms: number) => new Promise<void>((resolve) => { const id = setTimeout(resolve, ms); timeouts.current.push(id); });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setFadeOut(false); setUserVisible(false); setBotVisible(false); setTypingVisible(false);
      await delay(400); if (cancelled) return; setUserVisible(true);
      await delay(800); if (cancelled) return; setTypingVisible(true);
      await delay(1400); if (cancelled) return; setTypingVisible(false); setBotVisible(true);
      await delay(3500); if (cancelled) return; setFadeOut(true);
      await delay(600); if (cancelled) return; setConvIndex((prev) => (prev + 1) % CONVERSATIONS.length);
    };
    run();
    return () => { cancelled = true; clearAll(); };
  }, [convIndex]);

  const conv = CONVERSATIONS[convIndex];

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex items-center gap-1.5 mb-1">
        {CONVERSATIONS.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-400" style={{ width: 6, height: 6, background: i === convIndex ? C.sage : C.border, transform: i === convIndex ? "scale(1.4)" : "scale(1)" }} />
        ))}
      </div>
      <div className="flex w-full flex-col justify-center gap-3.5 overflow-hidden" style={{ height: 200, opacity: fadeOut ? 0 : 1, transition: "opacity 0.5s ease" }}>
        <div className="flex justify-end" style={{ opacity: userVisible ? 1 : 0, transform: userVisible ? "translateX(0)" : "translateX(20px)", transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="max-w-[70%] rounded-[22px_22px_6px_22px] px-5 py-3.5 text-[15px] leading-relaxed" style={{ background: C.white, border: `1.5px solid ${C.border}`, color: C.text, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            {conv.user}
          </div>
        </div>
        <div className="flex justify-start" style={{ opacity: (typingVisible || botVisible) ? 1 : 0, transform: (typingVisible || botVisible) ? "translateX(0)" : "translateX(-20px)", transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          {typingVisible && <TypingIndicator />}
          {botVisible && (
            <div className="max-w-[80%] rounded-[22px_22px_22px_6px] px-5 py-3.5 text-left text-[15px] font-medium leading-relaxed" style={{ background: C.sageFaint, border: `1.5px solid ${C.sagePale}`, color: C.sageDark, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              {conv.bot}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const features = [
  { icon: "💬", label: "Track via text" },
  { icon: "💉", label: "GLP-1 tracking" },
  { icon: "🏋️", label: "Fitness plans" },
  { icon: "⏰", label: "Smart reminders" },
  { icon: "❓", label: "Ask anything" },
  { icon: "📊", label: "Web dashboard" },
];

function formatPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (!d.length) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function toE164(formatted: string): string {
  const digits = formatted.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export default function LandingPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [focusInput, setFocusInput] = useState(false);
  const [step, setStep] = useState<"phone" | "details">("phone");

  const [state, formAction] = useActionState<RegisterActionState, FormData>(register, { status: "idle" });

  useEffect(() => { const t = setTimeout(() => setIsVisible(true), 100); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (state.status === "success") {
      setSubmitted(true);
      setTimeout(() => router.push("/demo"), 2000);
    } else if (state.status === "failed") {
      toast({ type: "error", description: "Something went wrong. Try again!" });
    } else if (state.status === "user_exists") {
      toast({ type: "error", description: "Account exists! Redirecting to login..." });
      setTimeout(() => router.push("/login"), 1500);
    } else if (state.status === "invalid_data") {
      toast({ type: "error", description: "Please fill in all fields correctly." });
    }
  }, [state.status, router]);

  const isPhoneValid = phone.replace(/\D/g, "").length === 10;

  const handlePhoneNext = () => {
    if (isPhoneValid) setStep("details");
  };

  const handleSubmit = () => {
    if (!isPhoneValid || !name.trim() || !email.trim()) return;
    const formData = new FormData();
    formData.set("phone", toE164(phone));
    formData.set("name", name.trim());
    formData.set("email", email.trim());
    formAction(formData);
  };

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center" style={{ background: C.bg, fontFamily: "'Outfit', sans-serif", padding: "60px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkPop { 0% { transform: scale(0) rotate(-45deg); opacity: 0; } 50% { transform: scale(1.2) rotate(0); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes dotBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
      `}</style>

      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${C.sage}, ${C.sageMid}, ${C.sagePale})` }} />

      <div className="relative flex w-full max-w-[680px] flex-col items-center text-center" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        {/* Logo */}
        <div className="mb-6 flex items-baseline select-none" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 0.1s both" : "none" }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>SlimZer</span>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: C.sage, letterSpacing: "-0.03em" }}>0</span>
        </div>

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: C.sageFaint, border: `1px solid ${C.sagePale}`, animation: isVisible ? "fadeUp 0.7s ease-out 0.2s both" : "none" }}>
          <span className="size-1.5 rounded-full" style={{ background: C.sage }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.sageDark }}>SMS-Powered &bull; Free During Beta</span>
        </div>

        {/* Heading */}
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(42px, 8vw, 80px)", lineHeight: 1.0, color: C.text, letterSpacing: "-0.045em", fontWeight: 800, marginBottom: 24, animation: isVisible ? "fadeUp 0.7s ease-out 0.3s both" : "none" }}>
          This is weight loss<br />made <span style={{ color: C.sage }}>simple</span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mb-9 max-w-[500px]" style={{ fontSize: "clamp(15px, 2.2vw, 18px)", lineHeight: 1.7, color: C.textMuted, fontWeight: 400, animation: isVisible ? "fadeUp 0.7s ease-out 0.45s both" : "none" }}>
          Track meals, log GLP-1 doses, plan workouts, and get answers — all through text message. SlimZer0 is your AI weight loss companion with a web dashboard to visualize progress.
        </p>

        {/* Animated bubbles */}
        <div className="mb-10 w-full" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 0.55s both" : "none" }}>
          <AnimatedBubbles />
        </div>

        {/* CTA */}
        <div className="mx-auto mb-9 flex w-full max-w-[480px] flex-col items-center gap-3.5" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 0.65s both" : "none" }}>
          {!submitted ? (
            <>
              {step === "phone" ? (
                <>
                  <div className="flex w-full items-center rounded-2xl p-1" style={{ background: C.white, border: `2px solid ${focusInput ? C.sage : C.border}`, boxShadow: focusInput ? `0 0 0 3px ${C.sagePale}` : "none", transition: "all 0.25s ease" }}>
                    <div className="flex shrink-0 items-center gap-1.5 pl-3.5 pr-1.5">
                      <span className="text-sm font-medium" style={{ color: C.textFaint }}>+1</span>
                    </div>
                    <div className="mx-1.5 h-[22px] w-px shrink-0" style={{ background: C.border }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      onFocus={() => setFocusInput(true)}
                      onBlur={() => setFocusInput(false)}
                      onKeyDown={(e) => e.key === "Enter" && handlePhoneNext()}
                      placeholder="(555) 000-0000"
                      className="min-w-0 flex-1 border-none bg-transparent py-3 pl-2 text-[17px] font-medium tracking-wide outline-none"
                      style={{ color: C.text, fontFamily: "'Outfit', sans-serif" }}
                    />
                  </div>
                  <button
                    onClick={handlePhoneNext}
                    disabled={!isPhoneValid}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-none text-[17px] font-semibold text-white transition-all"
                    style={{ height: 56, background: C.sage, opacity: isPhoneValid ? 1 : 0.5, cursor: isPhoneValid ? "pointer" : "not-allowed", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em" }}
                  >
                    <span>Continue</span>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex w-full items-center gap-2 rounded-2xl px-4 py-3" style={{ background: C.sageFaint, border: `1.5px solid ${C.sagePale}` }}>
                    <span className="text-sm font-medium" style={{ color: C.sageDark }}>{phone}</span>
                    <button onClick={() => setStep("phone")} className="ml-auto text-xs font-semibold" style={{ color: C.sage, background: "none", border: "none", cursor: "pointer" }}>Change</button>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-2xl border-none bg-transparent px-4 py-3.5 text-[16px] font-medium outline-none"
                    style={{ background: C.white, border: `2px solid ${C.border}`, color: C.text, fontFamily: "'Outfit', sans-serif" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full rounded-2xl border-none bg-transparent px-4 py-3.5 text-[16px] font-medium outline-none"
                    style={{ background: C.white, border: `2px solid ${C.border}`, color: C.text, fontFamily: "'Outfit', sans-serif" }}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!name.trim() || !email.trim()}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-none text-[17px] font-semibold text-white transition-all"
                    style={{ height: 56, background: C.sage, opacity: (name.trim() && email.trim()) ? 1 : 0.5, cursor: (name.trim() && email.trim()) ? "pointer" : "not-allowed", fontFamily: "'Outfit', sans-serif" }}
                  >
                    <span>Sign up here</span>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="flex w-full items-center gap-4 rounded-2xl px-8 py-6" style={{ background: C.sageFaint, border: `2px solid ${C.sagePale}` }}>
              <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full" style={{ background: C.sage }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "checkPop 0.5s ease-out both" }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold" style={{ color: C.text, fontFamily: "'Sora', sans-serif" }}>You&apos;re in!</p>
                <p className="mt-0.5 text-sm" style={{ color: C.textMuted }}>Taking you to your dashboard...</p>
              </div>
            </div>
          )}
          <p className="text-xs" style={{ color: C.textFaint, letterSpacing: "0.01em" }}>
            {step === "phone" ? "One text when access opens. No spam, unsubscribe anytime." : "Already have an account? "}
            {step === "details" && <a href="/login" className="font-semibold" style={{ color: C.sage }}>Sign in</a>}
          </p>
        </div>

        {/* Social proof */}
        <div className="mb-8 flex items-center gap-3.5" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 0.8s both" : "none" }}>
          <div className="flex items-center">
            {AVATARS.map((src, i) => (
              <div key={i} className="relative size-[34px] overflow-hidden rounded-full" style={{ border: `2.5px solid ${C.bg}`, marginLeft: i === 0 ? 0 : -10, zIndex: AVATARS.length - i, background: C.sagePale }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="block size-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-sm" style={{ color: C.textMuted }}><strong style={{ fontWeight: 700, color: C.text }}>2,847</strong> already on the waitlist</span>
        </div>

        {/* Features */}
        <div className="grid w-full max-w-[520px] grid-cols-3 gap-3" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 0.95s both" : "none" }}>
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5 rounded-2xl px-3 py-5" style={{ background: C.white, border: `1.5px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div className="flex size-[42px] items-center justify-center rounded-xl text-lg" style={{ background: C.sageFaint, border: `1px solid ${C.sagePale}` }}>
                {f.icon}
              </div>
              <span className="text-center text-[13px] font-semibold leading-tight" style={{ color: C.textMuted }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
