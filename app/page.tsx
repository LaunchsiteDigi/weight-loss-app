"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import confetti from "canvas-confetti";
import { type RegisterActionState, register } from "./(auth)/actions";
import { useActionState } from "react";
import { toast } from "@/components/chat/toast";

const AVATARS = [
  "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=80&h=80&fit=crop&crop=face",
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

const IconChat = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const IconSyringe = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4" /><path d="m17 7 3-3" /><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" /><path d="m9 11 4 4" /><path d="m5 19-3 3" /><path d="m14 4 6 6" /></svg>
);
const IconDumbbell = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" /></svg>
);
const IconClock = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const IconHelp = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
const IconChartBar = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
);

const features = [
  { icon: <IconChat />, label: "Log meals by text", sub: "Just text what you ate" },
  { icon: <IconSyringe />, label: "Never miss a dose", sub: "GLP-1 reminders built in" },
  { icon: <IconDumbbell />, label: "Workouts that stick", sub: "Plans that fit your life" },
  { icon: <IconClock />, label: "Stay accountable", sub: "Daily check-ins via SMS" },
  { icon: <IconHelp />, label: "Get instant answers", sub: "Nutrition & fitness Q&A" },
  { icon: <IconChartBar />, label: "See real progress", sub: "Charts & trends on the web" },
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

  const fireConfetti = useCallback(() => {
    const duration = 2500;
    const end = Date.now() + duration;
    const colors = [C.sage, C.sageMid, C.sagePale, "#ffffff", C.sageDark];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    // Initial burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors,
    });
    frame();
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      setSubmitted(true);
      fireConfetti();
      setTimeout(() => router.push("/demo"), 3000);
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
        <div className="mb-8 flex items-baseline select-none" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 0.1s both" : "none" }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 700, color: C.text, letterSpacing: "-0.04em" }}>SlimZer</span>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 800, color: C.sage, letterSpacing: "-0.04em" }}>0</span>
        </div>

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: C.sageFaint, border: `1px solid ${C.sagePale}`, animation: isVisible ? "fadeUp 0.7s ease-out 0.2s both" : "none" }}>
          <span className="size-1.5 rounded-full" style={{ background: C.sage }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.sageDark }}>SMS-Powered &bull; Free During Beta</span>
        </div>

        {/* Heading */}
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(42px, 8vw, 80px)", lineHeight: 1.0, color: C.text, letterSpacing: "-0.045em", fontWeight: 800, marginBottom: 24, animation: isVisible ? "fadeUp 0.7s ease-out 0.3s both" : "none" }}>
          Lose weight by<br />sending a <span style={{ color: C.sage }}>text</span>.
        </h1>

        <p className="mx-auto mb-10 max-w-[520px]" style={{ fontSize: "clamp(15px, 2.2vw, 18px)", lineHeight: 1.7, color: C.textMuted, fontWeight: 400, animation: isVisible ? "fadeUp 0.7s ease-out 0.45s both" : "none" }}>
          No app. No complicated diet plans. Just text SlimZer0 what you ate, your GLP-1 dose, or your workout — and get instant coaching back. Your progress dashboard builds itself.
        </p>

        {/* Social proof - avatars only */}
        <div className="mb-10 flex items-center gap-3.5" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 0.55s both" : "none" }}>
          <div className="flex items-center">
            {AVATARS.map((src, i) => (
              <div key={i} className="relative size-[34px] overflow-hidden rounded-full" style={{ border: `2.5px solid ${C.bg}`, marginLeft: i === 0 ? 0 : -10, zIndex: AVATARS.length - i, background: C.sagePale }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="block size-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-sm" style={{ color: C.textMuted }}>Trusted by early members</span>
        </div>

        {/* Inline CTA above features */}
        <div className="mb-10 w-full max-w-[480px]" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 0.65s both" : "none" }}>
          <button
            onClick={() => document.getElementById("waitlist-input")?.focus()}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-none text-[16px] font-semibold text-white transition-all hover:opacity-90"
            style={{ height: 42, background: C.sage, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em" }}
            type="button"
          >
            <span>Get early access</span>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
          </button>
        </div>

        {/* Benefits */}
        <div className="mb-10 grid w-full max-w-[520px] grid-cols-3 gap-3" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 0.8s both" : "none" }}>
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2 rounded-2xl px-3 py-5" style={{ background: C.white, border: `1.5px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div className="flex size-[42px] items-center justify-center rounded-xl" style={{ background: C.sageFaint, border: `1px solid ${C.sagePale}` }}>
                {f.icon}
              </div>
              <span className="text-center text-[13px] font-bold leading-tight" style={{ color: C.text }}>{f.label}</span>
              <span className="text-center text-[11px] leading-snug" style={{ color: C.textFaint }}>{f.sub}</span>
            </div>
          ))}
        </div>

        {/* Animated bubbles */}
        <div className="mb-10 w-full" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 1.1s both" : "none" }}>
          <AnimatedBubbles />
        </div>

        {/* CTA - Join Waitlist */}
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-3.5" style={{ animation: isVisible ? "fadeUp 0.7s ease-out 1.25s both" : "none" }}>
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
                      id="waitlist-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      onFocus={() => setFocusInput(true)}
                      onBlur={() => setFocusInput(false)}
                      onKeyDown={(e) => e.key === "Enter" && handlePhoneNext()}
                      placeholder="(555) 000-0000"
                      className="min-w-0 flex-1 border-none bg-transparent py-2 pl-2 text-[15px] font-medium tracking-wide outline-none"
                      style={{ color: C.text, fontFamily: "'Outfit', sans-serif" }}
                    />
                  </div>
                  <button
                    onClick={handlePhoneNext}
                    disabled={!isPhoneValid}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-none text-[14px] font-semibold text-white transition-all"
                    style={{ height: 44, background: C.sage, opacity: isPhoneValid ? 1 : 0.5, cursor: isPhoneValid ? "pointer" : "not-allowed", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em" }}
                  >
                    <span>Join waiting list</span>
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
                    className="w-full rounded-2xl border-none bg-transparent px-3.5 py-2.5 text-[14px] font-medium outline-none"
                    style={{ background: C.white, border: `2px solid ${C.border}`, color: C.text, fontFamily: "'Outfit', sans-serif" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full rounded-2xl border-none bg-transparent px-3.5 py-2.5 text-[14px] font-medium outline-none"
                    style={{ background: C.white, border: `2px solid ${C.border}`, color: C.text, fontFamily: "'Outfit', sans-serif" }}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!name.trim() || !email.trim()}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-none text-[14px] font-semibold text-white transition-all"
                    style={{ height: 44, background: C.sage, opacity: (name.trim() && email.trim()) ? 1 : 0.5, cursor: (name.trim() && email.trim()) ? "pointer" : "not-allowed", fontFamily: "'Outfit', sans-serif" }}
                  >
                    <span>Join waiting list</span>
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
            {step === "phone" ? (
              <>
                <strong style={{ color: C.sageDark }}>Limited beta spots.</strong> No spam, unsubscribe anytime.
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a href="/login" className="font-semibold" style={{ color: C.sage }}>Sign in</a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
