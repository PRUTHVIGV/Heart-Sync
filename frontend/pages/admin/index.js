import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FaUsers, FaHeart, FaFlag, FaCrown, FaCheck, FaBan, FaSearch, FaArrowLeft } from "react-icons/fa";

const StatCard = ({ icon, label, value, color }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="glass p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-white/40 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white text-2xl font-black mt-0.5">{value ?? "—"}</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("overview");
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) return router.push("/login");
      if (!user.isAdmin) return router.push("/dashboard");
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`),
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data.reports);
      setUsers(usersRes.data.users);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setFetching(false);
    }
  };

  const handleReport = async (reportId, action) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/${reportId}`, { action });
      setReports((prev) => prev.map((r) => r._id === reportId ? { ...r, status: action === "ban" ? "resolved" : "reviewed" } : r));
      toast.success(action === "ban" ? "User banned!" : "Report dismissed");
    } catch { toast.error("Action failed"); }
  };

  const toggleBan = async (userId, isActive) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(isActive ? "User banned" : "User unbanned");
    } catch { toast.error("Action failed"); }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "reports", label: `Reports ${reports.filter(r => r.status === "pending").length > 0 ? `(${reports.filter(r => r.status === "pending").length})` : ""}` },
    { id: "users", label: `Users (${users.length})` },
  ];

  return (
    <>
      <Head><title>Admin Dashboard - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-dark/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <FaHeart className="text-white text-xs" />
            </div>
            <span className="text-white font-bold">HeartSync</span>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">Admin</span>
          </div>
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
            <FaArrowLeft className="text-xs" /> Back to App
          </button>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-2 rounded-2xl text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-gradient-to-r from-primary to-accent text-white"
                    : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<FaUsers />} label="Total Users" value={stats?.totalUsers} color="bg-blue-500/20 text-blue-400" />
                <StatCard icon={<FaHeart />} label="Total Matches" value={stats?.totalMatches} color="bg-primary/20 text-primary" />
                <StatCard icon={<FaCrown />} label="Premium Users" value={stats?.premiumUsers} color="bg-yellow-500/20 text-yellow-400" />
                <StatCard icon={<FaFlag />} label="Pending Reports" value={stats?.pendingReports} color="bg-red-500/20 text-red-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-5">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">New Users (7d)</p>
                  <p className="text-3xl font-black text-primary">{stats?.recentSignups ?? 0}</p>
                  <p className="text-white/30 text-xs mt-1">new signups this week</p>
                </div>
                <div className="glass p-5">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Messages (7d)</p>
                  <p className="text-3xl font-black text-primary">{stats?.recentMessages ?? 0}</p>
                  <p className="text-white/30 text-xs mt-1">messages sent this week</p>
                </div>
                <div className="glass p-5">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Conversion Rate</p>
                  <p className="text-3xl font-black text-yellow-400">
                    {stats?.totalUsers > 0 ? Math.round((stats?.premiumUsers / stats?.totalUsers) * 100) : 0}%
                  </p>
                  <p className="text-white/30 text-xs mt-1">free → premium</p>
                </div>
              </div>
            </div>
          )}

          {/* Reports */}
          {tab === "reports" && (
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="glass p-12 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-white/40">No reports found</p>
                </div>
              ) : reports.map((report) => (
                <div key={report._id} className="glass p-5 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        report.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        report.status === "resolved" ? "bg-red-500/20 text-red-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-white/20 text-xs">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white text-sm">
                      <span className="text-primary font-semibold">{report.reporter?.name}</span>
                      <span className="text-white/40"> reported </span>
                      <span className="text-primary font-semibold">{report.target?.name}</span>
                    </p>
                    <p className="text-white/40 text-sm mt-1">Reason: {report.reason}</p>
                    {report.details && <p className="text-white/30 text-xs mt-1">{report.details}</p>}
                  </div>
                  {report.status === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleReport(report._id, "dismiss")}
                        className="w-9 h-9 bg-green-500/10 hover:bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 transition-all" title="Dismiss">
                        <FaCheck className="text-sm" />
                      </button>
                      <button onClick={() => handleReport(report._id, "ban")}
                        className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 transition-all" title="Ban user">
                        <FaBan className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div>
              <div className="relative mb-4">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm" />
                <input type="text" placeholder="Search by name or email..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10" />
              </div>
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div key={u._id} className="glass p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=FF4458&color=fff&size=80&bold=true`}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=FF4458&color=fff&size=80`; }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-sm">{u.name}</p>
                          {u.isPremium && <FaCrown className="text-yellow-400 text-xs" />}
                          {u.isAdmin && <span className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full">Admin</span>}
                          {!u.isActive && <span className="text-xs text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">Banned</span>}
                        </div>
                        <p className="text-white/30 text-xs">{u.email} · Age {u.age} · {u.gender}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-white/20 text-xs hidden md:block">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                      <button onClick={() => toggleBan(u._id, u.isActive)}
                        className={`text-xs px-3 py-1.5 rounded-xl transition-all ${
                          u.isActive
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        }`}>
                        {u.isActive ? "Ban" : "Unban"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
