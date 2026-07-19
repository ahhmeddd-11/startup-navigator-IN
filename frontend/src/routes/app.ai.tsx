import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { suggestedPrompts } from "@/lib/content";
import { api } from "@/lib/api";
import {
  ArrowUp,
  Copy,
  Plus,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/app/ai")({
  head: () => ({ meta: [{ title: "AI Assistant — Startup Navigator" }] }),
  component: AiPage,
});

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const GREETING: Msg = {
  id: "greeting",
  role: "assistant",
  text: "Hi — I'm your Startup Navigator assistant. Ask me anything about DPIIT recognition, schemes, taxation, hiring, or fundraising in India.",
};

type Conversation = {
  id: number;
  title: string;
  created_at: string;
};

function AiPage() {
  const queryClient = useQueryClient();
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [conversationToDelete, setConversationToDelete] =
    useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["ai-conversations"],
    queryFn: async () => {
      const res = await api.get("/api/ai/conversations/");
      return (res.data?.data ?? []) as Conversation[];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post("/api/ai/chat/", {
        message,
        conversation_id: activeConvId,
      });
      return res.data?.data as {
        conversation_id: number;
        conversation_title: string;
        response: string;
        interaction_id: number;
      };
    },
    onSuccess: (data) => {
      setActiveConvId(data.conversation_id);
      setMsgs((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: data.response },
      ]);
      setThinking(false);
      void queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
    onError: () => {
      setThinking(false);
      setMsgs((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Sorry, something went wrong. Please try again in a moment.",
        },
      ]);
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      await api.delete(`/api/ai/conversations/${conversationId}/`);
    },

    onSuccess: (_, conversationId) => {
      toast.success("Conversation deleted.");

      void queryClient.invalidateQueries({
        queryKey: ["ai-conversations"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      if (activeConvId === conversationId) {
        setActiveConvId(null);
        setMsgs([GREETING]);
      }
    },

    onError: () => {
      toast.error("Failed to delete conversation.");
    },
  });

  const clearConversationsMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/api/ai/conversations/");
    },
    onSuccess: () => {
      toast.success("All conversations cleared.");
      void queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setActiveConvId(null);
      setMsgs([GREETING]);
    },
    onError: () => {
      toast.error("Failed to clear conversations.");
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function send(text: string) {
    if (!text.trim() || thinking) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    sendMutation.mutate(text);
  }

  function startNewConversation() {
    setMsgs([GREETING]);
    setActiveConvId(null);
    inputRef.current?.focus();
  }

  async function loadConversation(convId: number) {
    try {
      const res = await api.get(`/api/ai/conversations/${convId}/`);
      const conv = res.data?.data;
      if (!conv) return;
      setActiveConvId(convId);
      const loadedMsgs: Msg[] = [GREETING];
      for (const interaction of conv.interactions ?? []) {
        loadedMsgs.push({ id: `u-${interaction.id}`, role: "user", text: interaction.user_query });
        loadedMsgs.push({ id: `a-${interaction.id}`, role: "assistant", text: interaction.ai_response });
      }
      setMsgs(loadedMsgs);
    } catch {
      toast.error("Could not load conversation.");
    }
  }

  async function deleteConversation(
    e: React.MouseEvent,
    conversationId: number
  ) {
    e.stopPropagation();

    e.stopPropagation();
    setConversationToDelete(conversationId);
  }

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="hidden border-r border-border bg-surface md:flex md:flex-col min-h-0">
        <div className="p-3">
          <Button size="sm" className="w-full justify-start" variant="outline" onClick={startNewConversation}>
            <Plus className="mr-1.5 h-4 w-4" /> New conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Conversations
          </div>
          {conversations.length === 0 && (
            <div className="px-2 py-3 text-xs text-muted-foreground">No conversations yet.</div>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-center rounded-md",
                activeConvId === c.id
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              )}
            >
              <button
                type="button"
                onClick={() => void loadConversation(c.id)}
                className="flex-1 truncate px-2 py-1.5 text-left"
              >
                <div className="truncate font-medium">
                  {c.title}
                </div>

                <div className="text-[11px] text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                    }
                  )}
                </div>
              </button>

              <Button
                size="icon"
                variant="ghost"
                className="mr-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => deleteConversation(e, c.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3">
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            disabled={clearConversationsMutation.isPending}
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all conversations?")) {
                clearConversationsMutation.mutate();
              }
            }}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Clear Conversations
          </Button>
        </div>
      </aside>

      {/* Chat panel */}
      <div className="flex min-w-0 min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <div className="text-sm font-medium">Startup Navigator AI</div>
          </div>
          <div className="text-xs text-muted-foreground">Grounded in Indian startup docs · Beta</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {msgs.map((m) => (
              <div key={m.id} className="mb-6">
                {m.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div className="text-[15px] leading-relaxed text-foreground/95">
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    {m.id !== "greeting" && (
                      <div className="mt-3 flex items-center gap-1 text-muted-foreground">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          aria-label="Copy response"
                          onClick={() => { void navigator.clipboard?.writeText(m.text); toast.success("Copied"); }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Thumbs up">
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Thumbs down">
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          aria-label="Regenerate response"
                          disabled={thinking}
                          onClick={() => {
                            // Find the last user message and resend
                            const lastUser = [...msgs].reverse().find((x) => x.role === "user");
                            if (lastUser) send(lastUser.text);
                          }}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {thinking && (
              <div className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
                <span className="ml-2">Thinking…</span>
              </div>
            )}

            {msgs.length <= 1 && (
              <div className="mt-8">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Try a prompt</div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {suggestedPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="rounded-lg border border-border p-3 text-left text-sm hover:bg-accent/50"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-border bg-background p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-xs focus-within:ring-2 focus-within:ring-ring"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about DPIIT, GST, seed funds, hiring…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={!input.trim() || thinking}
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
          <div className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
            AI can make mistakes. Verify critical answers with a qualified professional.
          </div>
                </div>
      </div>

      <AlertDialog
        open={conversationToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setConversationToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete conversation?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete the conversation and all of its
              messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={deleteConversationMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (conversationToDelete !== null) {
                  deleteConversationMutation.mutate(conversationToDelete);
                }

                setConversationToDelete(null);
              }}
            >
              {deleteConversationMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}