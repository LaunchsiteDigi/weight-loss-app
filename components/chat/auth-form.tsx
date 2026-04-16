import Form from "next/form";

import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
  return (
    <Form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label className="font-normal text-muted-foreground" htmlFor="phone">
          Phone Number
        </Label>
        <Input
          autoComplete="tel"
          autoFocus
          className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
          defaultValue={defaultPhone}
          id="phone"
          name="phone"
          placeholder="+14155552671"
          required
          type="tel"
        />
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
