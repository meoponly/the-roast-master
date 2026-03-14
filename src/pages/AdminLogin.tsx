import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import voidxLogo from "@/assets/voidx-logo.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in as admin
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
        if (data) navigate("/admin-dashboard", { replace: true });
      }
    };
    checkAdmin();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: authData.user.id,
        _role: "admin",
      });

      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error("Access denied. Not an admin.");
        return;
      }

      navigate("/admin-dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center scanlines relative">
      <div className="w-full max-w-sm mx-auto p-6">
        <div className="text-center mb-8">
          <img src={voidxLogo} alt="VOID-X" className="w-12 h-12 mx-auto mb-3 rounded-2xl shadow-lg" />
          <h1 className="text-xl font-bold text-foreground neon-text tracking-wider font-display">ADMIN</h1>
          <p className="text-xs text-muted-foreground mt-1">Restricted access</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@void.com" required
              className="w-full bg-input border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="password" required minLength={6}
              className="w-full bg-input border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-accent text-accent-foreground rounded text-xs font-bold font-mono hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? "..." : "Admin Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
