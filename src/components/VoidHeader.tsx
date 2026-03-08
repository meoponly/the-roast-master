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
          <span>STATUS: <span className="text-accent red-glow-text">SAVAGE</span></span>
          <span className="hidden sm:inline">FILTER: <span className="text-foreground">ZERO</span></span>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground font-mono">
        // cold desi savage • zero filters • PhD in judging
      </p>
    </header>
  );
};

export default VoidHeader;
