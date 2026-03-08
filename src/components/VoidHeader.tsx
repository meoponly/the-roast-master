const VoidHeader = () => {
  return (
    <header className="relative border-b border-border p-4 scanlines">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          <h1 className="font-display text-2xl font-bold tracking-tight neon-text text-foreground glitch">
            VOID-X
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>STATUS: <span className="text-accent red-glow-text">HOSTILE</span></span>
          <span className="hidden sm:inline">API CREDITS: <span className="text-foreground">$0.50/ROAST</span></span>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground font-mono">
        // hyper-intelligent • zero filters • PhD in roasting
      </p>
    </header>
  );
};

export default VoidHeader;
