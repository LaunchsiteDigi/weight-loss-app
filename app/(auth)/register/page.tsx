"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ScaleIcon } from "lucide-react";
import { DotCanvas } from "@/components/chat/dot-canvas";
import { AuthForm } from "@/components/chat/auth-form";
import { toast } from "@/components/chat/toast";
import { type RegisterActionState, register } from "../actions";

export default function Page() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleSubmit = (formData: FormData) => {
    setPhone(formData.get("phone") as string);
    formAction(formData);
  };

  return (
    <div className="flex w-full items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl"
      >
        {/* Left - Animated canvas */}
        <div className="relative hidden w-1/2 overflow-hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10">
            <DotCanvas />
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mb-6"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <ScaleIcon className="size-7 text-primary-foreground" />
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mb-2 text-center text-3xl font-bold text-foreground"
            >
              Weight Loss Coach
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="max-w-xs text-center text-sm text-muted-foreground"
            >
              Start your journey with personalized AI coaching, meal tracking, and daily iMessage check-ins
            </motion.p>
          </div>
        </div>

        {/* Right - Register Form */}
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-1 text-2xl font-bold text-foreground md:text-3xl">
              Start your journey
            </h1>
            <p className="mb-8 text-muted-foreground">
              Create your account to get started
            </p>

            <AuthForm action={handleSubmit} defaultPhone={phone} isRegister>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="pt-2"
              >
                <button
                  type="submit"
                  disabled={isSuccessful}
                  className={`relative w-full overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:opacity-90 disabled:opacity-50 ${
                    isHovered ? "shadow-lg" : ""
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isSuccessful ? "Creating account..." : "Sign up"}
                    <ArrowRight className="size-4" />
                  </span>
                </button>
              </motion.div>

              <p className="mt-6 text-center text-[13px] text-muted-foreground">
                {"Have an account? "}
                <Link
                  className="font-medium text-primary hover:underline"
                  href="/login"
                >
                  Sign in
                </Link>
              </p>
            </AuthForm>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
