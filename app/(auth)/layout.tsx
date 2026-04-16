import { ScaleIcon } from "lucide-react";
import { Preview } from "@/components/chat/preview";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-screen bg-background">
      <div className="flex w-full flex-col p-8 xl:w-[480px] xl:shrink-0 xl:border-r xl:border-border/30 md:p-12">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ScaleIcon className="size-5" />
            </div>
            {children}
          </div>
        </div>
      </div>

      <div className="hidden flex-1 overflow-hidden bg-muted/20 xl:flex">
        <Preview />
      </div>
    </div>
  );
}
