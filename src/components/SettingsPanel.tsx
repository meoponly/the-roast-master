import { useState } from "react";
import { Settings, ChevronDown, ChevronUp, Download, Trash2, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Memory = {
  id: string;
  text: string;
  createdAt: string;
};

type SettingsPanelProps = {
  memories: Memory[];
  onClearMemories: () => void;
  chatHistoryEnabled: boolean;
  onToggleChatHistory: (val: boolean) => void;
  personalizationEnabled: boolean;
  onTogglePersonalization: (val: boolean) => void;
};

const SettingsPanel = ({
  memories,
  onClearMemories,
  chatHistoryEnabled,
  onToggleChatHistory,
  personalizationEnabled,
  onTogglePersonalization,
}: SettingsPanelProps) => {
  const [open, setOpen] = useState(false);
  const [showCustomInstructions, setShowCustomInstructions] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");

  const handleExport = () => {
    const data = {
      memories,
      exportedAt: new Date().toISOString(),
      settings: { chatHistoryEnabled, personalizationEnabled, customInstructions },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voidx-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="absolute left-0 top-0 w-64 h-full bg-card border-r border-border z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-xs font-bold text-foreground neon-text tracking-wider flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" /> SETTINGS
        </span>
        <button
          onClick={() => { setOpen(false); setShowCustomInstructions(false); }}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-xs"
        >
          ✕
        </button>
      </div>

      {showCustomInstructions ? (
        <div className="flex-1 flex flex-col p-3 gap-3">
          <button onClick={() => setShowCustomInstructions(false)} className="text-xs text-accent hover:underline self-start">
            ← Back
          </button>
          <h3 className="text-xs font-bold text-foreground">Custom Instructions</h3>
          <p className="text-[10px] text-muted-foreground">Tell VOID-X how to roast you better.</p>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g. I'm from Delhi, roast my metro commute..."
            className="flex-1 bg-input border border-border rounded px-2 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none font-mono"
          />
          <button
            onClick={() => setShowCustomInstructions(false)}
            className="w-full py-2 bg-primary text-primary-foreground rounded text-xs font-bold font-mono hover:brightness-110 transition-all"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Data & Privacy */}
          <div className="p-3">
            <h3 className="text-[10px] font-bold text-muted-foreground tracking-wider mb-3">DATA & PRIVACY</h3>

            {/* Chat History & Training */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-foreground">Chat History & Training</span>
              <Switch checked={chatHistoryEnabled} onCheckedChange={onToggleChatHistory} />
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <Download className="w-3.5 h-3.5" />
              Export Data
            </button>

            <div className="border-t border-border my-3" />

            {/* Personalization */}
            <h3 className="text-[10px] font-bold text-muted-foreground tracking-wider mb-3">PERSONALIZATION</h3>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-foreground">Enable for new chats</span>
              <Switch checked={personalizationEnabled} onCheckedChange={onTogglePersonalization} />
            </div>

            <button
              onClick={() => setShowCustomInstructions(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Custom Instructions
            </button>
          </div>

          <div className="border-t border-border" />

          {/* Memory */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-muted-foreground tracking-wider">MEMORY</h3>
              {memories.length > 0 && (
                <button
                  onClick={onClearMemories}
                  className="text-[10px] text-destructive hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-2.5 h-2.5" /> Clear all
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              VOID-X remembers things you share to roast you better.
            </p>
            {memories.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic text-center py-3">
                No memories yet. Start chatting. 💀
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {memories.map((m) => (
                  <div key={m.id} className="text-[10px] text-foreground bg-secondary/50 border border-border rounded px-2 py-1.5">
                    {m.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          VOID-X • v0.6.6.6
        </p>
      </div>
    </div>
  );
};

export default SettingsPanel;
