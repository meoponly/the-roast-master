import { useState, useRef, useEffect, useCallback } from "react";
import VoidHeader from "@/components/VoidHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ChatSidebar from "@/components/ChatSidebar";
import PhotoUploadModal from "@/components/PhotoUploadModal";
import { getGreeting } from "@/lib/voidx";
import { toast } from "sonner";
import { useAmbientSound } from "@/hooks/useAmbientSound";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isNew?: boolean;
  imageUrl?: string;
};

type ChatSession = {
  id: string;
  title: string;
  firstMessage?: string;
  createdAt: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voidx-chat`;

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", content: getGreeting() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [sessionMessages, setSessionMessages] = useState<Record<string, Message[]>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playGlitchSound } = useAmbientSound();

  // Load sessions from DB on mount
  useEffect(() => {
    const loadSessions = async () => {
      const { data } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("updated_at", { ascending: false });
      if (data) {
        setSessions(data.map((s: any) => ({
          id: s.id,
          title: s.title,
          firstMessage: s.first_message,
          createdAt: s.created_at,
        })));
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const saveSession = async (firstMsg: string) => {
    const title = firstMsg.slice(0, 40) + (firstMsg.length > 40 ? "..." : "");
    const { data } = await supabase
      .from("chat_sessions")
      .insert({ title, first_message: firstMsg })
      .select()
      .single();
    if (data) {
      const session: ChatSession = {
        id: data.id,
        title: data.title,
        firstMessage: data.first_message,
        createdAt: data.created_at,
      };
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(data.id);
      return data.id;
    }
    return null;
  };

  const handleSend = useCallback(async (text: string, imageUrl?: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: imageUrl ? `[ROAST MY STYLE] ${text || "Roast my style!"}` : text,
      imageUrl,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    // Save as new session if no active session
    if (!activeSessionId && messages.length <= 1) {
      await saveSession(text || "Style Roast 🔥");
    }

    let assistantSoFar = "";
    let soundPlayed = false;

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      if (!soundPlayed) {
        soundPlayed = true;
        playGlitchSound();
      }
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === "streaming") {
          return prev.map((m) => m.id === "streaming" ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { id: "streaming", role: "assistant", content: assistantSoFar, isNew: true }];
      });
    };

    try {
      const apiMessages = newMessages.map(({ role, content, imageUrl }) => ({
        role,
        content,
        ...(imageUrl ? { imageUrl } : {}),
      }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        const errMsg = errData?.error || "My circuits exploded. Try again. 💀";
        toast.error(errMsg);
        setIsTyping(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) => m.id === "streaming" ? { ...m, id: Date.now().toString() } : m)
      );
    } catch (err) {
      console.error("Stream error:", err);
      toast.error("Connection lost. Even the void rejects you. 💀");
    } finally {
      setIsTyping(false);
    }
  }, [messages, playGlitchSound, activeSessionId]);

  const handleNewChat = () => {
    // Save current messages to session cache
    if (activeSessionId) {
      setSessionMessages((prev) => ({ ...prev, [activeSessionId]: messages }));
    }
    setActiveSessionId(null);
    setMessages([{ id: "greeting", role: "assistant", content: getGreeting() }]);
  };

  const handleSelectSession = (id: string) => {
    // Save current
    if (activeSessionId) {
      setSessionMessages((prev) => ({ ...prev, [activeSessionId]: messages }));
    }
    setActiveSessionId(id);
    const cached = sessionMessages[id];
    if (cached) {
      setMessages(cached);
    } else {
      const session = sessions.find((s) => s.id === id);
      setMessages([
        { id: "greeting", role: "assistant", content: getGreeting() },
        ...(session?.firstMessage ? [{ id: "restored", role: "user" as const, content: session.firstMessage }] : []),
      ]);
    }
  };

  const handleDeleteSession = async (id: string) => {
    await supabase.from("chat_sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setSessionMessages((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (activeSessionId === id) {
      handleNewChat();
    }
  };

  const handlePhotoRoast = (imageUrl: string) => {
    setShowPhotoModal(false);
    handleSend("Roast my style based on this photo!", imageUrl);
  };

  return (
    <div className="flex h-screen bg-background relative scanlines overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRoastMyStyle={() => setShowPhotoModal(true)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <VoidHeader />
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 relative z-10">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} isNew={msg.isNew} imageUrl={msg.imageUrl} />
          ))}
          {isTyping && !messages.some(m => m.id === "streaming") && (
            <div className="px-4 py-3 flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold">
                VX
              </div>
              <div className="bg-card border border-border rounded px-4 py-3 text-sm text-muted-foreground">
                <span className="blink-cursor">watching...</span>
              </div>
            </div>
          )}
        </div>
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
      <PhotoUploadModal
        open={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSubmit={handlePhotoRoast}
      />
    </div>
  );
};

export default Index;
