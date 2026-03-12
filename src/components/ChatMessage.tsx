import { cn } from "@/lib/utils";
import { Flame, Scissors } from "lucide-react";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  isNew?: boolean;
  imageUrl?: string;
  editedImageUrl?: string;
};

const ChatMessage = ({ role, content, isNew, imageUrl, editedImageUrl }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "justify-end animate-fade-in" : "justify-start",
        !isUser && isNew ? "glitch-enter" : !isUser ? "animate-fade-in" : ""
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold">
          VX
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-secondary text-secondary-foreground border border-border"
            : "bg-card text-foreground border border-border"
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
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded bg-secondary border border-border flex items-center justify-center text-muted-foreground text-xs">
          {">"}_
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
