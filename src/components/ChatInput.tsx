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
    <div className="border-t border-border/60 p-4 backdrop-blur-sm">
      <div className="max-w-[1000px] mx-auto">
      <div className="flex gap-3 items-end">
        <span className="text-foreground neon-text text-sm pb-2.5">{">"}</span>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "VOID-X is processing your stupidity..." : "Type something... if you dare 💀"}
          rows={1}
          className="flex-1 bg-input border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-none font-mono disabled:opacity-50 transition-all duration-200"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:brightness-110 hover:shadow-[0_0_12px_hsl(120_100%_45%/0.3)] active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed font-mono"
        >
          SEND
        </button>
      </div>
      </div>
    </div>
  );
};

export default ChatInput;
