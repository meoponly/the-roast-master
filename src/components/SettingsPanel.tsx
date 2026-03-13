import { useState } from "react";
import { Settings, Download, Trash2, LogOut, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  open: boolean;
  onClose: () => void;
  onDeleteAllData: () => void;
};

const SettingsPanel = ({
  memories,
  onClearMemories,
  chatHistoryEnabled,
  onToggleChatHistory,
  open,
  onClose,
  onDeleteAllData,
}: SettingsPanelProps) => {
  const handleExport = () => {
    const data = {
      memories,
      exportedAt: new Date().toISOString(),
      settings: { chatHistoryEnabled },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voidx-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogoutAll = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      toast.error("Failed to sign out from all devices");
    } else {
      toast.success("Signed out from all devices 💀");
    }
  };

  const handleDeleteData = () => {
    if (confirm("Delete ALL your chat data and memories? This cannot be undone.")) {
      onDeleteAllData();
      toast.success("All data deleted. The void is clean. 💀");
    }
  };

  if (!open) return null;

  return (
    <div className="absolute left-0 top-0 w-64 h-full bg-card border-r border-border z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-xs font-bold text-foreground neon-text tracking-wider flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" /> SETTINGS
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-xs"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Data & Privacy */}
        <div className="p-3">
          <h3 className="text-[10px] font-bold text-muted-foreground tracking-wider mb-3">DATA & PRIVACY</h3>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-foreground">Chat History & Training</span>
            <Switch checked={chatHistoryEnabled} onCheckedChange={onToggleChatHistory} />
          </div>

          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
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

        <div className="border-t border-border" />

        {/* Account */}
        <div className="p-3">
          <h3 className="text-[10px] font-bold text-muted-foreground tracking-wider mb-3">ACCOUNT</h3>

          <button
            onClick={handleLogoutAll}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out from all devices
          </button>

          <button
            onClick={handleDeleteData}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono border border-destructive/30 hover:bg-destructive/10 text-destructive transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Delete all data
          </button>
        </div>
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

export default SettingsPanel;
