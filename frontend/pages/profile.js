import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { FaCamera, FaTimes, FaEdit, FaSave } from "react-icons/fa";
import { useEffect } from "react";

const INTERESTS = [
  "Travel", "Music", "Fitness", "Cooking", "Reading", "Gaming",
  "Photography", "Art", "Movies", "Hiking", "Dancing", "Yoga",
  "Coffee", "Dogs", "Cats", "Sports", "Tech", "Fashion",
];

export default function Profile() {
  const { user, loading, updateUser, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    bio: "",
    occupation: "",
    location: "",
    interests: [],
    photos: [],
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) {
      setForm({
        bio: user.bio || "",
        occupation: user.occupation || "",
        location: user.location || "",
        interests: user.interests || [],
        photos: user.photos || [],
      });
    }
  }, [user, loading]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 8
        ? [...prev.interests, interest]
        : prev.interests,
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (form.photos.length >= 6) return toast.error("Maximum 6 photos allowed");
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
    } catch {
      toast.error("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, form);
      updateUser(data.user);
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <>
      <Head><title>Profile - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            {editing ? (
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 flex items-center gap-2">
                <FaSave /> {saving ? "Saving..." : "Save"}
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-outline py-2 px-5 flex items-center gap-2">
                <FaEdit /> Edit
              </button>
            )}
          </div>

          {/* Photos */}
          <div className="card mb-6">
            <h2 className="text-white font-semibold mb-4">Photos</h2>
            <div className="grid grid-cols-3 gap-3">
              {form.photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  {editing && (
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Main</span>
                  )}
                </div>
              ))}
              {editing && form.photos.length < 6 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  {uploading ? (
                    <span className="text-gray-400 text-xs">Uploading...</span>
                  ) : (
                    <>
                      <FaCamera className="text-gray-400 text-2xl mb-1" />
                      <span className="text-gray-400 text-xs">Add Photo</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="card mb-6">
            <h2 className="text-white font-semibold mb-4">About</h2>
            <div className="space-y-4">
              {/* Name & Age (read-only) */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Name</label>
                  <p className="text-white font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Age</label>
                  <p className="text-white font-medium">{user.age}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bio</label>
                {editing ? (
                  <>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={3}
                      maxLength={300}
                      className="input-field resize-none"
                      placeholder="Tell people about yourself..."
                    />
                    <p className="text-gray-600 text-xs text-right mt-1">{form.bio.length}/300</p>
                  </>
                ) : (
                  <p className="text-gray-300">{form.bio || <span className="text-gray-600">No bio yet</span>}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Occupation</label>
                {editing ? (
                  <input name="occupation" value={form.occupation} onChange={handleChange} className="input-field" placeholder="What do you do?" />
                ) : (
                  <p className="text-gray-300">{form.occupation || <span className="text-gray-600">Not set</span>}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Location</label>
                {editing ? (
                  <input name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="City, Country" />
                ) : (
                  <p className="text-gray-300">{form.location || <span className="text-gray-600">Not set</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="card mb-6">
            <h2 className="text-white font-semibold mb-4">Interests</h2>
            {editing ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        form.interests.includes(interest)
                          ? "bg-primary text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-3">{form.interests.length}/8 selected</p>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {form.interests.length > 0 ? (
                  form.interests.map((interest) => (
                    <span key={interest} className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600">No interests added yet</p>
                )}
              </div>
            )}
          </div>

          {/* Account */}
          <div className="card">
            <h2 className="text-white font-semibold mb-4">Account</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <p className="text-gray-300">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Member since</label>
                <p className="text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={logout}
                className="w-full mt-2 py-3 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
