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
    toast.success("Copied to clipboard");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: content, title: "VOID-X Roast" });
    } else {
      await navigator.clipboard.writeText(content);
      toast.success("Copied for sharing");
    }
  };

  const btnClass = "p-2 rounded-md hover:bg-secondary transition-all duration-200 text-muted-foreground hover:text-foreground min-w-[32px] min-h-[32px] flex items-center justify-center";

  return (
    <div className="flex items-center gap-0.5 mt-1.5 ml-1">
      <button onClick={handleCopy} className={btnClass} title="Copy" aria-label="Copy response">
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => { setLiked(true); toast.success("Good roast noted"); }}
        className={cn(btnClass, liked === true && "text-primary")} title="Good prompt" aria-label="Good roast">
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => { setLiked(false); toast("Bad roast noted"); }}
        className={cn(btnClass, liked === false && "text-destructive")} title="Bad prompt" aria-label="Bad roast">
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
      <button onClick={handleShare} className={btnClass} title="Share" aria-label="Share">
        <Share2 className="w-3.5 h-3.5" />
      </button>
      {onRegenerate && (
        <button onClick={onRegenerate} className={btnClass} title="Regenerate" aria-label="Regenerate">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
      {onRoastHarder && (
        <button onClick={onRoastHarder} className={cn(btnClass, "hover:text-accent")} title="Roast harder" aria-label="Roast harder">
          <span className="text-sm">🔥</span>
        </button>
      )}
    </div>
  );
};

export default MessageActions;
