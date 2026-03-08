import { useState, useRef, useEffect, useCallback } from "react";
import VoidHeader from "@/components/VoidHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { getGreeting } from "@/lib/voidx";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voidx-chat`;

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", content: getGreeting() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === "streaming") {
          return prev.map((m) => m.id === "streaming" ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { id: "streaming", role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      // Send only role+content for the API
      const apiMessages = newMessages.map(({ role, content }) => ({ role, content }));

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

      // Finalize the streaming message with a stable ID
      setMessages((prev) =>
        prev.map((m) => m.id === "streaming" ? { ...m, id: Date.now().toString() } : m)
      );
    } catch (err) {
      console.error("Stream error:", err);
      toast.error("Connection lost. Even the internet doesn't want to deal with you. 💀");
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background relative scanlines overflow-hidden">
      <VoidHeader />
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 relative z-10">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isTyping && !messages.some(m => m.id === "streaming") && (
          <div className="px-4 py-3 flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold">
              VX
            </div>
            <div className="bg-card border border-border rounded px-4 py-3 text-sm text-muted-foreground">
              <span className="blink-cursor">processing your stupidity</span>
            </div>
          </div>
        )}
      </div>
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
};

export default Index;
