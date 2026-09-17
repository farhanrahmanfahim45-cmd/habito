import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, MessagesSquare, Check, CheckCheck } from "lucide-react";
import { db } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Conversation, Message } from "@/types/space";
import { cn } from "@/lib/cn";

/**
 * Messages. One list, one thread, and on desktop both at once.
 *
 * Threads are tied to a space, so neither side has to ask "which place is
 * this about" — the thing being discussed sits at the top of the screen.
 */
export default function Messages() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setConversations(await db.conversations());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your messages.");
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    void load();
    try {
      return db.subscribeToMessages(() => void load());
    } catch {
      return undefined;
    }
  }, [load]);

  const active = conversations?.find((c) => c.id === id) ?? null;
  const totalUnread = (conversations ?? []).reduce((sum, c) => sum + c.unread, 0);

  return (
    <>
      <PageHeader
        title="Messages"
        lead={
          totalUnread > 0
            ? `${totalUnread} unread ${totalUnread === 1 ? "message" : "messages"}.`
            : "Every conversation is tied to the space it's about."
        }
      />

      <div className="container-page py-6 md:py-8">
        {error && (
          <p className="mb-4 rounded-card bg-danger-100 p-4 text-sm text-danger-600">{error}</p>
        )}

        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          {/* List — hidden on mobile once a thread is open */}
          <aside className={cn(id && "hidden lg:block")}>
            <ConversationList items={conversations} activeId={id ?? null} />
          </aside>

          {/* Thread */}
          <section className={cn(!id && "hidden lg:block")}>
            {id ? (
              <Thread
                conversationId={id}
                conversation={active}
                onBack={() => navigate("/messages")}
                onSent={() => void load()}
              />
            ) : (
              <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-card bg-surface p-10 text-center ring-1 ring-hairline">
                <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
                  <MessagesSquare size={20} aria-hidden />
                </span>
                <p className="font-display font-bold text-ink">Pick a conversation</p>
                <p className="mt-1 max-w-xs text-sm text-muted">
                  Or open a space and send an inquiry to start a new one.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

/* ── Conversation list ───────────────────────────────────────────────── */

function ConversationList({ items, activeId }: { items: Conversation[] | null; activeId: string | null }) {
  if (items === null) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-card" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-card bg-surface p-8 text-center ring-1 ring-hairline">
        <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
          <MessagesSquare size={20} aria-hidden />
        </span>
        <p className="font-display font-bold text-ink">No conversations yet.</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Send an inquiry on a space and the thread appears here.
        </p>
        <Link to="/search" className="mt-4 inline-block">
          <Button size="sm" variant="secondary">
            Browse spaces
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((c) => (
        <li key={c.id}>
          <Link
            to={`/messages/${c.id}`}
            className={cn(
              "flex items-center gap-3 rounded-card p-3 ring-1 transition-colors",
              c.id === activeId ? "bg-aqua-50 ring-aqua-600" : "bg-surface ring-hairline hover:ring-hairline-strong",
            )}
          >
            {c.spaceImage ? (
              <img src={c.spaceImage} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="size-12 shrink-0 rounded-xl bg-ivory-deep" aria-hidden />
            )}

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="truncate font-semibold text-ink">{c.counterpartName}</span>
                {c.unread > 0 && (
                  <span className="shrink-0 rounded-full bg-aqua-600 px-1.5 text-[0.65rem] font-bold tnum text-white">
                    {c.unread}
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted">
                {c.spaceName}
                {c.propertyArea && ` · ${c.propertyArea}`}
              </p>
              <p className={cn("mt-0.5 truncate text-sm", c.unread > 0 ? "font-medium text-ink" : "text-ink-soft")}>
                {c.lastMessage || "No messages yet"}
              </p>
            </div>

            <span className="shrink-0 self-start text-xs text-muted">{whenShort(c.lastMessageAt)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ── Thread ──────────────────────────────────────────────────────────── */

function Thread({
  conversationId,
  conversation,
  onBack,
  onSent,
}: {
  conversationId: string;
  conversation: Conversation | null;
  onBack: () => void;
  onSent: () => void;
}) {
  const { account, configured } = useAuth();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const rows = await db.messages(conversationId);
      // The server's copy is authoritative; de-duplicate defensively in case a
      // backend ever returns the same row twice.
      const seen = new Set<string>();
      setMessages(rows.filter((m) => (seen.has(m.id) ? false : seen.add(m.id))));
      await db.markRead(conversationId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this conversation.");
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    setMessages(null);
    void load();
    try {
      return db.subscribeToMessages(() => void load());
    } catch {
      return undefined;
    }
  }, [load]);

  // Jump to the newest message whenever the thread grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    setError(null);

    try {
      const sent = await db.sendMessage(conversationId, body);
      setDraft("");
      // Show it immediately rather than waiting for the round trip — but the
      // subscription may have already delivered it, so match on id first.
      setMessages((prev) => {
        const current = prev ?? [];
        return current.some((m) => m.id === sent.id) ? current : [...current, sent];
      });
      onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Your message didn't send.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[70vh] min-h-96 flex-col overflow-hidden rounded-card bg-surface ring-1 ring-hairline">
      {/* Who and what this is about */}
      <div className="flex items-center gap-3 border-b border-hairline p-3.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="rounded-full p-1.5 text-muted hover:bg-ivory-deep hover:text-ink lg:hidden"
        >
          <ArrowLeft size={18} aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{conversation?.counterpartName ?? "Conversation"}</p>
          {conversation && (
            <p className="truncate text-xs text-muted">
              {conversation.youAreOwner ? "Asking about" : "Your inquiry about"} {conversation.spaceName}
            </p>
          )}
        </div>

        {conversation?.spaceId && (
          <Link to={`/space/${conversation.spaceId}`}>
            <Button size="sm" variant="secondary">
              View space
            </Button>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages === null ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="ml-auto h-12 w-1/2" />
            <Skeleton className="h-12 w-3/5" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            No messages yet. Say hello and ask what you need to know.
          </p>
        ) : (
          messages.map((m, i) => {
            const showDay = i === 0 || dayOf(m.sentAt) !== dayOf(messages[i - 1].sentAt);
            return (
              <div key={m.id}>
                {showDay && (
                  <p className="my-4 text-center text-xs font-semibold text-muted">{dayLabel(m.sentAt)}</p>
                )}
                <div className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:max-w-[70%]",
                      m.mine ? "bg-ink text-ivory" : "bg-ivory-deep text-ink",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.body}</p>
                    <p
                      className={cn(
                        "mt-1 flex items-center justify-end gap-1 text-[0.7rem]",
                        m.mine ? "text-ivory/60" : "text-muted",
                      )}
                    >
                      {timeOf(m.sentAt)}
                      {m.mine &&
                        (m.readAt ? (
                          <CheckCheck size={12} aria-label="Read" />
                        ) : (
                          <Check size={12} aria-label="Sent" />
                        ))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-hairline p-3">
        {error && <p className="mb-2 text-sm text-danger-600">{error}</p>}

        <div className="flex items-end gap-2">
          <label className="flex-1">
            <span className="sr-only">Your message</span>
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter sends; Shift+Enter makes a new line.
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={configured && !account ? "Sign in to reply" : "Write a message"}
              disabled={configured && !account}
              className="max-h-32 w-full resize-y rounded-2xl bg-ivory px-3.5 py-2.5 text-[0.9375rem] text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600 disabled:opacity-60"
            />
          </label>

          <Button
            onClick={() => void send()}
            disabled={sending || draft.trim().length === 0}
            aria-label="Send message"
            className="shrink-0"
          >
            <Send size={16} aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Time helpers ────────────────────────────────────────────────────── */

const dayOf = (iso: string) => new Date(iso).toDateString();

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function whenShort(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  if (mins < 10080) return `${Math.floor(mins / 1440)}d`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
