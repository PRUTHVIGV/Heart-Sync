import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { FaCrown } from "react-icons/fa";
import { motion } from "framer-motion";

const Toggle = ({ value, onChange }) => (
  <button onClick={onChange}
    className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${value ? "bg-gradient-to-r from-primary to-accent" : "bg-white/10"}`}>
    <motion.span animate={{ x: value ? 20 : 2 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
  </button>
);

export default function Settings() {
  const { user, loading, updateUser, logout } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    interestedIn: "everyone", ageMin: 18, ageMax: 50, showMe: true,
    notifications: { newMatch: true, newMessage: true, superLike: true },
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) setSettings((prev) => ({
      ...prev,
      interestedIn: user.interestedIn || "everyone",
      ageMin: user.ageMin || 18,
      ageMax: user.ageMax || 50,
      showMe: user.showMe !== false,
      notifications: user.notifications || prev.notifications,
    }));
  }, [user, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/settings`, settings);
      updateUser(data.user);
      toast.success("Settings saved!");
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  };

  if (loading || !user) return null;

  return (
    <>
      <Head><title>Settings - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black text-white">Settings</h1>
            <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 text-sm">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Discovery */}
          <div className="glass p-5 mb-4">
            <h2 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Discovery</h2>
            <div className="space-y-5">
              <div>
                <label className="text-white/40 text-xs mb-2 block uppercase tracking-wider">Show Me</label>
                <div className="grid grid-cols-3 gap-2">
                  {["men", "women", "everyone"].map((opt) => (
                    <button key={opt} onClick={() => setSettings({ ...settings, interestedIn: opt })}
                      className={`py-2 rounded-2xl text-sm font-medium capitalize transition-all border ${
                        settings.interestedIn === opt
                          ? "bg-gradient-to-r from-primary/20 to-accent/20 border-primary/40 text-white"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-white/40 text-xs uppercase tracking-wider">Age Range</label>
                  <span className="text-white text-sm font-bold">{settings.ageMin} – {settings.ageMax}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-white/30 mb-1">
                      <span>Min</span><span>{settings.ageMin}</span>
                    </div>
                    <input type="range" min="18" max={settings.ageMax - 1} value={settings.ageMin}
                      onChange={(e) => setSettings({ ...settings, ageMin: parseInt(e.target.value) })}
                      className="w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-white/30 mb-1">
                      <span>Max</span><span>{settings.ageMax}</span>
                    </div>
                    <input type="range" min={settings.ageMin + 1} max="80" value={settings.ageMax}
                      onChange={(e) => setSettings({ ...settings, ageMax: parseInt(e.target.value) })}
                      className="w-full" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-medium">Show me in Discovery</p>
                  <p className="text-white/30 text-xs mt-0.5">Turn off to pause your profile</p>
                </div>
                <Toggle value={settings.showMe} onChange={() => setSettings((p) => ({ ...p, showMe: !p.showMe }))} />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass p-5 mb-4">
            <h2 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Notifications</h2>
            <div className="space-y-4">
              {[
                { key: "newMatch", label: "New Match", desc: "When someone matches with you" },
                { key: "newMessage", label: "New Message", desc: "When a match sends you a message" },
                { key: "superLike", label: "Super Like", desc: "When someone super likes you" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-white/30 text-xs mt-0.5">{desc}</p>
                  </div>
                  <Toggle
                    value={settings.notifications[key]}
                    onChange={() => setSettings((p) => ({ ...p, notifications: { ...p.notifications, [key]: !p.notifications[key] } }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Premium */}
          {!user.isPremium && (
            <div className="glass p-5 mb-4 border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                  <FaCrown className="text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">Upgrade to Premium</p>
                  <p className="text-white/30 text-xs">Unlimited swipes, super likes & more</p>
                </div>
                <button onClick={() => router.push("/premium")}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full">
                  Upgrade
                </button>
              </div>
            </div>
          )}

          {/* Account */}
          <div className="glass p-5">
            <h2 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Account</h2>
            <div className="space-y-2">
              <button onClick={() => router.push("/profile")}
                className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/8 text-white/60 hover:text-white text-sm text-left transition-all">
                Edit Profile
              </button>
              <button onClick={logout}
                className="w-full py-3 rounded-2xl border border-red-500/20 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm">
                Logout
              </button>
              <button className="w-full py-3 rounded-2xl text-red-900/60 hover:text-red-700 hover:bg-red-900/10 transition-all text-xs">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
