import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import { FaCamera, FaPlus, FaTimes } from "react-icons/fa";

const INTERESTS = [
  "Travel", "Music", "Fitness", "Cooking", "Reading", "Gaming",
  "Photography", "Art", "Movies", "Hiking", "Dancing", "Yoga",
  "Coffee", "Dogs", "Cats", "Sports", "Tech", "Fashion",
];

export default function ProfileSetup() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: "",
    occupation: "",
    location: "",
    interests: [],
  });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

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
    if (photos.length >= 6) return toast.error("Maximum 6 photos allowed");

    const formData = new FormData();
    formData.append("photo", file);
    setUploading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/upload-photo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setPhotos((prev) => [...prev, data.url]);
    } catch {
      toast.error("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (photos.length === 0) return toast.error("Please add at least one photo");
    if (form.interests.length < 3) return toast.error("Please select at least 3 interests");

    setLoading(true);
    try {
      const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        ...form,
        photos,
      });
      updateUser(data.user);
      toast.success("Profile set up! Let's find your match 🎉");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Setup Profile - HeartSync</title></Head>
      <div className="min-h-screen bg-dark px-4 py-10">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Set Up Your Profile</h1>
            <p className="text-gray-400">Help others get to know the real you</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photos */}
            <div className="card">
              <h2 className="text-white font-semibold mb-4">Photos <span className="text-gray-400 font-normal text-sm">(up to 6)</span></h2>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Main</span>
                    )}
                  </div>
                ))}
                {photos.length < 6 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    {uploading ? (
                      <div className="text-gray-400 text-sm">Uploading...</div>
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

            {/* Bio */}
            <div className="card">
              <h2 className="text-white font-semibold mb-4">About You</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell people about yourself..."
                    rows={3}
                    maxLength={300}
                    className="input-field resize-none"
                  />
                  <p className="text-gray-600 text-xs text-right mt-1">{form.bio.length}/300</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Occupation</label>
                  <input
                    name="occupation"
                    type="text"
                    placeholder="What do you do?"
                    value={form.occupation}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Location</label>
                  <input
                    name="location"
                    type="text"
                    placeholder="City, Country"
                    value={form.location}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="card">
              <h2 className="text-white font-semibold mb-1">Interests</h2>
              <p className="text-gray-400 text-sm mb-4">Select 3-8 interests</p>
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
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-4">
              {loading ? "Saving..." : "Complete Profile 🎉"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
