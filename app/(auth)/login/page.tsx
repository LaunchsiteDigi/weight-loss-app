"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ScaleIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/chat/toast";
import { type LoginActionState, login } from "../actions";

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
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "failed") {
      toast({
        type: "error",
        description: "No account found with that phone number!",
      });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Please enter a valid phone number!",
      });
    } else if (state.status === "success") {
      setIsSuccessful(true);
      updateSession();
      router.push("/demo");
    }
  }, [state.status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phoneDisplay.replace(/\D/g, "");
    if (digits.length < 10) return;

    const formData = new FormData();
    formData.set("phone", toE164(phoneDisplay));
    formAction(formData);
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#f7fafc] px-6 dark:bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <ScaleIcon className="size-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            SlimZero
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your AI weight loss coach
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border-2 border-border/50 bg-card p-8 shadow-lg">
          <h2 className="mb-1 text-2xl font-bold text-foreground">
            Welcome back
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Sign in with your phone number
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            {"No account? "}
            <Link
              className="font-semibold text-primary hover:underline"
              href="/register"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
