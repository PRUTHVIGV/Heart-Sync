import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import toast from "react-hot-toast";
import { FaUsers, FaHeart, FaFlag, FaCrown, FaCheck, FaTimes, FaBan } from "react-icons/fa";

const StatCard = ({ icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white text-2xl font-bold">{value ?? "—"}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState("overview");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) return router.push("/login");
      if (!user.isAdmin) return router.push("/dashboard");
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports`),
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data.reports);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setFetching(false);
    }
  };

  const handleReport = async (reportId, action) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/${reportId}`, { action });
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status: action === "ban" ? "resolved" : "reviewed" } : r))
      );
      toast.success(action === "ban" ? "User banned!" : "Report dismissed");
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head><title>Admin - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        {/* Admin Navbar */}
        <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-dark">
          <div className="flex items-center gap-2">
            <FaHeart className="text-primary text-xl" />
            <span className="text-xl font-bold text-white">HeartSync</span>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full ml-2">Admin</span>
          </div>
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white text-sm">
            ← Back to App
          </button>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {["overview", "reports", "users"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  tab === t ? "bg-primary text-white" : "bg-card text-gray-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<FaUsers />} label="Total Users" value={stats?.totalUsers} color="bg-blue-500/20 text-blue-400" />
                <StatCard icon={<FaHeart />} label="Total Matches" value={stats?.totalMatches} color="bg-primary/20 text-primary" />
                <StatCard icon={<FaCrown />} label="Premium Users" value={stats?.premiumUsers} color="bg-yellow-500/20 text-yellow-400" />
                <StatCard icon={<FaFlag />} label="Pending Reports" value={stats?.pendingReports} color="bg-red-500/20 text-red-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card">
                  <h3 className="text-white font-semibold mb-4">Recent Signups (7 days)</h3>
                  <p className="text-3xl font-bold text-primary">{stats?.recentSignups ?? 0}</p>
                  <p className="text-gray-400 text-sm mt-1">new users this week</p>
                </div>
                <div className="card">
                  <h3 className="text-white font-semibold mb-4">Messages Sent (7 days)</h3>
                  <p className="text-3xl font-bold text-primary">{stats?.recentMessages ?? 0}</p>
                  <p className="text-gray-400 text-sm mt-1">messages this week</p>
                </div>
              </div>
            </div>
          )}

          {tab === "reports" && (
            <div className="space-y-3">
              <h2 className="text-white font-semibold text-lg mb-4">
                User Reports <span className="text-gray-400 font-normal text-sm">({reports.length})</span>
              </h2>
              {reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No reports found</div>
              ) : (
                reports.map((report) => (
                  <div key={report._id} className="card flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            report.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {report.status}
                        </span>
                        <span className="text-gray-400 text-xs">{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        <span className="text-primary">{report.reporter?.name}</span> reported{" "}
                        <span className="text-primary">{report.target?.name}</span>
                      </p>
                      <p className="text-gray-400 text-sm">Reason: {report.reason}</p>
                      {report.details && <p className="text-gray-500 text-xs mt-1">{report.details}</p>}
                    </div>
                    {report.status === "pending" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleReport(report._id, "dismiss")}
                          className="w-9 h-9 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-300"
                          title="Dismiss"
                        >
                          <FaCheck className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleReport(report._id, "ban")}
                          className="w-9 h-9 bg-red-500/20 hover:bg-red-500/40 rounded-xl flex items-center justify-center text-red-400"
                          title="Ban user"
                        >
                          <FaBan className="text-sm" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "users" && (
            <AdminUsers />
          )}
        </div>
      </div>
    </>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`);
      setUsers(data.users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (userId, isActive) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        isActive: !isActive,
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !isActive } : u))
      );
      toast.success(isActive ? "User banned" : "User unbanned");
    } catch {
      toast.error("Action failed");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field mb-4"
      />
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u._id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={u.photos?.[0] || `https://ui-avatars.com/api/?name=${u.name}&background=FF4458&color=fff&size=80`}
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">{u.name}</p>
                    {u.isPremium && <FaCrown className="text-yellow-400 text-xs" />}
                    {!u.isActive && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Banned</span>}
                  </div>
                  <p className="text-gray-500 text-xs">{u.email} · Age {u.age}</p>
                </div>
              </div>
              <button
                onClick={() => toggleBan(u._id, u.isActive)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  u.isActive
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/40"
                    : "bg-green-500/20 text-green-400 hover:bg-green-500/40"
                }`}
              >
                {u.isActive ? "Ban" : "Unban"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
