import { useState } from "react";
import { PanelLeftClose, PanelLeft, Plus, MessageSquare, Trash2, Camera, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import SettingsPanel from "@/components/SettingsPanel";

type Memory = {
  id: string;
  text: string;
  createdAt: string;
};

type ChatSession = {
  id: string;
  title: string;
  firstMessage?: string;
  createdAt: string;
};

type ChatSidebarProps = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRoastMyStyle: () => void;
  collapsed: boolean;
  onToggle: () => void;
  memories: Memory[];
  onClearMemories: () => void;
  chatHistoryEnabled: boolean;
  onToggleChatHistory: (val: boolean) => void;
  personalizationEnabled: boolean;
  onTogglePersonalization: (val: boolean) => void;
};

const ChatSidebar = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRoastMyStyle,
  collapsed,
  onToggle,
  memories,
  onClearMemories,
  chatHistoryEnabled,
  onToggleChatHistory,
  personalizationEnabled,
  onTogglePersonalization,
}: ChatSidebarProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3 px-1 border-r border-border bg-card/50 w-12 shrink-0">
        <button
          onClick={onToggle}
          className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Expand sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNewChat}
          className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mt-2"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onRoastMyStyle}
          className="p-2 rounded hover:bg-accent/20 text-accent hover:text-accent transition-colors mt-1"
          title="Roast My Style"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col border-r border-border bg-card/50 w-64 shrink-0 transition-all">
      {/* Settings overlay */}
      <SettingsPanel
        memories={memories}
        onClearMemories={onClearMemories}
        chatHistoryEnabled={chatHistoryEnabled}
        onToggleChatHistory={onToggleChatHistory}
        personalizationEnabled={personalizationEnabled}
        onTogglePersonalization={onTogglePersonalization}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-bold text-foreground neon-text tracking-wider">VOID-X</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="p-2 space-y-1">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono border border-border hover:bg-secondary hover:text-foreground text-muted-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>
        <button
          onClick={onRoastMyStyle}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono border border-accent/30 hover:bg-accent/10 text-accent transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          Roast My Style 🔥
        </button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {sessions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4 px-2">
            No chat history yet.<br />Start roasting. 💀
          </p>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            onMouseEnter={() => setHoveredId(session.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectSession(session.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-xs font-mono transition-colors group",
              activeSessionId === session.id
                ? "bg-secondary text-foreground border border-border"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate flex-1">
              {session.title}
            </span>
            {hoveredId === session.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="p-0.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          VOID-X • v0.6.6.6
        </p>
      </div>
    </div>
  );
};

export default ChatSidebar;
