"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ScaleIcon,
  UtensilsIcon,
  DumbbellIcon,
  TrendingDownIcon,
  MessageSquareIcon,
  TargetIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/chat/toast";
import { type RegisterActionState, register } from "../actions";

const FEATURES = [
  {
    icon: ScaleIcon,
    title: "Weight Tracking",
    description: "Log daily weigh-ins and see your trend over time",
  },
  {
    icon: UtensilsIcon,
    title: "Meal & Calorie Logging",
    description: "Track what you eat with smart calorie estimation",
  },
  {
    icon: DumbbellIcon,
    title: "Workout Tracking",
    description: "Log exercise sessions with duration and calories burned",
  },
  {
    icon: TrendingDownIcon,
    title: "Progress Analytics",
    description: "Charts, stats, and goal tracking with BMI calculator",
  },
  {
    icon: TargetIcon,
    title: "Goal Setting",
    description: "Set target weight with timeline tracking and milestones",
  },
  {
    icon: MessageSquareIcon,
    title: "iMessage Coach",
    description: "Daily check-ins and motivation via text message",
  },
];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function toE164(formatted: string): string {
  const digits = formatted.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export default function Page() {
  const router = useRouter();
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "user_exists") {
      toast({ type: "error", description: "Account already exists!" });
    } else if (state.status === "failed") {
      toast({ type: "error", description: "Failed to create account!" });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Please fill in all fields correctly!",
      });
    } else if (state.status === "success") {
      toast({ type: "success", description: "Account created!" });
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phoneDisplay.replace(/\D/g, "");
    if (digits.length < 10 || !name.trim() || !email.trim()) return;

    const formData = new FormData();
    formData.set("phone", toE164(phoneDisplay));
    formData.set("name", name.trim());
    formData.set("email", email.trim());
    formAction(formData);
  };

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-[#f7fafc] dark:bg-background lg:flex-row">
      {/* Left - Features */}
      <div className="w-full px-6 pt-10 pb-6 lg:w-1/2 lg:px-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-lg"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <ScaleIcon className="size-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              SlimZero
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Your AI-powered weight loss coach. Track meals, workouts, and progress with daily coaching via iMessage.
            </p>
          </div>

          {/* Current Plan Card */}
          <div className="mb-6 rounded-2xl bg-primary px-5 py-4">
            <p className="text-[13px] uppercase tracking-wider text-primary-foreground/70">
              Free Plan
            </p>
            <p className="mt-1 text-xl font-bold text-primary-foreground">
              Unlimited AI Coaching
            </p>
          </div>

          {/* Features List */}
          <div className="mb-6">
            <p className="mb-4 text-lg font-bold text-foreground">
              What you get:
            </p>
            <div className="space-y-3">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="flex items-center gap-4 rounded-2xl border-2 border-border/50 bg-card p-4 transition-colors"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-foreground">
                      {feature.title}
                    </p>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-2xl border border-accent-foreground/20 bg-accent p-5">
            <p className="text-sm font-bold text-accent-foreground">
              About SlimZero
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-accent-foreground/80">
              AI coaching powered by free open-source models. Daily iMessage check-ins via Sendblue. All your data stays private.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right - Sign Up Form */}
      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border-2 border-border/50 bg-card p-8 shadow-lg">
            <h2 className="mb-1 text-2xl font-bold text-foreground">
              Create your account
            </h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Start your weight loss journey today
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Phone Number <span className="text-primary">*</span>
                </label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  autoFocus
                  value={phoneDisplay}
                  onChange={(e) => setPhoneDisplay(formatPhone(e.target.value))}
                  placeholder="(415) 555-2671"
                  required
                  className="h-11 rounded-xl border-border bg-muted/50 text-sm"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  US number, no country code needed
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Name <span className="text-primary">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="h-11 rounded-xl border-border bg-muted/50 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Email <span className="text-primary">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-11 rounded-xl border-border bg-muted/50 text-sm"
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="pt-2"
              >
                <button
                  type="submit"
                  disabled={isSuccessful}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isSuccessful ? (
                    <>
                      <CheckCircleIcon className="size-4" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Sign up
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <p className="mt-6 text-center text-[13px] text-muted-foreground">
              {"Have an account? "}
              <Link
                className="font-semibold text-primary hover:underline"
                href="/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
