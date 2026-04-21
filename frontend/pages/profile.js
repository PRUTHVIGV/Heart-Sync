import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import ProfileScore from "../components/ui/ProfileScore";
import IcebreakerPrompts from "../components/ui/IcebreakerPrompts";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCamera, FaTimes, FaEdit, FaCheck, FaCrown,
  FaHeart, FaMapMarkerAlt, FaBriefcase, FaGraduationCap,
  FaRuler, FaStar, FaChevronDown, FaChevronUp,
} from "react-icons/fa";
import {
  INTEREST_CATEGORIES, RELATIONSHIP_GOALS, LOVE_LANGUAGES,
  PERSONALITY_TYPES, EDUCATION_LEVELS, DRINKING_OPTIONS,
  SMOKING_OPTIONS, EXERCISE_OPTIONS, DIET_OPTIONS,
  KIDS_OPTIONS, ZODIAC_SIGNS,
} from "../utils/profileData";

const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass mb-3 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">{title}</h2>
        </div>
        {open ? <FaChevronUp className="text-white/30 text-xs" /> : <FaChevronDown className="text-white/30 text-xs" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SelectPill = ({ options, value, onChange, multi = false, max = 99 }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => {
      const val = typeof opt === "object" ? opt.value : opt;
      const label = typeof opt === "object" ? opt.label : opt;
      const desc = typeof opt === "object" ? opt.desc : null;
      const selected = multi ? (value || []).includes(val) : value === val;
      return (
        <button key={val} type="button"
          onClick={() => {
            if (multi) {
              const arr = value || [];
              onChange(selected ? arr.filter((v) => v !== val) : arr.length < max ? [...arr, val] : arr);
            } else {
              onChange(selected ? "" : val);
            }
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            selected
              ? "bg-gradient-to-r from-primary/30 to-accent/30 border-primary/50 text-white"
              : "bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
          }`}
        >
          {label}
          {desc && selected && <span className="text-white/40 ml-1 text-xs">· {desc}</span>}
        </button>
      );
    })}
  </div>
);

export default function Profile() {
  const { user, loading, updateUser, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeInterestCat, setActiveInterestCat] = useState(0);
  const [form, setForm] = useState({
    bio: "", occupation: "", company: "", location: "", hometown: "",
    height: "", interests: [], photos: [], prompts: [],
    relationshipGoal: "", loveLanguage: "", personalityType: "",
    zodiac: "", education: "", drinking: "", smoking: "",
    exercise: "", diet: "", kids: "", religion: "", politics: "",
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) setForm({
      bio: user.bio || "",
      occupation: user.occupation || "",
      company: user.company || "",
      location: user.location || "",
      hometown: user.hometown || "",
      height: user.height || "",
      interests: user.interests || [],
      photos: user.photos || [],
      prompts: user.prompts || [],
      relationshipGoal: user.relationshipGoal || "",
      loveLanguage: user.loveLanguage || "",
      personalityType: user.personalityType || "",
      zodiac: user.zodiac || "",
      education: user.education || "",
      drinking: user.drinking || "",
      smoking: user.smoking || "",
      exercise: user.exercise || "",
      diet: user.diet || "",
      kids: user.kids || "",
      religion: user.religion || "",
      politics: user.politics || "",
    });
  }, [user, loading]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, form);
      updateUser(data.user);
      toast.success("Profile updated! 🎉");
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
        <div className="max-w-lg mx-auto px-4 py-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-2xl font-black text-white">My Profile</h1>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="btn-outline py-2 px-4 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                  <FaCheck className="text-xs" /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-outline py-2 px-4 text-sm flex items-center gap-1.5">
                <FaEdit className="text-xs" /> Edit Profile
              </button>
            )}
          </div>

          {/* Profile Score */}
          <ProfileScore user={{ ...user, ...form }} />

          {/* Premium Badge */}
          {user.isPremium && (
            <div className="glass p-3 mb-3 flex items-center gap-2 border-yellow-500/20 bg-yellow-500/5">
              <FaCrown className="text-yellow-400" />
              <span className="text-yellow-400 text-sm font-bold">Premium Member</span>
              <span className="text-white/20 text-xs ml-auto">Active ✓</span>
            </div>
          )}

          {/* ── Photos ── */}
          <Section title="Photos" icon={<FaCamera />}>
            <div className="grid grid-cols-3 gap-2">
              {form.photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img src={photo} alt="" className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = avatarUrl; }} />
                  {editing && (
                    <button onClick={() => set("photos", form.photos.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all">
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">Main</span>}
                </div>
              ))}
              {form.photos.length === 0 && (
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
              )}
              {editing && form.photos.length < 6 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaCamera className="text-white/20 text-xl mb-1" />
                      <span className="text-white/20 text-xs">Add Photo</span>
                    </>
                  )}
                </label>
              )}
            </div>
            <p className="text-white/20 text-xs mt-2">{form.photos.length}/6 photos · First photo is your main photo</p>
          </Section>

          {/* ── About ── */}
          <Section title="About Me" icon={<FaHeart />}>
            <div className="space-y-4">
              {/* Name / Age / Gender - read only */}
              <div className="grid grid-cols-3 gap-3">
                {[["Name", user.name], ["Age", user.age], ["Gender", user.gender]].map(([label, val]) => (
                  <div key={label} className="bg-white/5 rounded-2xl p-3">
                    <p className="text-white/30 text-xs mb-1">{label}</p>
                    <p className="text-white font-semibold text-sm capitalize">{val}</p>
                  </div>
                ))}
              </div>

              {/* Bio */}
              <div>
                <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Bio</label>
                {editing ? (
                  <>
                    <textarea name="bio" value={form.bio} onChange={(e) => set("bio", e.target.value)}
                      rows={4} maxLength={500} placeholder="Write something genuine about yourself..."
                      className="input-field resize-none text-sm" />
                    <p className="text-white/20 text-xs text-right mt-1">{form.bio.length}/500</p>
                  </>
                ) : (
                  <p className="text-white/60 text-sm leading-relaxed">{form.bio || <span className="text-white/20">No bio yet — tell people about yourself!</span>}</p>
                )}
              </div>

              {/* Occupation + Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Job Title</label>
                  {editing ? (
                    <input value={form.occupation} onChange={(e) => set("occupation", e.target.value)}
                      placeholder="e.g. Designer" className="input-field text-sm" />
                  ) : (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      {form.occupation ? <><FaBriefcase className="text-primary text-xs" /> {form.occupation}</> : <span className="text-white/20">Not set</span>}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Company</label>
                  {editing ? (
                    <input value={form.company} onChange={(e) => set("company", e.target.value)}
                      placeholder="e.g. Google" className="input-field text-sm" />
                  ) : (
                    <p className="text-white/60 text-sm">{form.company || <span className="text-white/20">Not set</span>}</p>
                  )}
                </div>
              </div>

              {/* Location + Hometown */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Lives In</label>
                  {editing ? (
                    <input value={form.location} onChange={(e) => set("location", e.target.value)}
                      placeholder="City, Country" className="input-field text-sm" />
                  ) : (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      {form.location ? <><FaMapMarkerAlt className="text-primary text-xs" /> {form.location}</> : <span className="text-white/20">Not set</span>}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Hometown</label>
                  {editing ? (
                    <input value={form.hometown} onChange={(e) => set("hometown", e.target.value)}
                      placeholder="Where you're from" className="input-field text-sm" />
                  ) : (
                    <p className="text-white/60 text-sm">{form.hometown || <span className="text-white/20">Not set</span>}</p>
                  )}
                </div>
              </div>

              {/* Height + Education */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Height</label>
                  {editing ? (
                    <input value={form.height} onChange={(e) => set("height", e.target.value)}
                      placeholder="e.g. 5ft 10in or 178cm" className="input-field text-sm" />
                  ) : (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      {form.height ? <><FaRuler className="text-primary text-xs" /> {form.height}</> : <span className="text-white/20">Not set</span>}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Education</label>
                  {editing ? (
                    <select value={form.education} onChange={(e) => set("education", e.target.value)} className="input-field text-sm">
                      <option value="">Select</option>
                      {EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  ) : (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      {form.education ? <><FaGraduationCap className="text-primary text-xs" /> {form.education}</> : <span className="text-white/20">Not set</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* ── Interests ── */}
          <Section title="Interests" icon={<FaStar />}>
            {editing ? (
              <>
                {/* Category tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                  {INTEREST_CATEGORIES.map((cat, i) => (
                    <button key={i} onClick={() => setActiveInterestCat(i)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeInterestCat === i
                          ? "bg-gradient-to-r from-primary to-accent text-white"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
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
                          selected
                            ? "bg-gradient-to-r from-primary/30 to-accent/30 border-primary/50 text-white"
                            : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                        }`}>
                        {item}
                      </button>
                    );
                  })}
                </div>
                <p className="text-white/20 text-xs">{form.interests.length}/15 selected</p>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {form.interests.length > 0 ? form.interests.map((i) => (
                  <span key={i} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-medium">{i}</span>
                )) : <p className="text-white/20 text-sm">No interests added yet</p>}
              </div>
            )}
          </Section>

          {/* ── Relationship & Personality ── */}
          <Section title="Relationship & Personality" icon="💕" defaultOpen={false}>
            <div className="space-y-5">
              <div>
                <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Looking For</label>
                {editing ? (
                  <SelectPill options={RELATIONSHIP_GOALS} value={form.relationshipGoal}
                    onChange={(v) => set("relationshipGoal", v)} />
                ) : (
                  <p className="text-white/60 text-sm">
                    {RELATIONSHIP_GOALS.find((r) => r.value === form.relationshipGoal)?.label || <span className="text-white/20">Not set</span>}
                  </p>
                )}
              </div>
              <div>
                <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Love Language</label>
                {editing ? (
                  <SelectPill options={LOVE_LANGUAGES} value={form.loveLanguage}
                    onChange={(v) => set("loveLanguage", v)} />
                ) : (
                  <p className="text-white/60 text-sm">
                    {LOVE_LANGUAGES.find((l) => l.value === form.loveLanguage)?.label || <span className="text-white/20">Not set</span>}
                  </p>
                )}
              </div>
              <div>
                <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Personality</label>
                {editing ? (
                  <SelectPill options={PERSONALITY_TYPES} value={form.personalityType}
                    onChange={(v) => set("personalityType", v)} />
                ) : (
                  <p className="text-white/60 text-sm">
                    {PERSONALITY_TYPES.find((p) => p.value === form.personalityType)?.label || <span className="text-white/20">Not set</span>}
                  </p>
                )}
              </div>
              <div>
                <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Zodiac Sign</label>
                {editing ? (
                  <SelectPill options={ZODIAC_SIGNS} value={form.zodiac}
                    onChange={(v) => set("zodiac", v)} />
                ) : (
                  <p className="text-white/60 text-sm">{form.zodiac || <span className="text-white/20">Not set</span>}</p>
                )}
              </div>
            </div>
          </Section>

          {/* ── Lifestyle ── */}
          <Section title="Lifestyle" icon="🌿" defaultOpen={false}>
            <div className="space-y-5">
              {[
                { key: "drinking", label: "Drinking", options: DRINKING_OPTIONS },
                { key: "smoking", label: "Smoking", options: SMOKING_OPTIONS },
                { key: "exercise", label: "Exercise", options: EXERCISE_OPTIONS },
                { key: "diet", label: "Diet", options: DIET_OPTIONS },
                { key: "kids", label: "Kids", options: KIDS_OPTIONS },
              ].map(({ key, label, options }) => (
                <div key={key}>
                  <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">{label}</label>
                  {editing ? (
                    <SelectPill options={options} value={form[key]} onChange={(v) => set(key, v)} />
                  ) : (
                    <p className="text-white/60 text-sm">{form[key] || <span className="text-white/20">Not set</span>}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Religion</label>
                {editing ? (
                  <input value={form.religion} onChange={(e) => set("religion", e.target.value)}
                    placeholder="e.g. Christian, Muslim, Hindu, Atheist..." className="input-field text-sm" />
                ) : (
                  <p className="text-white/60 text-sm">{form.religion || <span className="text-white/20">Not set</span>}</p>
                )}
              </div>
              <div>
                <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Politics</label>
                {editing ? (
                  <input value={form.politics} onChange={(e) => set("politics", e.target.value)}
                    placeholder="e.g. Liberal, Conservative, Apolitical..." className="input-field text-sm" />
                ) : (
                  <p className="text-white/60 text-sm">{form.politics || <span className="text-white/20">Not set</span>}</p>
                )}
              </div>
            </div>
          </Section>

          {/* ── Icebreaker Prompts ── */}
          <Section title="Icebreakers" icon="💬" defaultOpen={false}>
            {editing ? (
              <IcebreakerPrompts prompts={form.prompts} onChange={(p) => set("prompts", p)} />
            ) : (
              <div className="space-y-3">
                {form.prompts?.length > 0 ? form.prompts.map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-white/40 text-xs mb-1">{p.question}</p>
                    <p className="text-white text-sm font-medium">{p.answer}</p>
                  </div>
                )) : <p className="text-white/20 text-sm">No prompts added yet — help matches break the ice!</p>}
              </div>
            )}
          </Section>

          {/* ── Account ── */}
          <Section title="Account" icon="⚙️" defaultOpen={false}>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/40 text-sm">Email</span>
                <span className="text-white/60 text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/40 text-sm">Member since</span>
                <span className="text-white/60 text-sm">{new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/40 text-sm">Status</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.isPremium ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white/40"}`}>
                  {user.isPremium ? "⭐ Premium" : "Free"}
                </span>
              </div>
              {!user.isPremium && (
                <button onClick={() => router.push("/premium")}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 font-bold text-sm flex items-center justify-center gap-2 hover:from-yellow-500/30 transition-all mt-2">
                  <FaCrown /> Upgrade to Premium
                </button>
              )}
              <button onClick={logout}
                className="w-full py-3 rounded-2xl border border-red-500/20 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm mt-1">
                Logout
              </button>
            </div>
          </Section>

        </div>
      </div>
    </>
  );
}
