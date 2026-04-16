"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useCallback, useEffect, useState } from "react";
import { suggestions } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "../ai-elements/suggestion";
import type { VisibilityType } from "./visibility-selector";

const ITEMS_PER_PAGE = 4;
const CYCLE_INTERVAL = 8000;

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
};

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  const totalPages = Math.ceil(suggestions.length / ITEMS_PER_PAGE);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, CYCLE_INTERVAL);
    return () => clearInterval(timer);
  }, [totalPages]);

  const currentSuggestions = suggestions.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const handleClick = useCallback(
    (suggestion: string) => {
      window.history.pushState(
        {},
        "",
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/chat/${chatId}`
      );
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: suggestion }],
      });
    },
    [chatId, sendMessage]
  );

  return (
    <div className="flex w-full flex-wrap justify-center gap-1.5">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex w-full flex-wrap justify-center gap-1.5"
        >
          {currentSuggestions.map((suggestedAction) => (
            <Suggestion
              key={suggestedAction}
              className="rounded-full border border-border/40 bg-card/20 px-3 py-1.5 text-[11px] text-muted-foreground/70 transition-all duration-200 hover:bg-card/50 hover:text-foreground hover:border-border/60"
              onClick={handleClick}
              suggestion={suggestedAction}
            >
              {suggestedAction}
            </Suggestion>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }

    return true;
  }
);
