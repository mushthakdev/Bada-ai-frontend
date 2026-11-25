"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AgentSelectPanel } from "@/components/agent/agent-select-panel";
import { Button } from "@/components/ui/button";
import { SimulatedBadge } from "@/components/ui/data-badge";
import { useAuth } from "@/hooks/use-auth";
import {
  aiService,
  type AssistantAction,
  type AssistantSelect,
} from "@/services/ai";
import { errorMessage } from "@/lib/api";
import { AGENT_NAME, AGENT_VERSION_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: AssistantAction[];
  suggestions?: string[];
  select?: AssistantSelect | null;
}

const STARTERS = [
  "I own a salon. Where should I advertise for the best ROI?",
  "I own a salon in Kakkanad. I have ₹25,000 for a 30-day campaign targeting working professionals within 5 km. Suggest digital billboards.",
  "List my campaigns",
  "How is my spend looking this month?",
];

export default function AssistantPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [liveSelect, setLiveSelect] = useState<AssistantSelect | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatSessionRef = useRef(0);

  const firstName = user?.full_name?.trim().split(/\s+/)[0] || "there";
  const hasChat = messages.length > 0;

  const mutation = useMutation({
    mutationFn: ({
      message,
      conversation_id,
    }: {
      message: string;
      conversation_id?: string;
      session: number;
    }) => aiService.assistant({ message, conversation_id }),
    onSuccess: (data, variables) => {
      if (variables.session !== chatSessionRef.current) return;
      setConversationId(data.conversation_id);
      setLiveSuggestions(data.suggestions ?? []);
      setLiveSelect(data.select ?? null);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: variables.message },
        {
          role: "assistant",
          content: data.reply,
          actions: data.actions ?? [],
          suggestions: data.suggestions ?? [],
          select: data.select ?? null,
        },
      ]);
      setInput("");
    },
    onError: (e, variables) => {
      if (variables.session !== chatSessionRef.current) return;
      toast.error(errorMessage(e));
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mutation.isPending, liveSelect]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const clearChat = () => {
    chatSessionRef.current += 1;
    setMessages([]);
    setConversationId(undefined);
    setLiveSuggestions([]);
    setLiveSelect(null);
    setInput("");
    mutation.reset();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const send = (raw?: string) => {
    const message = (raw ?? input).trim();
    if (!message || mutation.isPending) return;
    setLiveSelect(null);
    setLiveSuggestions([]);
    mutation.mutate({
      message,
      conversation_id: conversationId,
      session: chatSessionRef.current,
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="-mx-4 -my-6 flex min-h-[calc(100vh-4rem)] flex-col bg-grid-agent sm:mx-[-1.5rem] sm:my-[-1.5rem] lg:mx-[-2rem] lg:my-[-2rem]">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-white/90 px-3 py-1 text-xs font-semibold text-navy-600 shadow-soft backdrop-blur">
            <Sparkles className="size-3 text-brand-600" />
            {AGENT_NAME} {AGENT_VERSION_LABEL}
          </span>
          {hasChat && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={clearChat}
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 className="size-3.5" />
              Clear chat
            </Button>
          )}
        </div>

        {!hasChat ? (
          <div className="flex flex-1 flex-col items-center justify-center pb-16">
            <p className="mb-2 text-sm font-semibold text-brand-700">{AGENT_NAME}</p>
            <h1 className="font-display text-center text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
              Hi {firstName}!
            </h1>
            <p className="mt-2 max-w-md text-center text-sm text-navy-500">
              Describe your business and goals — I’ll ask only what’s missing, then search real inventory and build a plan.
            </p>

            <AgentComposer
              inputRef={inputRef}
              input={input}
              setInput={setInput}
              onKeyDown={onKeyDown}
              onSend={() => send()}
              loading={mutation.isPending}
              className="mt-10 w-full"
            />

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Button asChild variant="secondary" size="sm" className="rounded-full">
                <Link href="/campaigns/new">
                  <Plus className="size-3.5" />
                  Create
                  <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-white">
                    New
                  </span>
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="rounded-full">
                <Link href="/studio">
                  <GraduationCap className="size-3.5" />
                  Studio
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex w-full max-w-xl flex-col gap-2">
              {STARTERS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  disabled={mutation.isPending}
                  className="rounded-xl border border-line bg-white/80 px-4 py-3 text-left text-sm text-navy-700 shadow-soft transition-colors hover:border-brand-200 hover:bg-white hover:text-navy-900 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3 flex justify-center sm:justify-start">
              <SimulatedBadge label="Select options below — or type your answer" />
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pb-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft",
                    m.role === "user"
                      ? "ml-auto bg-brand-600 text-white"
                      : "border border-line bg-white text-navy-800",
                  )}
                >
                  <AgentText content={m.content} />
                  {m.role === "assistant" && m.actions && m.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.actions.map((action) => (
                        <Button
                          key={`${action.href}-${action.label}`}
                          asChild
                          size="sm"
                          variant="secondary"
                          className="rounded-full"
                        >
                          <Link href={action.href}>{action.label}</Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {mutation.isPending && (
                <div className="max-w-[88%] rounded-2xl border border-line bg-white px-4 py-3 text-sm text-navy-400 shadow-soft">
                  Working on it…
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {liveSelect && !mutation.isPending && (
              <div className="mb-3">
                <AgentSelectPanel
                  key={liveSelect.id}
                  select={liveSelect}
                  disabled={mutation.isPending}
                  onSubmit={send}
                />
              </div>
            )}

            {!liveSelect && liveSuggestions.length > 0 && !mutation.isPending && (
              <div className="mb-3 flex flex-wrap gap-2">
                {liveSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-line-strong bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 shadow-soft transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <AgentComposer
              inputRef={inputRef}
              input={input}
              setInput={setInput}
              onKeyDown={onKeyDown}
              onSend={() => send()}
              loading={mutation.isPending}
              className="sticky bottom-0 mt-auto pb-2"
            />
          </>
        )}
      </div>
    </div>
  );
}

function AgentText({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div className="whitespace-pre-wrap font-sans">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-navy-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

function AgentComposer({
  input,
  setInput,
  onKeyDown,
  onSend,
  loading,
  inputRef,
  className,
}: {
  input: string;
  setInput: (v: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  loading: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line-strong bg-white p-2 shadow-lift",
        className,
      )}
    >
      <div className="flex items-end gap-2">
        <button
          type="button"
          className="mb-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-navy-400 transition-colors hover:bg-surface hover:text-navy-700"
          aria-label="Add context"
          title="Attach campaign context soon"
        >
          <Plus className="size-5" />
        </button>
        <textarea
          ref={inputRef}
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g. New advertising near Ernakulam"
          className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent py-3 text-[15px] text-navy-900 placeholder:text-navy-400 focus:outline-none"
        />
        <Button
          size="icon"
          className="mb-1 size-10 shrink-0 rounded-xl"
          loading={loading}
          disabled={!input.trim()}
          onClick={onSend}
          aria-label="Send"
        >
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
