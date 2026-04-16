"use client";

import { useState } from "react";
import Form from "next/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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

export function AuthForm({
  action,
  children,
  defaultPhone = "",
  isRegister = false,
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultPhone?: string;
  isRegister?: boolean;
}) {
  const [phoneDisplay, setPhoneDisplay] = useState(
    defaultPhone ? formatPhone(defaultPhone) : ""
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneDisplay(formatPhone(e.target.value));
  };

  const handleSubmit = (formData: FormData) => {
    const digits = phoneDisplay.replace(/\D/g, "");
    if (digits.length < 10) return;

    const newFormData = new FormData();
    newFormData.set("phone", toE164(phoneDisplay));
    if (isRegister) {
      newFormData.set("name", formData.get("name") as string);
      newFormData.set("email", formData.get("email") as string);
    }
    if (typeof action === "function") {
      action(newFormData);
    }
  };

  return (
    <Form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label className="font-normal text-muted-foreground" htmlFor="phone">
          Phone Number
        </Label>
        <Input
          autoComplete="tel"
          autoFocus
          className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
          value={phoneDisplay}
          onChange={handlePhoneChange}
          id="phone"
          name="phone"
          placeholder="(415) 555-2671"
          required
          type="tel"
        />
        <p className="text-xs text-muted-foreground">US number, no country code needed</p>
      </div>

      {isRegister && (
        <>
          <div className="flex flex-col gap-2">
            <Label
              className="font-normal text-muted-foreground"
              htmlFor="name"
            >
              Name
            </Label>
            <Input
              autoComplete="name"
              className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
              id="name"
              name="name"
              placeholder="Your name"
              required
              type="text"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              className="font-normal text-muted-foreground"
              htmlFor="email"
            >
              Email
            </Label>
            <Input
              autoComplete="email"
              className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
        </>
      )}

      {children}
    </Form>
  );
}
