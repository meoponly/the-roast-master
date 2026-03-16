import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ChatSidebar from "@/components/ChatSidebar";
import PhotoUploadModal from "@/components/PhotoUploadModal";
import { getGreeting, getTypingPhrase, getEmptyChatPhrase } from "@/lib/voidx";
import { toast } from "sonner";
import { useAmbientSound } from "@/hooks/useAmbientSound";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import voidxLogo from "@/assets/voidx-logo.png";
import { Menu } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isNew?: boolean;
  imageUrl?: string;
  editedImageUrl?: string;
  sequenceIndex?: number;
  hidden?: boolean;
};

type ChatSession = {
  id: string;
  title: string;
  firstMessage?: string;
  createdAt: string;
};

type Memory = {
  id: string;
  text: string;
  createdAt: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voidx-chat`;

const SUGGESTION_CARDS = [
  { title: "Roast My Style 🔥", prompt: "__ROAST_PHOTO__", description: "Upload a photo and get brutally roasted" },
  { title: "Rate My Existence 💀", prompt: "Rate my existence based on the fact that I'm talking to an AI at this hour. Be savage.", description: "Get a savage reality check" },
  { title: "Expose My Ego 🪦", prompt: "I think I'm the main character. Humble me with the darkest roast you got.", description: "Time for a brutal ego check" },
];

const generateRoastTitle = (text: string): string => {
  const lower = text.toLowerCase();
  if (lower.includes("style") || lower.includes("outfit") || lower.includes("fashion") || lower.includes("[roast my style]")) return "Style Roast 🔥";
  if (lower.includes("resume") || lower.includes("cv") || lower.includes("job")) return "Resume Roast 📄";
  if (lower.includes("photo") || lower.includes("pic") || lower.includes("selfie")) return "Photo Roast 📸";
  if (lower.includes("profile") || lower.includes("bio") || lower.includes("linkedin")) return "Profile Roast 💼";
  if (lower.includes("ego") || lower.includes("main character") || lower.includes("humble")) return "Ego Roast 🪦";
  if (lower.includes("existence") || lower.includes("life") || lower.includes("alive")) return "Existence Roast 💀";
  if (lower.includes("relationship") || lower.includes("love") || lower.includes("crush")) return "Love Life Roast 💔";
  if (lower.includes("code") || lower.includes("developer") || lower.includes("programming")) return "Dev Roast 💻";
  if (lower.includes("food") || lower.includes("cooking") || lower.includes("eat")) return "Food Roast 🍕";
  return "Savage Roast 💀";
};

const extractMemory = (text: string): string | null => {
  const patterns = [
    /(?:i am|i'm|my name is|i work|i live|i study|i like|i love|i hate|i'm from|i have|i do|my job|my age)/i,
  ];
  if (patterns.some((p) => p.test(text)) && text.length > 10 && text.length < 200) {
    return text.slice(0, 100);
  }
  return null;
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingPhrase, setTypingPhrase] = useState(getTypingPhrase());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [memories, setMemories] = useState<Memory[]>(() => {
    try { return JSON.parse(localStorage.getItem("voidx-memories") || "[]"); } catch { return []; }
  });
  const [chatHistoryEnabled, setChatHistoryEnabled] = useState(() => {
    return localStorage.getItem("voidx-chat-history") !== "false";
  });
  const [personalizationEnabled, setPersonalizationEnabled] = useState(() => {
    return localStorage.getItem("voidx-personalization") !== "false";
  });
  const [userProfile, setUserProfile] = useState({ displayName: "User", handle: "@user", avatarUrl: null as string | null });
  const [emptyChatPhrase] = useState(getEmptyChatPhrase());
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playGlitchSound } = useAmbientSound();
  const isMobile = useIsMobile();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const hasMessages = messages.length > 0;

  // On mobile, sidebar is always a drawer
  const effectiveCollapsed = isMobile ? !mobileDrawerOpen : sidebarCollapsed;
  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) {
        if (!profile.avatar_url && googleAvatar) {
          await supabase.from("profiles").update({ avatar_url: googleAvatar }).eq("id", user.id);
          profile.avatar_url = googleAvatar;
        }
        setUserProfile({
          displayName: profile.display_name || user.email?.split("@")[0] || "User",
          handle: profile.handle || `@${user.email?.split("@")[0]}`,
          avatarUrl: profile.avatar_url || googleAvatar || null,
        });
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!isTyping) return;
    const interval = setInterval(() => setTypingPhrase(getTypingPhrase()), 2500);
    return () => clearInterval(interval);
  }, [isTyping]);

  useEffect(() => {
    localStorage.setItem("voidx-memories", JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    if (!userId) return;
    const loadSessions = async () => {
      const { data } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("updated_at", { ascending: false });
      if (data) {
        setSessions(data.map((s: any) => ({
          id: s.id, title: s.title, firstMessage: s.first_message, createdAt: s.created_at,
        })));
        // Auto-load most recent session
        if (data.length > 0 && !activeSessionId) {
          const mostRecent = data[0];
          setActiveSessionId(mostRecent.id);
          const msgs = await loadSessionMessages(mostRecent.id);
          if (msgs.length > 0) setMessages(msgs);
        }
      }
    };
    loadSessions();
  }, [userId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const saveMessageToDb = async (conversationId: string, msg: Message) => {
    if (!userId) return;
    await supabase.from("messages").insert({
      user_id: userId, conversation_id: conversationId, role: msg.role, content: msg.content,
      image_url: msg.imageUrl || null, edited_image_url: msg.editedImageUrl || null,
    });
  };

  const loadSessionMessages = async (sessionId: string): Promise<Message[]> => {
    const { data } = await supabase
      .from("messages").select("*").eq("conversation_id", sessionId).order("created_at", { ascending: true });
    if (!data || data.length === 0) return [];
    
    // Group consecutive assistant messages to assign sequenceIndex
    let seqCounter = 0;
    let lastRole = "";
    return data.map((m: any, idx: number) => {
      if (m.role === "assistant") {
        // Check if previous message was also assistant (same sequence)
        if (lastRole === "assistant") {
          seqCounter++;
        } else {
          seqCounter = 0;
        }
      } else {
        seqCounter = 0;
      }
      lastRole = m.role;
      return {
        id: m.id, role: m.role as "user" | "assistant", content: m.content,
        imageUrl: m.image_url || undefined, editedImageUrl: m.edited_image_url || undefined,
        sequenceIndex: m.role === "assistant" ? seqCounter : undefined,
      };
    });
  };

  const saveSession = async (firstMsg: string) => {
    const title = generateRoastTitle(firstMsg);
    const { data } = await supabase
      .from("chat_sessions").insert({ title, first_message: firstMsg, user_id: userId }).select().single();
    if (data) {
      const session: ChatSession = { id: data.id, title: data.title, firstMessage: data.first_message, createdAt: data.created_at };
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(data.id);
      return data.id;
    }
    return null;
  };

  const addMemory = (text: string) => {
    if (!personalizationEnabled) return;
    const mem = extractMemory(text);
    if (mem) {
      setMemories((prev) => [
        { id: Date.now().toString(), text: mem, createdAt: new Date().toISOString() },
        ...prev,
      ].slice(0, 50));
    }
  };

  const handleSend = useCallback(async (text: string, imageUrl?: string) => {
    setTypingPhrase(getTypingPhrase());
    const userMsg: Message = {
      id: Date.now().toString(), role: "user",
      content: imageUrl ? `[ROAST MY STYLE] ${text || "Roast my style!"}` : text, imageUrl,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);
    if (!imageUrl) addMemory(text);

    let currentSessionId = activeSessionId;
    if (chatHistoryEnabled && !activeSessionId && messages.length === 0) {
      currentSessionId = await saveSession(text || "Style Roast 🔥");
    }
    if (currentSessionId) await saveMessageToDb(currentSessionId, userMsg);

    let assistantSoFar = "";
    let soundPlayed = false;
    let editedImg: string | null = null;
    let currentBubbleIndex = 0;
    let sentenceBuffer: string[] = [];

    const splitIntoMessages = (fullText: string): string[] => {
      const parts = fullText.split(/\n{2,}/).filter(p => p.trim());
      if (parts.length > 1) return parts.slice(0, 3); // Max 3 bubbles
      const lines = fullText.split(/\n/).filter(p => p.trim());
      if (lines.length > 1) return lines.slice(0, 3);
      return [fullText];
    };

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      if (!soundPlayed) { soundPlayed = true; playGlitchSound(); }
      
      // Split accumulated text into message bubbles
      sentenceBuffer = splitIntoMessages(assistantSoFar);
      
      setMessages((prev) => {
        // Remove all streaming messages first
        const base = prev.filter(m => !m.id.startsWith("streaming-"));
        const newBubbles: Message[] = sentenceBuffer.map((text, i) => ({
          id: `streaming-${i}`,
          role: "assistant" as const,
          content: text.trim(),
          isNew: i === sentenceBuffer.length - 1,
          editedImageUrl: i === 0 ? (editedImg || undefined) : undefined,
          sequenceIndex: i,
        }));
        return [...base, ...newBubbles];
      });
    };

    try {
      const apiMessages = newMessages.map(({ role, content, imageUrl }) => ({
        role, content, ...(imageUrl ? { imageUrl } : {}),
      }));
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        toast.error(errData?.error || "My circuits exploded. Try again. 💀");
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
            if (parsed.editedImage) { editedImg = parsed.editedImage; continue; }
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }

      // Finalize: stagger reveal each bubble with delay + sound
      const finalMessages = splitIntoMessages(assistantSoFar);
      const ts = Date.now();
      
      // First, replace streaming with hidden finalized bubbles
      setMessages((prev) => {
        const base = prev.filter(m => !m.id.startsWith("streaming-"));
        const finalized: Message[] = finalMessages.map((text, i) => ({
          id: `${ts}-${i}`,
          role: "assistant" as const,
          content: text.trim(),
          editedImageUrl: i === 0 ? (editedImg || undefined) : undefined,
          sequenceIndex: i,
          hidden: i > 0,
        }));
        return [...base, ...finalized];
      });

      // Stagger reveal each bubble with delay + sound
      for (let i = 1; i < finalMessages.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        playGlitchSound();
        setMessages((prev) =>
          prev.map(m => m.id === `${ts}-${i}` ? { ...m, hidden: false, isNew: true } : m)
        );
      }
      // Save full response as single DB record
      if (currentSessionId) {
        await saveMessageToDb(currentSessionId, { id: ts.toString(), role: "assistant", content: assistantSoFar, editedImageUrl: editedImg || undefined });
      }
    } catch (err) {
      console.error("Stream error:", err);
      toast.error("Connection lost. Even the void rejects you. 💀");
    } finally {
      setIsTyping(false);
    }
  }, [messages, playGlitchSound, activeSessionId, chatHistoryEnabled, personalizationEnabled, userId]);

  const handleNewChat = () => { setActiveSessionId(null); setMessages([]); };

  const handleSelectSession = async (id: string) => {
    setActiveSessionId(id);
    if (isMobile) setMobileDrawerOpen(false);
    const loaded = await loadSessionMessages(id);
    if (loaded.length > 0) { setMessages(loaded); }
    else {
      const session = sessions.find((s) => s.id === id);
      setMessages(session?.firstMessage ? [{ id: "restored", role: "user" as const, content: session.firstMessage }] : []);
    }
  };

  const handleDeleteSession = async (id: string) => {
    await supabase.from("chat_sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) handleNewChat();
  };

  const handlePhotoRoast = (imageUrl: string) => {
    setShowPhotoModal(false);
    handleSend("Roast my style based on this photo!", imageUrl);
  };

  const handleClearMemories = () => { setMemories([]); toast.success("Memories cleared. But VOID-X never truly forgets. 💀"); };
  const handleToggleChatHistory = (val: boolean) => { setChatHistoryEnabled(val); localStorage.setItem("voidx-chat-history", String(val)); };
  const handleTogglePersonalization = (val: boolean) => { setPersonalizationEnabled(val); localStorage.setItem("voidx-personalization", String(val)); };

  const navigate = useNavigate();
  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/auth"); };
  const handleDeleteAllData = async () => {
    if (userId) await supabase.from("chat_sessions").delete().eq("user_id", userId);
    setSessions([]); setMemories([]); localStorage.removeItem("voidx-memories"); handleNewChat();
  };

  const handleSuggestionClick = (prompt: string) => {
    if (prompt === "__ROAST_PHOTO__") {
      setShowPhotoModal(true);
    } else {
      handleSend(prompt);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-background relative scanlines overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRoastMyStyle={() => setShowPhotoModal(true)}
        collapsed={effectiveCollapsed}
        onToggle={handleToggleSidebar}
        memories={memories}
        onClearMemories={handleClearMemories}
        chatHistoryEnabled={chatHistoryEnabled}
        onToggleChatHistory={handleToggleChatHistory}
        personalizationEnabled={personalizationEnabled}
        onTogglePersonalization={handleTogglePersonalization}
        userProfile={userProfile}
        onLogout={handleLogout}
        onDeleteAllData={handleDeleteAllData}
      />
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile header */}
        {isMobile && (
          <div className="flex items-center gap-2 p-2 border-b border-border">
            <button onClick={handleToggleSidebar} className="p-2 rounded hover:bg-secondary text-muted-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <img src={voidxLogo} alt="VOID-X" className="w-6 h-6 rounded-xl" loading="eager" />
            <span className="text-xs font-bold text-foreground neon-text tracking-wider">VOID-X</span>
          </div>
        )}

        {/* System status bar */}
        <div className="flex justify-between items-center px-4 py-1.5 border-b border-border text-[10px] font-mono tracking-widest z-20 relative">
          <span className="text-primary/70 neon-text">ENCRYPTION: AES-256-ACTIVE</span>
          <span className="text-primary/70 neon-text flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            SYSTEM ONLINE
          </span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 relative z-10">
          {!hasMessages && !isTyping && (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in px-4">
              <img src={voidxLogo} alt="VOID-X" className="w-16 h-16 mb-4 opacity-60 rounded-2xl" loading="eager" />
              <h1 className="font-display text-2xl font-bold tracking-tight neon-text text-foreground glitch mb-2">
                VOID-X
              </h1>
              <p className="text-xs text-muted-foreground font-mono max-w-xs text-center mb-8">
                {emptyChatPhrase}
              </p>
              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg w-full">
                {SUGGESTION_CARDS.map((card) => (
                  <button
                    key={card.title}
                    onClick={() => handleSuggestionClick(card.prompt)}
                    className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-card hover:bg-secondary/80 transition-colors text-left group"
                  >
                    <span className="text-xs font-bold text-foreground group-hover:neon-text">{card.title}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{card.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isNew={msg.isNew}
              imageUrl={msg.imageUrl}
              editedImageUrl={msg.editedImageUrl}
              showTimestamp={msg.sequenceIndex === undefined || msg.sequenceIndex === 0}
              hidden={msg.hidden}
            />
          ))}
          {isTyping && !messages.some(m => m.id.startsWith("streaming-")) && (
            <div className="px-4 py-3 flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center">
                <img src={voidxLogo} alt="VX" className="w-5 h-5 rounded-lg" loading="eager" />
              </div>
              <div className="bg-card border border-border rounded px-4 py-3 text-sm text-muted-foreground">
                <span className="blink-cursor">{typingPhrase}</span>
              </div>
            </div>
          )}
        </div>
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
      <PhotoUploadModal open={showPhotoModal} onClose={() => setShowPhotoModal(false)} onSubmit={handlePhotoRoast} />
    </div>
  );
};

export default Index;
