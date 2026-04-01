import { cn } from "@/lib/utils";
import { Flame, Scissors } from "lucide-react";
import MessageActions from "./MessageActions";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  isNew?: boolean;
  imageUrl?: string;
  editedImageUrl?: string;
  showTimestamp?: boolean;
  hidden?: boolean;
  isLastInSequence?: boolean;
  onRegenerate?: () => void;
  onRoastHarder?: () => void;
};

const ChatMessage = ({ role, content, isNew, imageUrl, editedImageUrl, showTimestamp = true, hidden, isLastInSequence, onRegenerate, onRoastHarder }: ChatMessageProps) => {
  const isUser = role === "user";

  const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  if (hidden) return null;

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-1.5",
        isUser ? "justify-end animate-fade-in" : "justify-start",
        !isUser && isNew ? "glitch-enter" : !isUser ? "animate-fade-in" : ""
      )}
    >
      {!isUser && (
        <div className={cn("flex-shrink-0 w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-[10px] font-bold tracking-wider neon-text", !showTimestamp && "invisible")}>
          VX
        </div>
      )}
      <div className={cn("flex flex-col gap-1", isUser ? "max-w-[70%]" : "max-w-[65%]")}>
        {!isUser && showTimestamp && (
          <span className="text-[9px] text-muted-foreground font-mono tracking-wider ml-1">
            VOID-X • {timestamp}
          </span>
        )}
        <div
          className={cn(
            "rounded px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-secondary text-secondary-foreground border border-border"
              : "bg-card text-foreground border border-primary/20"
          )}
        >
        {imageUrl && (
          <div className="mb-2 relative">
            <img src={imageUrl} alt="Uploaded style" className="rounded max-h-48 object-cover border border-border" />
            <div className="absolute top-1 left-1 bg-accent/90 text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <Flame className="w-2.5 h-2.5" />
              STYLE ROAST
            </div>
          </div>
        )}
        {editedImageUrl && (
          <div className="mb-2 relative">
            <img src={editedImageUrl} alt="VOID-X's version" className="rounded max-h-64 object-cover border-2 border-accent/50" />
            <div className="absolute top-1 left-1 bg-accent/90 text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <Scissors className="w-2.5 h-2.5" />
              VOID-X MAKEOVER 💀
            </div>
          </div>
        )}
        <p className="whitespace-pre-wrap">{content}</p>
        </div>
        {!isUser && isLastInSequence && (
          <MessageActions
            content={content}
            onRegenerate={onRegenerate}
            onRoastHarder={onRoastHarder}
          />
        )}
        {isUser && (
          <span className="text-[9px] text-muted-foreground font-mono tracking-wider mr-1 self-end">
            {timestamp}
          </span>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded bg-secondary border border-border flex items-center justify-center text-muted-foreground text-[10px] font-mono">
          {">"}_
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
