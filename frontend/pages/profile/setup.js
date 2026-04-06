import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { FaCamera, FaTimes, FaArrowRight, FaArrowLeft, FaHeart } from "react-icons/fa";
import IcebreakerPrompts from "../../components/ui/IcebreakerPrompts";
import {
  INTEREST_CATEGORIES, RELATIONSHIP_GOALS, LOVE_LANGUAGES,
  PERSONALITY_TYPES, EDUCATION_LEVELS, DRINKING_OPTIONS,
  SMOKING_OPTIONS, EXERCISE_OPTIONS, DIET_OPTIONS, KIDS_OPTIONS, ZODIAC_SIGNS,
} from "../../utils/profileData";

const STEPS = ["Photos", "About", "Interests", "Lifestyle", "Prompts"];

const SelectPill = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => {
      const val = typeof opt === "object" ? opt.value : opt;
      const label = typeof opt === "object" ? opt.label : opt;
      const selected = value === val;
      return (
        <button key={val} type="button" onClick={() => onChange(selected ? "" : val)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            selected
              ? "bg-gradient-to-r from-primary/30 to-accent/30 border-primary/50 text-white"
              : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
          }`}>
          {label}
        </button>
      );
    })}
  </div>
);

export default function ProfileSetup() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeInterestCat, setActiveInterestCat] = useState(0);
  const [form, setForm] = useState({
    photos: [], bio: "", occupation: "", company: "", location: "", hometown: "",
    height: "", interests: [], prompts: [], relationshipGoal: "", loveLanguage: "",
    personalityType: "", zodiac: "", education: "", drinking: "", smoking: "",
    exercise: "", diet: "", kids: "",
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || form.photos.length >= 6) return toast.error("Max 6 photos");
    const fd = new FormData();
    fd.append("photo", file);
    setUploading(true);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/upload-photo`, fd,
        { headers: { "Content-Type": "multipart/form-data" } });
      set("photos", [...form.photos, data.url]);
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const nextStep = () => {
    if (step === 0 && form.photos.length === 0) return toast.error("Add at least 1 photo");
    if (step === 1 && !form.bio.trim()) return toast.error("Write a short bio");
    if (step === 2 && form.interests.length < 3) return toast.error("Select at least 3 interests");
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, form);
      updateUser(data.user);
      toast.success("Profile complete! Let's find your match 🎉");
      router.push("/dashboard");
    } catch { toast.error("Failed to save profile"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Head><title>Setup Profile - HeartSync</title></Head>
      <div className="min-h-screen bg-dark px-4 py-8 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-lg mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FaHeart className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Set Up Your Profile</h1>
            <p className="text-white/40 text-sm mt-1">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>

          {/* Progress */}
          <div className="flex gap-1.5 mb-8">
            {STEPS.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
                <motion.div animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 0: Photos ── */}
            {step === 0 && (
              <motion.div key="photos" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="glass p-6">
                <h2 className="text-white font-bold mb-1">Add Your Photos</h2>
                <p className="text-white/40 text-sm mb-5">Add up to 6 photos. First photo is your main photo.</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {form.photos.map((photo, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => set("photos", form.photos.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all">
                        <FaTimes className="text-xs" />
                      </button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Main</span>}
                    </div>
                  ))}
                  {form.photos.length < 6 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      {uploading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : (
                        <><FaCamera className="text-white/30 text-2xl mb-1" /><span className="text-white/30 text-xs">Add Photo</span></>
                      )}
                    </label>
                  )}
                </div>
                <button onClick={nextStep} className="btn-primary w-full flex items-center justify-center gap-2">
                  Continue <FaArrowRight />
                </button>
              </motion.div>
            )}

            {/* ── Step 1: About ── */}
            {step === 1 && (
              <motion.div key="about" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="glass p-6 space-y-4">
                <h2 className="text-white font-bold mb-1">About You</h2>
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Bio *</label>
                  <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
                    rows={3} maxLength={500} placeholder="Write something genuine about yourself..."
                    className="input-field resize-none text-sm" />
                  <p className="text-white/20 text-xs text-right mt-1">{form.bio.length}/500</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Job Title</label>
                    <input value={form.occupation} onChange={(e) => set("occupation", e.target.value)}
                      placeholder="e.g. Designer" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Company</label>
                    <input value={form.company} onChange={(e) => set("company", e.target.value)}
                      placeholder="e.g. Google" className="input-field text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Lives In</label>
                    <input value={form.location} onChange={(e) => set("location", e.target.value)}
                      placeholder="City, Country" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Height</label>
                    <input value={form.height} onChange={(e) => set("height", e.target.value)}
                      placeholder="5'10\" or 178cm" className="input-field text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Education</label>
                  <select value={form.education} onChange={(e) => set("education", e.target.value)} className="input-field text-sm">
                    <option value="">Select education level</option>
                    {EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Zodiac Sign</label>
                  <SelectPill options={ZODIAC_SIGNS} value={form.zodiac} onChange={(v) => set("zodiac", v)} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(0)} className="btn-outline px-4 py-3"><FaArrowLeft /></button>
                  <button onClick={nextStep} className="btn-primary flex-1 flex items-center justify-center gap-2">Continue <FaArrowRight /></button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Interests ── */}
            {step === 2 && (
              <motion.div key="interests" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="glass p-6">
                <h2 className="text-white font-bold mb-1">Your Interests</h2>
                <p className="text-white/40 text-sm mb-4">Pick 3–15 things you love</p>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {INTEREST_CATEGORIES.map((cat, i) => (
                    <button key={i} onClick={() => setActiveInterestCat(i)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeInterestCat === i ? "bg-gradient-to-r from-primary to-accent text-white" : "bg-white/5 text-white/40"
                      }`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[80px]">
                  {INTEREST_CATEGORIES[activeInterestCat].items.map((item) => {
                    const selected = form.interests.includes(item);
                    return (
                      <button key={item} type="button"
                        onClick={() => {
                          if (selected) set("interests", form.interests.filter((i) => i !== item));
                          else if (form.interests.length < 15) set("interests", [...form.interests, item]);
                          else toast.error("Max 15 interests");
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          selected ? "bg-gradient-to-r from-primary/30 to-accent/30 border-primary/50 text-white" : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                        }`}>
                        {item}
                      </button>
                    );
                  })}
                </div>
                <p className="text-white/20 text-xs mb-4">{form.interests.length}/15 selected</p>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline px-4 py-3"><FaArrowLeft /></button>
                  <button onClick={nextStep} className="btn-primary flex-1 flex items-center justify-center gap-2">Continue <FaArrowRight /></button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Lifestyle ── */}
            {step === 3 && (
              <motion.div key="lifestyle" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="glass p-6 space-y-5">
                <h2 className="text-white font-bold mb-1">Relationship & Lifestyle</h2>
                <div>
                  <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Looking For</label>
                  <SelectPill options={RELATIONSHIP_GOALS} value={form.relationshipGoal} onChange={(v) => set("relationshipGoal", v)} />
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Love Language</label>
                  <SelectPill options={LOVE_LANGUAGES} value={form.loveLanguage} onChange={(v) => set("loveLanguage", v)} />
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Personality</label>
                  <SelectPill options={PERSONALITY_TYPES} value={form.personalityType} onChange={(v) => set("personalityType", v)} />
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Drinking</label>
                  <SelectPill options={DRINKING_OPTIONS} value={form.drinking} onChange={(v) => set("drinking", v)} />
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Smoking</label>
                  <SelectPill options={SMOKING_OPTIONS} value={form.smoking} onChange={(v) => set("smoking", v)} />
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Exercise</label>
                  <SelectPill options={EXERCISE_OPTIONS} value={form.exercise} onChange={(v) => set("exercise", v)} />
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Diet</label>
                  <SelectPill options={DIET_OPTIONS} value={form.diet} onChange={(v) => set("diet", v)} />
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Kids</label>
                  <SelectPill options={KIDS_OPTIONS} value={form.kids} onChange={(v) => set("kids", v)} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(2)} className="btn-outline px-4 py-3"><FaArrowLeft /></button>
                  <button onClick={nextStep} className="btn-primary flex-1 flex items-center justify-center gap-2">Continue <FaArrowRight /></button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Prompts ── */}
            {step === 4 && (
              <motion.div key="prompts" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="glass p-6">
                <h2 className="text-white font-bold mb-1">Icebreaker Prompts</h2>
                <p className="text-white/40 text-sm mb-5">Add up to 3 prompts to help matches start a conversation</p>
                <IcebreakerPrompts prompts={form.prompts} onChange={(p) => set("prompts", p)} />
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(3)} className="btn-outline px-4 py-3"><FaArrowLeft /></button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-base py-3.5">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    ) : "Complete Profile 🎉"}
                  </button>
                </div>
                <button onClick={handleSubmit} disabled={loading}
                  className="w-full mt-2 text-white/30 text-xs hover:text-white/50 transition-colors py-2">
                  Skip for now
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
