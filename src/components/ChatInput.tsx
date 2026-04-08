import { useState, useRef, useEffect } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border px-4 py-4 bg-background/80 backdrop-blur-sm">
      <div className="max-w-[760px] mx-auto">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? "PROCESSING..." : "Describe yourself, your idea, or paste a link..."}
            rows={1}
            className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none font-mono disabled:opacity-50 transition-all duration-200 min-h-[48px]"
            aria-label="Chat message input"
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="px-5 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-bold font-display transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed min-h-[48px] min-w-[48px] active:scale-[0.97] accent-glow-hover"
            aria-label="Send message"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
