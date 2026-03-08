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
    <div className="border-t border-border p-4">
      <div className="flex gap-3 items-end">
        <span className="text-foreground neon-text text-sm pb-2">{">"}</span>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "VOID-X is processing your stupidity..." : "Type something... if you dare 💀"}
          rows={1}
          className="flex-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none font-mono disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-bold hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-mono"
        >
          SEND
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
