"use server";

import { z } from "zod";
import { signIn } from "./auth";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number is required")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});

const registerSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number is required")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
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

    const result = await signIn("phone", {
      phone: validatedData.phone,
      isRegister: "false",
      redirect: false,
    });

    if (!result) {
      return { status: "failed" };
    }

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
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

    await signIn("phone", {
      phone: validatedData.phone,
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

    return { status: "failed" };
  }
};
