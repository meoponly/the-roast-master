import { useState } from "react";
import { Sparkles, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type PersonalizationPanelProps = {
  personalizationEnabled: boolean;
  onTogglePersonalization: (val: boolean) => void;
  open: boolean;
  onClose: () => void;
};

const PersonalizationPanel = ({ personalizationEnabled, onTogglePersonalization, open, onClose }: PersonalizationPanelProps) => {
  const [showCustomInstructions, setShowCustomInstructions] = useState(false);
  const [customInstructions, setCustomInstructions] = useState(() => localStorage.getItem("voidx-custom-instructions") || "");

  const handleSave = () => {
    localStorage.setItem("voidx-custom-instructions", customInstructions);
    setShowCustomInstructions(false);
  };

  if (!open) return null;

  return (
    <div className="absolute left-0 top-0 w-64 h-full bg-card border-r border-border z-50 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-xs font-bold text-foreground tracking-wider flex items-center gap-1.5 font-display">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> PERSONALIZATION
        </span>
        <button onClick={() => { onClose(); setShowCustomInstructions(false); }}
          className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 text-xs">✕</button>
      </div>

      {showCustomInstructions ? (
        <div className="flex-1 flex flex-col p-3 gap-3">
          <button onClick={() => setShowCustomInstructions(false)} className="text-xs text-primary hover:underline self-start font-display">← Back</button>
          <h3 className="text-xs font-bold text-foreground font-display">Custom Instructions</h3>
          <p className="text-[10px] text-muted-foreground">Tell VOID-X how to roast you better.</p>
          <textarea
            value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g. I'm from Delhi, roast my metro commute..."
            className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none font-mono transition-all duration-200"
          />
          <button onClick={handleSave}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-xs font-bold font-display transition-all duration-200 accent-glow-hover">
            Save
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-foreground font-display">Enable for new chats</span>
            <Switch checked={personalizationEnabled} onCheckedChange={onTogglePersonalization} />
          </div>
          <button onClick={() => setShowCustomInstructions(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-display border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200">
            <ExternalLink className="w-3.5 h-3.5" /> Custom Instructions
          </button>
        </div>
      )}

      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center font-mono">VOID-X • v2.0</p>
      </div>
    </div>
  );
};

export default PersonalizationPanel;
