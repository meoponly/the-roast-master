import { cn } from "@/lib/utils";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  isNew?: boolean;
};

const ChatMessage = ({ role, content, isNew }: ChatMessageProps) => {
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