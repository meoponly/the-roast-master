import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Users, MessageSquare, Activity, LogOut, Shield } from "lucide-react";
import voidxLogo from "@/assets/voidx-logo.png";

type UserRow = { id: string; email: string | null; display_name: string | null; handle: string | null; created_at: string };
type SessionRow = { id: string; title: string; user_id: string | null; first_message: string | null; created_at: string };
type MessageRow = { id: string; user_id: string; conversation_id: string; role: string; content: string; created_at: string };

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<"users" | "chats" | "activity">("users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin-login", { replace: true }); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!data) { navigate("/admin-login", { replace: true }); return; }
      setAuthorized(true);
      setLoading(false);
    };
    check();
  }, [navigate]);

  useEffect(() => {
    if (!authorized) return;
    const load = async () => {
      const [u, s, m] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("chat_sessions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
      if (u.data) setUsers(u.data);
      if (s.data) setSessions(s.data);
      if (m.data) setMessages(m.data as MessageRow[]);
    };
    load();
  }, [authorized]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-4 h-4 rounded-full bg-accent animate-pulse" />
    </div>
  );

  const tabs = [
    { key: "users" as const, label: "Users", icon: Users, count: users.length },
    { key: "chats" as const, label: "Chat Sessions", icon: MessageSquare, count: sessions.length },
    { key: "activity" as const, label: "Messages", icon: Activity, count: messages.length },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={voidxLogo} alt="VOID-X" className="w-8 h-8 rounded-xl" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold font-display neon-text">ADMIN DASHBOARD</span>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </header>

      <div className="flex border-b border-border">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-mono transition-colors border-b-2 ${tab === t.key ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label} <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {tab === "users" && (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                  {(u.display_name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{u.display_name || "Unknown"}</p>
                  <p className="text-[10px] text-muted-foreground">{u.email} • {u.handle}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "chats" && (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                {s.first_message && <p className="text-[10px] text-muted-foreground mt-1 truncate">{s.first_message}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">User: {s.user_id?.slice(0, 8)}...</p>
              </div>
            ))}
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-1">
            {messages.map((m) => (
              <div key={m.id} className="bg-card border border-border rounded p-3 flex gap-3">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.role === "user" ? "bg-secondary text-foreground" : "bg-accent/20 text-accent"}`}>
                  {m.role}
                </span>
                <p className="text-xs text-muted-foreground truncate flex-1">{m.content.slice(0, 120)}</p>
                <p className="text-[10px] text-muted-foreground shrink-0">{new Date(m.created_at).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
