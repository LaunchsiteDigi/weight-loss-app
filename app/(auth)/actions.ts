"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn } from "./auth";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

const phoneSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
});

const registerSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = phoneSchema.parse({
      phone: formData.get("phone"),
    });

    const phone = normalizePhone(validatedData.phone);

    await signIn("phone", {
      phone,
      isRegister: "false",
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    if (error instanceof AuthError) {
      return { status: "failed" };
    }
    // NextAuth signIn may throw a NEXT_REDIRECT which is not an error
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as any).digest === "string" &&
      (error as any).digest.includes("NEXT_REDIRECT")
    ) {
      return { status: "success" };
    }
    return { status: "failed" };
  }
};

export type RegisterActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = registerSchema.parse({
      phone: formData.get("phone"),
      name: formData.get("name"),
      email: formData.get("email"),
    });

    const phone = normalizePhone(validatedData.phone);

    await signIn("phone", {
      phone,
      name: validatedData.name,
      email: validatedData.email,
      isRegister: "true",
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    if (error instanceof AuthError) {
      return { status: "failed" };
    }
    // NextAuth signIn may throw a NEXT_REDIRECT which is not an error
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as any).digest === "string" &&
      (error as any).digest.includes("NEXT_REDIRECT")
    ) {
      return { status: "success" };
    }
    return { status: "failed" };
  }
};
