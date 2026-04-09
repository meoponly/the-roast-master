import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Users, MessageSquare, Activity, LogOut, Shield, ArrowLeft, ChevronRight } from "lucide-react";
import voidxLogo from "@/assets/voidx-logo.png";

type UserRow = { id: string; email: string | null; display_name: string | null; handle: string | null; created_at: string; avatar_url: string | null };
type SessionRow = { id: string; title: string; user_id: string | null; first_message: string | null; created_at: string };
type MessageRow = { id: string; user_id: string; conversation_id: string; role: string; content: string; created_at: string; image_url: string | null; edited_image_url: string | null };

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<"users" | "chats" | "activity">("users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const navigate = useNavigate();

  // User drill-down state
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [userSessions, setUserSessions] = useState<SessionRow[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null);
  const [sessionMessages, setSessionMessages] = useState<MessageRow[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

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
      if (u.data) setUsers(u.data as UserRow[]);
      if (s.data) setSessions(s.data);
      if (m.data) setMessages(m.data as MessageRow[]);
    };
    load();
  }, [authorized]);

  const handleSelectUser = async (user: UserRow) => {
    setSelectedUser(user);
    setSelectedSession(null);
    setSessionMessages([]);
    setLoadingDetail(true);
    const { data } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setUserSessions(data || []);
    setLoadingDetail(false);
  };

  const handleSelectSession = async (session: SessionRow) => {
    setSelectedSession(session);
    setLoadingDetail(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", session.id)
      .order("created_at", { ascending: true });
    setSessionMessages((data as MessageRow[]) || []);
    setLoadingDetail(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#08090C] flex items-center justify-center">
      <div className="w-4 h-4 rounded-full bg-[#6EE7B7] animate-pulse" />
    </div>
  );

  const tabs = [
    { key: "users" as const, label: "Users", icon: Users, count: users.length },
    { key: "chats" as const, label: "Chat Sessions", icon: MessageSquare, count: sessions.length },
    { key: "activity" as const, label: "Messages", icon: Activity, count: messages.length },
  ];

  const renderUserDetail = () => {
    if (!selectedUser) return null;

    // Viewing a specific chat session
    if (selectedSession) {
      return (
        <div className="space-y-3">
          <button onClick={() => { setSelectedSession(null); setSessionMessages([]); }}
            className="flex items-center gap-2 text-xs text-[#6EE7B7] hover:text-[#A8FF78] transition-colors mb-4 font-mono">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {selectedUser.display_name}'s chats
          </button>
          <div className="bg-[#0F1117] border border-[#1A1D27] rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-[#E8EAF0]">{selectedSession.title}</p>
            <p className="text-[10px] text-[#5A6070] mt-1">
              {new Date(selectedSession.created_at).toLocaleString()} • {sessionMessages.length} messages
            </p>
          </div>
          {loadingDetail ? (
            <div className="flex justify-center py-8"><div className="w-4 h-4 rounded-full bg-[#6EE7B7] animate-pulse" /></div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {sessionMessages.map((m) => (
                <div key={m.id} className={`rounded-lg p-3 max-w-[80%] ${m.role === "user" ? "bg-[#1A1D27] ml-auto" : "bg-[#0F1117] border border-[#1A1D27]"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${m.role === "user" ? "bg-[#1A1D27] text-[#E8EAF0] border border-[#5A6070]/30" : "bg-[#6EE7B7]/10 text-[#6EE7B7]"}`}>
                      {m.role === "user" ? "USER" : "VX"}
                    </span>
                    <span className="text-[10px] text-[#5A6070]">{new Date(m.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${m.role === "user" ? "text-[#E8EAF0]" : "text-[#A8FF78] font-mono"}`}>
                    {m.content}
                  </p>
                  {m.image_url && <img src={m.image_url} alt="uploaded" className="mt-2 rounded max-w-[200px] max-h-[200px] object-cover" />}
                  {m.edited_image_url && <img src={m.edited_image_url} alt="edited" className="mt-2 rounded max-w-[200px] max-h-[200px] object-cover border border-[#6EE7B7]/30" />}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Viewing user's chat list
    return (
      <div className="space-y-3">
        <button onClick={() => { setSelectedUser(null); setUserSessions([]); }}
          className="flex items-center gap-2 text-xs text-[#6EE7B7] hover:text-[#A8FF78] transition-colors mb-4 font-mono">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to all users
        </button>
        <div className="bg-[#0F1117] border border-[#1A1D27] rounded-lg p-4 mb-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#6EE7B7]/20 flex items-center justify-center text-[#6EE7B7] text-sm font-bold overflow-hidden">
            {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} className="w-full h-full object-cover rounded-full" /> : (selectedUser.display_name || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#E8EAF0]">{selectedUser.display_name || "Unknown"}</p>
            <p className="text-[10px] text-[#5A6070]">{selectedUser.email} • {selectedUser.handle}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-[#6EE7B7] font-mono">{userSessions.length} chats</p>
            <p className="text-[10px] text-[#5A6070]">Joined {new Date(selectedUser.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        {loadingDetail ? (
          <div className="flex justify-center py-8"><div className="w-4 h-4 rounded-full bg-[#6EE7B7] animate-pulse" /></div>
        ) : userSessions.length === 0 ? (
          <p className="text-xs text-[#5A6070] text-center py-8 font-mono">No chats found for this user.</p>
        ) : (
          userSessions.map((s) => (
            <button key={s.id} onClick={() => handleSelectSession(s)}
              className="w-full bg-[#0F1117] border border-[#1A1D27] rounded-lg p-4 text-left hover:border-[#6EE7B7]/30 transition-colors group">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#E8EAF0]">{s.title}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-[#5A6070]">{new Date(s.created_at).toLocaleDateString()}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-[#5A6070] group-hover:text-[#6EE7B7] transition-colors" />
                </div>
              </div>
              {s.first_message && <p className="text-[10px] text-[#5A6070] mt-1 truncate">{s.first_message}</p>}
            </button>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-[#E8EAF0]">
      <header className="border-b border-[#1A1D27] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={voidxLogo} alt="VOID-X" className="w-8 h-8 rounded-xl" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6EE7B7]" />
            <span className="text-sm font-bold font-mono text-[#6EE7B7]">ADMIN DASHBOARD</span>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-[#5A6070] hover:text-[#FF4444] transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </header>

      <div className="flex border-b border-[#1A1D27]">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setSelectedUser(null); setSelectedSession(null); }}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-mono transition-colors border-b-2 ${tab === t.key ? "border-[#6EE7B7] text-[#6EE7B7]" : "border-transparent text-[#5A6070] hover:text-[#E8EAF0]"}`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label} <span className="text-[10px] bg-[#0F1117] px-1.5 py-0.5 rounded">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {tab === "users" && (
          selectedUser ? renderUserDetail() : (
            <div className="space-y-2">
              {users.map((u) => (
                <button key={u.id} onClick={() => handleSelectUser(u)}
                  className="w-full bg-[#0F1117] border border-[#1A1D27] rounded-lg p-4 flex items-center gap-4 hover:border-[#6EE7B7]/30 transition-colors group text-left">
                  <div className="w-8 h-8 rounded-full bg-[#6EE7B7]/20 flex items-center justify-center text-[#6EE7B7] text-xs font-bold overflow-hidden">
                    {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover rounded-full" /> : (u.display_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-[#E8EAF0]">{u.display_name || "Unknown"}</p>
                    <p className="text-[10px] text-[#5A6070]">{u.email} • {u.handle}</p>
                  </div>
                  <p className="text-[10px] text-[#5A6070]">{new Date(u.created_at).toLocaleDateString()}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-[#5A6070] group-hover:text-[#6EE7B7] transition-colors" />
                </button>
              ))}
            </div>
          )
        )}

        {tab === "chats" && (
          <div className="space-y-2">
            {sessions.map((s) => (
              <button key={s.id} onClick={() => {
                const user = users.find(u => u.id === s.user_id);
                if (user) { setSelectedUser(user); setTab("users"); handleSelectUser(user).then(() => handleSelectSession(s)); }
              }}
                className="w-full bg-[#0F1117] border border-[#1A1D27] rounded-lg p-4 text-left hover:border-[#6EE7B7]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#E8EAF0]">{s.title}</p>
                  <p className="text-[10px] text-[#5A6070]">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                {s.first_message && <p className="text-[10px] text-[#5A6070] mt-1 truncate">{s.first_message}</p>}
                <p className="text-[10px] text-[#5A6070] mt-1">User: {s.user_id?.slice(0, 8)}...</p>
              </button>
            ))}
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-1">
            {messages.map((m) => (
              <div key={m.id} className="bg-[#0F1117] border border-[#1A1D27] rounded p-3 flex gap-3">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${m.role === "user" ? "bg-[#1A1D27] text-[#E8EAF0]" : "bg-[#6EE7B7]/10 text-[#6EE7B7]"}`}>
                  {m.role}
                </span>
                <p className="text-xs text-[#5A6070] truncate flex-1">{m.content.slice(0, 120)}</p>
                <p className="text-[10px] text-[#5A6070] shrink-0">{new Date(m.created_at).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
