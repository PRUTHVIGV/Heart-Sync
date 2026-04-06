import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaMapMarkerAlt, FaBriefcase, FaFlag, FaHeart, FaStar, FaGraduationCap, FaRuler } from "react-icons/fa";
import ReportModal from "../../components/ui/ReportModal";

const InfoBadge = ({ icon, label }) => label ? (
  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full">
    <span className="text-primary text-xs">{icon}</span> {label}
  </span>
) : null;

const goalLabel = {
  "long-term": "💍 Long-term",
  "marriage": "👰 Marriage-minded",
  "casual": "😊 Casual dating",
  "friendship": "🤝 Friends first",
  "unsure": "🤷 Open to anything",
};

const loveLabel = {
  "words": "💬 Words of Affirmation",
  "acts": "🛠️ Acts of Service",
  "gifts": "🎁 Receiving Gifts",
  "time": "⏰ Quality Time",
  "touch": "🤗 Physical Touch",
};

export default function UserProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`);
      setProfile(data.user);
    } catch {
      router.push("/dashboard");
    } finally {
      setFetching(false);
    }
  };

  if (fetching || !profile) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
          <FaHeart className="text-white" />
        </motion.div>
      </div>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=FF4458&color=fff&size=400&bold=true`;
  const photos = profile.photos?.length > 0 ? profile.photos : [avatarUrl];

  return (
    <>
      <Head><title>{profile.name}, {profile.age} - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">

        {/* Photo hero */}
        <div className="relative h-[65vh]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentPhoto}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={photos[currentPhoto]}
              alt={profile.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = avatarUrl; }}
            />
          </AnimatePresence>

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />

          {/* Top buttons */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 pt-safe">
            <button onClick={() => router.back()}
              className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all">
              <FaArrowLeft />
            </button>
            <button onClick={() => setShowReport(true)}
              className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-black/60 transition-all">
              <FaFlag className="text-sm" />
            </button>
          </div>

          {/* Photo dots */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-16 right-16 flex gap-1">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setCurrentPhoto(i)}
                  className={`flex-1 h-0.5 rounded-full transition-all ${i === currentPhoto ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
          )}

          {/* Tap zones */}
          <div className="absolute inset-0 flex" style={{ top: "60px", bottom: "100px" }}>
            <div className="w-1/2 cursor-pointer" onClick={() => setCurrentPhoto(Math.max(0, currentPhoto - 1))} />
            <div className="w-1/2 cursor-pointer" onClick={() => setCurrentPhoto(Math.min(photos.length - 1, currentPhoto + 1))} />
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-white text-4xl font-black tracking-tight">
              {profile.name}
              <span className="font-light text-white/70 ml-3">{profile.age}</span>
              {profile.height && <span className="font-light text-white/40 text-2xl ml-2">{profile.height}</span>}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.location && (
                <span className="flex items-center gap-1 text-white/60 text-sm">
                  <FaMapMarkerAlt className="text-primary text-xs" /> {profile.location}
                </span>
              )}
              {profile.occupation && (
                <span className="flex items-center gap-1 text-white/60 text-sm">
                  <FaBriefcase className="text-primary text-xs" />
                  {profile.occupation}{profile.company ? ` @ ${profile.company}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">

          {/* Quick badges */}
          <div className="flex flex-wrap gap-2">
            {profile.relationshipGoal && (
              <span className="bg-primary/15 border border-primary/25 text-primary text-xs px-3 py-1.5 rounded-full font-medium">
                {goalLabel[profile.relationshipGoal]}
              </span>
            )}
            {profile.personalityType && (
              <span className="bg-white/5 border border-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full capitalize">
                {profile.personalityType === "introvert" ? "🏠" : profile.personalityType === "extrovert" ? "🎉" : "⚖️"} {profile.personalityType}
              </span>
            )}
            {profile.zodiac && (
              <span className="bg-white/5 border border-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full">
                {profile.zodiac}
              </span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="glass p-5">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-2">About</p>
              <p className="text-white/80 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Icebreaker prompts */}
          {profile.prompts?.length > 0 && (
            <div className="space-y-3">
              {profile.prompts.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-5">
                  <p className="text-primary text-xs font-semibold mb-2">{p.question}</p>
                  <p className="text-white font-medium">{p.answer}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="glass p-5">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span key={interest}
                    className="bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-1.5 rounded-full font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle */}
          {(profile.education || profile.loveLanguage || profile.drinking || profile.smoking || profile.exercise || profile.diet || profile.kids) && (
            <div className="glass p-5">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Lifestyle</p>
              <div className="flex flex-wrap gap-2">
                <InfoBadge icon={<FaGraduationCap />} label={profile.education} />
                {profile.loveLanguage && <InfoBadge icon="❤️" label={loveLabel[profile.loveLanguage]} />}
                {profile.exercise && profile.exercise !== "Never" && <InfoBadge icon="🏃" label={`${profile.exercise} exercise`} />}
                {profile.drinking && profile.drinking !== "Prefer not to say" && <InfoBadge icon="🍷" label={profile.drinking === "Never" ? "Doesn't drink" : `Drinks ${profile.drinking.toLowerCase()}`} />}
                {profile.smoking && profile.smoking !== "Prefer not to say" && <InfoBadge icon="🚭" label={profile.smoking === "Never" ? "Non-smoker" : profile.smoking} />}
                {profile.diet && profile.diet !== "No restrictions" && <InfoBadge icon="🥗" label={profile.diet} />}
                {profile.kids && <InfoBadge icon="👶" label={profile.kids} />}
              </div>
            </div>
          )}

          {/* Basics */}
          {(profile.hometown || profile.religion || profile.politics) && (
            <div className="glass p-5">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Basics</p>
              <div className="space-y-2">
                {profile.hometown && (
                  <div className="flex justify-between">
                    <span className="text-white/30 text-sm">Hometown</span>
                    <span className="text-white/70 text-sm">{profile.hometown}</span>
                  </div>
                )}
                {profile.religion && (
                  <div className="flex justify-between">
                    <span className="text-white/30 text-sm">Religion</span>
                    <span className="text-white/70 text-sm">{profile.religion}</span>
                  </div>
                )}
                {profile.politics && (
                  <div className="flex justify-between">
                    <span className="text-white/30 text-sm">Politics</span>
                    <span className="text-white/70 text-sm">{profile.politics}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom padding */}
          <div className="h-6" />
        </div>

        {showReport && <ReportModal targetUserId={id} onClose={() => setShowReport(false)} />}
      </div>
    </>
  );
}
