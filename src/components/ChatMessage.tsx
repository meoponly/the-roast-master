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
        <div className={cn(
          "flex-shrink-0 w-7 h-7 rounded-md bg-card border border-border flex items-center justify-center text-primary text-[9px] font-bold font-mono tracking-wider text-glow",
          !showTimestamp && "invisible"
        )}>
          VX
        </div>
      )}
      <div className={cn("flex flex-col gap-1", isUser ? "max-w-[65%]" : "max-w-[65%]")}>
        {!isUser && showTimestamp && (
          <span className="text-[9px] text-muted-foreground font-mono tracking-wider ml-1 uppercase">
            VOID-X • {timestamp}
          </span>
        )}
        <div
          className={cn(
            "rounded-lg px-4 py-2.5 text-sm leading-relaxed transition-all duration-200 relative",
            isUser
              ? "bg-secondary text-foreground border border-border"
              : "bg-card text-foreground border border-border scanlines-output"
          )}
        >
          {imageUrl && (
            <div className="mb-3 relative">
              <img src={imageUrl} alt="Uploaded style" className="rounded-md max-h-48 object-cover border border-border" loading="lazy" />
              <div className="absolute top-1.5 left-1.5 bg-accent text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono tracking-wider">
                <Flame className="w-3 h-3" />
                STYLE ROAST
              </div>
            </div>
          )}
          {editedImageUrl && (
            <div className="mb-3 relative">
              <img src={editedImageUrl} alt="VOID-X's version" className="rounded-md max-h-64 object-cover border border-primary/20" loading="lazy" />
              <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono tracking-wider">
                <Scissors className="w-3 h-3" />
                MAKEOVER
              </div>
            </div>
          )}
          <p className={cn(
            "whitespace-pre-wrap leading-relaxed",
            !isUser && "font-mono text-[13px]"
          )}>{content}</p>
        </div>
        {!isUser && isLastInSequence && (
          <MessageActions content={content} onRegenerate={onRegenerate} onRoastHarder={onRoastHarder} />
        )}
        {isUser && (
          <span className="text-[9px] text-muted-foreground font-mono tracking-wider mr-1 self-end">
            {timestamp}
          </span>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground text-[9px] font-mono">
          {">"}_
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
