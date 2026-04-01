import { useState } from "react";
import { Copy, ThumbsUp, ThumbsDown, Share2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type MessageActionsProps = {
  content: string;
  onRegenerate?: () => void;
  onRoastHarder?: () => void;
};

const MessageActions = ({ content, onRegenerate, onRoastHarder }: MessageActionsProps) => {
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard 💀");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: content, title: "VOID-X Roast" });
    } else {
      await navigator.clipboard.writeText(content);
      toast.success("Copied for sharing 💀");
    }
  };

  const btnClass = "p-1.5 rounded-lg hover:bg-secondary/80 transition-all duration-150 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95";

  return (
    <div className="flex items-center gap-0.5 mt-1 ml-1">
      <button onClick={handleCopy} className={btnClass} title="Copy">
        <Copy className="w-3 h-3" />
      </button>
      <button
        onClick={() => { setLiked(true); toast.success("Good roast noted 🔥"); }}
        className={cn(btnClass, liked === true && "text-primary")}
        title="Good prompt"
      >
        <ThumbsUp className="w-3 h-3" />
      </button>
      <button
        onClick={() => { setLiked(false); toast("Bad roast noted 💀"); }}
        className={cn(btnClass, liked === false && "text-destructive")}
        title="Bad prompt"
      >
        <ThumbsDown className="w-3 h-3" />
      </button>
      <button onClick={handleShare} className={btnClass} title="Share">
        <Share2 className="w-3 h-3" />
      </button>
      {onRegenerate && (
        <button onClick={onRegenerate} className={btnClass} title="Regenerate">
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
      {onRoastHarder && (
        <button onClick={onRoastHarder} className={cn(btnClass, "hover:text-accent")} title="Roast harder">
          <span className="text-xs">🔥</span>
        </button>
      )}
    </div>
  );
};

export default MessageActions;
