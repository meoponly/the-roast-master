import { useState, useRef, useEffect } from "react";
import VoidHeader from "@/components/VoidHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { getGreeting, generateRoast } from "@/lib/voidx";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", content: getGreeting() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate "thinking" delay
    const delay = 800 + Math.random() * 1500;
    setTimeout(() => {
      const roast = generateRoast(text);
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: roast };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  return (
    <div className="flex flex-col h-screen bg-background relative scanlines overflow-hidden">
      <VoidHeader />
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 relative z-10">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isTyping && (
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
