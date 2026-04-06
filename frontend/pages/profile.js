import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { FaCamera, FaTimes, FaEdit, FaCheck, FaCrown } from "react-icons/fa";
import { motion } from "framer-motion";

const INTERESTS = [
  "Travel","Music","Fitness","Cooking","Reading","Gaming",
  "Photography","Art","Movies","Hiking","Dancing","Yoga",
  "Coffee","Dogs","Cats","Sports","Tech","Fashion",
];

export default function Profile() {
  const { user, loading, updateUser, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ bio: "", occupation: "", location: "", interests: [], photos: [] });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) setForm({
      bio: user.bio || "",
      occupation: user.occupation || "",
      location: user.location || "",
      interests: user.interests || [],
      photos: user.photos || [],
    });
  }, [user, loading]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 8 ? [...prev.interests, interest] : prev.interests,
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (form.photos.length >= 6) return toast.error("Maximum 6 photos");
    const formData = new FormData();
    formData.append("photo", file);
    setUploading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/upload-photo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setForm((prev) => ({ ...prev, photos: [...prev.photos, data.url] }));
    } catch { toast.error("Photo upload failed"); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, form);
      updateUser(data.user);
      toast.success("Profile updated!");
      setEditing(false);
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading || !user) return null;

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FF4458&color=fff&size=200&bold=true`;

  return (
    <>
      <Head><title>Profile - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black text-white">My Profile</h1>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="btn-outline py-2 px-4 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-4 text-sm flex items-center gap-1">
                  <FaCheck /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-outline py-2 px-4 text-sm flex items-center gap-1">
                <FaEdit /> Edit
              </button>
            )}
          </div>

          {/* Premium badge */}
          {user.isPremium && (
            <div className="glass p-3 mb-4 flex items-center gap-2 border-yellow-500/20">
              <FaCrown className="text-yellow-400" />
              <span className="text-yellow-400 text-sm font-semibold">Premium Member</span>
              <span className="text-white/30 text-xs ml-auto">Active</span>
            </div>
          )}

          {/* Photos */}
          <div className="glass p-5 mb-4">
            <h2 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {form.photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden">
                  <img src={photo} alt="" className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = avatarUrl; }} />
                  {editing && (
                    <button onClick={() => setForm((p) => ({ ...p, photos: p.photos.filter((_, j) => j !== i) }))}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Main</span>}
                </div>
              ))}
              {editing && form.photos.length < 6 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaCamera className="text-white/30 text-xl mb-1" />
                      <span className="text-white/30 text-xs">Add</span>
                    </>
                  )}
                </label>
              )}
              {form.photos.length === 0 && !editing && (
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <div className="glass p-5 mb-4">
            <h2 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">About</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-white/30 text-xs mb-1">Name</p>
                  <p className="text-white font-semibold">{user.name}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-1">Age</p>
                  <p className="text-white font-semibold">{user.age}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-1">Gender</p>
                  <p className="text-white font-semibold capitalize">{user.gender}</p>
                </div>
              </div>

              {["bio", "occupation", "location"].map((field) => (
                <div key={field}>
                  <p className="text-white/30 text-xs mb-1 capitalize">{field}</p>
                  {editing ? (
                    field === "bio" ? (
                      <div>
                        <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                          maxLength={300} placeholder="Tell people about yourself..."
                          className="input-field resize-none text-sm" />
                        <p className="text-white/20 text-xs text-right mt-1">{form.bio.length}/300</p>
                      </div>
                    ) : (
                      <input name={field} value={form[field]} onChange={handleChange}
                        placeholder={field === "occupation" ? "What do you do?" : "City, Country"}
                        className="input-field text-sm" />
                    )
                  ) : (
                    <p className="text-white/60 text-sm">{form[field] || <span className="text-white/20">Not set</span>}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="glass p-5 mb-4">
            <h2 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Interests</h2>
            {editing ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        form.interests.includes(interest)
                          ? "bg-gradient-to-r from-primary to-accent text-white"
                          : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"
                      }`}>
                      {interest}
                    </button>
                  ))}
                </div>
                <p className="text-white/20 text-xs mt-3">{form.interests.length}/8 selected</p>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {form.interests.length > 0 ? form.interests.map((i) => (
                  <span key={i} className="bg-primary/15 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-medium">{i}</span>
                )) : <p className="text-white/20 text-sm">No interests added yet</p>}
              </div>
            )}
          </div>

          {/* Account */}
          <div className="glass p-5">
            <h2 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Account</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/30 text-sm">Email</span>
                <span className="text-white/60 text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/30 text-sm">Member since</span>
                <span className="text-white/60 text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              {!user.isPremium && (
                <button onClick={() => router.push("/premium")}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 font-semibold text-sm flex items-center justify-center gap-2 hover:from-yellow-500/30 transition-all">
                  <FaCrown /> Upgrade to Premium
                </button>
              )}
              <button onClick={logout}
                className="w-full py-3 rounded-2xl border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
