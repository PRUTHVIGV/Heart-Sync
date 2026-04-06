import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { FaCog, FaSave } from "react-icons/fa";

export default function Settings() {
  const { user, loading, updateUser, logout } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    interestedIn: "everyone",
    ageMin: 18,
    ageMax: 50,
    showMe: true,
    notifications: {
      newMatch: true,
      newMessage: true,
      superLike: true,
    },
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) {
      setSettings((prev) => ({
        ...prev,
        interestedIn: user.interestedIn || "everyone",
        ageMin: user.ageMin || 18,
        ageMax: user.ageMax || 50,
        showMe: user.showMe !== false,
        notifications: user.notifications || prev.notifications,
      }));
    }
  }, [user, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/settings`,
        settings
      );
      updateUser(data.user);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleNotif = (key) =>
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));

  if (loading || !user) return null;

  return (
    <>
      <Head><title>Settings - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FaCog className="text-primary" /> Settings
            </h1>
            <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 flex items-center gap-2">
              <FaSave /> {saving ? "Saving..." : "Save"}
            </button>
          </div>

          {/* Discovery Preferences */}
          <div className="card mb-4">
            <h2 className="text-white font-semibold mb-4">Discovery Preferences</h2>
            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Show Me</label>
                <select
                  value={settings.interestedIn}
                  onChange={(e) => setSettings({ ...settings, interestedIn: e.target.value })}
                  className="input-field"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="everyone">Everyone</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-400">Age Range</label>
                  <span className="text-sm text-white font-medium">
                    {settings.ageMin} – {settings.ageMax}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Min Age: {settings.ageMin}</label>
                    <input
                      type="range"
                      min="18"
                      max={settings.ageMax - 1}
                      value={settings.ageMin}
                      onChange={(e) => setSettings({ ...settings, ageMin: parseInt(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max Age: {settings.ageMax}</label>
                    <input
                      type="range"
                      min={settings.ageMin + 1}
                      max="80"
                      value={settings.ageMax}
                      onChange={(e) => setSettings({ ...settings, ageMax: parseInt(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Show me in discovery toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-medium">Show me in Discovery</p>
                  <p className="text-gray-500 text-xs">Turn off to pause your profile</p>
                </div>
                <button
                  onClick={() => toggle("showMe")}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.showMe ? "bg-primary" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      settings.showMe ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card mb-4">
            <h2 className="text-white font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              {[
                { key: "newMatch", label: "New Match", desc: "When someone matches with you" },
                { key: "newMessage", label: "New Message", desc: "When a match sends you a message" },
                { key: "superLike", label: "Super Like", desc: "When someone super likes you" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-gray-500 text-xs">{desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotif(key)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settings.notifications[key] ? "bg-primary" : "bg-gray-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        settings.notifications[key] ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="card">
            <h2 className="text-white font-semibold mb-4">Account</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/profile")}
                className="w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-left px-4"
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="w-full py-3 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Logout
              </button>
              <button className="w-full py-3 rounded-xl border border-red-900/40 text-red-700 hover:bg-red-900/10 transition-colors text-sm">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
