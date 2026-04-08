import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type ProfileMenuProps = {
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  onOpenSettings: () => void;
  onOpenPersonalization: () => void;
  onLogout: () => void;
  collapsed?: boolean;
};

const ProfileMenu = ({ displayName, handle, avatarUrl, onOpenSettings, onOpenPersonalization, onLogout, collapsed }: ProfileMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "VX";

  const menu = (
    <div className="absolute bottom-full left-0 mb-2 w-52 bg-card border border-border rounded-lg shadow-xl z-50 py-1 animate-fade-in">
      <div className="px-3 py-2.5 border-b border-border">
        <p className="text-xs font-medium text-foreground font-display">{displayName}</p>
        <p className="text-[10px] text-muted-foreground font-mono">{handle}</p>
      </div>
      <button onClick={() => { setOpen(false); onOpenPersonalization(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-secondary-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 font-display">
        <Sparkles className="w-3.5 h-3.5" /> Personalization
      </button>
      <button onClick={() => { setOpen(false); onOpenSettings(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-secondary-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 font-display">
        <Settings className="w-3.5 h-3.5" /> Settings
      </button>
      <div className="border-t border-border mt-1" />
      <button onClick={onLogout}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-destructive hover:bg-secondary transition-all duration-200 font-display">
        <LogOut className="w-3.5 h-3.5" /> Log out
      </button>
    </div>
  );

  if (collapsed) {
    return (
      <div className="relative" ref={menuRef}>
        <button onClick={() => setOpen(!open)} className="p-1.5 rounded-full hover:bg-secondary transition-all duration-200">
          <Avatar className="w-7 h-7">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-secondary text-foreground text-[10px] font-bold font-display">{initials}</AvatarFallback>
          </Avatar>
        </button>
        {open && menu}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary transition-all duration-200 text-left">
        <Avatar className="w-7 h-7">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
          <AvatarFallback className="bg-secondary text-foreground text-[10px] font-bold font-display">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate font-display">{displayName}</p>
        </div>
      </button>
      {open && menu}
    </div>
  );
};

export default ProfileMenu;
