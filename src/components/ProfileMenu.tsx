import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, Sparkles, User } from "lucide-react";
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

const ProfileMenu = ({
  displayName,
  handle,
  avatarUrl,
  onOpenSettings,
  onOpenPersonalization,
  onLogout,
  collapsed,
}: ProfileMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : "VX";

  if (collapsed) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-full hover:bg-secondary transition-colors"
        >
          <Avatar className="w-7 h-7">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-accent/20 text-accent text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
        {open && (
          <div className="absolute bottom-full left-0 mb-2 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1 animate-fade-in">
            <MenuContent
              displayName={displayName}
              handle={handle}
              onOpenSettings={() => { setOpen(false); onOpenSettings(); }}
              onOpenPersonalization={() => { setOpen(false); onOpenPersonalization(); }}
              onLogout={onLogout}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
      >
        <Avatar className="w-7 h-7">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
          <AvatarFallback className="bg-accent/20 text-accent text-[10px] font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
        </div>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 py-1 animate-fade-in">
          <MenuContent
            displayName={displayName}
            handle={handle}
            onOpenSettings={() => { setOpen(false); onOpenSettings(); }}
            onOpenPersonalization={() => { setOpen(false); onOpenPersonalization(); }}
            onLogout={onLogout}
          />
        </div>
      )}
    </div>
  );
};

const MenuContent = ({
  displayName,
  handle,
  onOpenSettings,
  onOpenPersonalization,
  onLogout,
}: {
  displayName: string;
  handle: string;
  onOpenSettings: () => void;
  onOpenPersonalization: () => void;
  onLogout: () => void;
}) => (
  <>
    <div className="px-3 py-2 border-b border-border">
      <p className="text-xs font-medium text-foreground">{displayName}</p>
      <p className="text-[10px] text-muted-foreground">{handle}</p>
    </div>
    <button
      onClick={onOpenPersonalization}
      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
    >
      <Sparkles className="w-3.5 h-3.5 text-accent" />
      Personalization
    </button>
    <button
      onClick={onOpenSettings}
      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
    >
      <Settings className="w-3.5 h-3.5 text-muted-foreground" />
      Settings
    </button>
    <div className="border-t border-border mt-1" />
    <button
      onClick={onLogout}
      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-secondary transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" />
      Log out
    </button>
  </>
);

export default ProfileMenu;
