import { useState } from "react";
import { Sparkles, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type PersonalizationPanelProps = {
  personalizationEnabled: boolean;
  onTogglePersonalization: (val: boolean) => void;
  open: boolean;
  onClose: () => void;
};

const PersonalizationPanel = ({
  personalizationEnabled,
  onTogglePersonalization,
  open,
  onClose,
}: PersonalizationPanelProps) => {
  const [showCustomInstructions, setShowCustomInstructions] = useState(false);
  const [customInstructions, setCustomInstructions] = useState(() => {
    return localStorage.getItem("voidx-custom-instructions") || "";
  });

  const handleSave = () => {
    localStorage.setItem("voidx-custom-instructions", customInstructions);
    setShowCustomInstructions(false);
  };

  if (!open) return null;

  return (
    <div className="absolute left-0 top-0 w-64 h-full bg-card border-r border-border z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-xs font-bold text-foreground neon-text tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" /> PERSONALIZATION
        </span>
        <button
          onClick={() => { onClose(); setShowCustomInstructions(false); }}
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
            onClick={handleSave}
            className="w-full py-2 bg-primary text-primary-foreground rounded text-xs font-bold font-mono hover:brightness-110 transition-all"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-4">
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

export default PersonalizationPanel;
