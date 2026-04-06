import { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { FaMapMarkerAlt, FaBriefcase, FaInfoCircle } from "react-icons/fa";

export default function SwipeCard({ profile, onSwipeLeft, onSwipeRight, preview = false }) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const x = useMotionValue(0);
  const controls = useAnimation();

  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const likeOpacity = useTransform(x, [30, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-130, -30], [1, 0]);
  const cardScale = useTransform(x, [-250, 0, 250], [0.95, 1, 0.95]);

  const handleDragEnd = async (_, info) => {
    if (info.offset.x > 100) {
      await controls.start({ x: 600, opacity: 0, rotate: 20, transition: { duration: 0.35 } });
      onSwipeRight?.();
    } else if (info.offset.x < -100) {
      await controls.start({ x: -600, opacity: 0, rotate: -20, transition: { duration: 0.35 } });
      onSwipeLeft?.();
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 400, damping: 25 } });
    }
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=FF4458&color=fff&size=400&bold=true`;
  const photos = profile.photos?.length > 0 ? profile.photos : [avatarUrl];

  const goalLabel = {
    "long-term": "💍 Long-term",
    "marriage": "👰 Marriage-minded",
    "casual": "😊 Casual",
    "friendship": "🤝 Friends first",
    "unsure": "🤷 Open to anything",
  }[profile.relationshipGoal];

  if (preview) {
    return (
      <div className="w-full h-full rounded-[2rem] overflow-hidden">
        <img src={photos[0]} alt={profile.name} className="w-full h-full object-cover"
          onError={(e) => { e.target.src = avatarUrl; }} />
      </div>
    );
  }

  return (
    <motion.div
      className="swipe-card select-none"
      style={{ x, rotate, scale: cardScale }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={{ cursor: "grabbing" }}
    >
      <div className="relative w-full h-full bg-card">
        {/* Photo */}
        <img src={photos[currentPhoto]} alt={profile.name}
          className="w-full h-full object-cover pointer-events-none"
          onError={(e) => { e.target.src = avatarUrl; }} />

        {/* Photo progress bars */}
        {photos.length > 1 && (
          <div className="absolute top-3 left-3 right-3 flex gap-1">
            {photos.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/30">
                <div className={`h-full rounded-full transition-all duration-300 ${i <= currentPhoto ? "bg-white" : "bg-transparent"}`} />
              </div>
            ))}
          </div>
        )}

        {/* Tap zones */}
        <div className="absolute inset-0 flex" style={{ top: "12px" }}>
          <div className="w-1/2 h-full cursor-pointer" onClick={() => setCurrentPhoto(Math.max(0, currentPhoto - 1))} />
          <div className="w-1/2 h-full cursor-pointer" onClick={() => setCurrentPhoto(Math.min(photos.length - 1, currentPhoto + 1))} />
        </div>

        {/* LIKE / NOPE stamps */}
        <motion.div style={{ opacity: likeOpacity }}
          className="absolute top-10 left-5 border-[3px] border-green-400 text-green-400 text-xl font-black px-4 py-1.5 rounded-xl rotate-[-22deg] pointer-events-none">
          LIKE 💚
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }}
          className="absolute top-10 right-5 border-[3px] border-red-500 text-red-500 text-xl font-black px-4 py-1.5 rounded-xl rotate-[22deg] pointer-events-none">
          NOPE ✕
        </motion.div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

        {/* Info toggle */}
        <button onClick={() => setShowInfo(!showInfo)}
          className="absolute bottom-24 right-4 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
          <FaInfoCircle />
        </button>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
          {/* Name + Age + Height */}
          <h2 className="text-white text-2xl font-black tracking-tight mb-1">
            {profile.name}
            <span className="font-light text-white/70 ml-2">{profile.age}</span>
            {profile.height && <span className="font-light text-white/40 text-base ml-2">{profile.height}</span>}
          </h2>

          {/* Location + Job */}
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.location && (
              <span className="flex items-center gap-1 text-white/60 text-xs">
                <FaMapMarkerAlt className="text-primary text-xs" /> {profile.location}
              </span>
            )}
            {profile.occupation && (
              <span className="flex items-center gap-1 text-white/60 text-xs">
                <FaBriefcase className="text-primary text-xs" />
                {profile.occupation}{profile.company ? ` @ ${profile.company}` : ""}
              </span>
            )}
          </div>

          {/* Relationship goal */}
          {goalLabel && !showInfo && (
            <div className="mb-2">
              <span className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/10">
                {goalLabel}
              </span>
            </div>
          )}

          {/* Expanded info */}
          <motion.div
            animate={{ height: showInfo ? "auto" : 0, opacity: showInfo ? 1 : 0 }}
            className="overflow-hidden"
          >
            {profile.bio && (
              <p className="text-white/70 text-sm mb-3 leading-relaxed pointer-events-auto line-clamp-3">{profile.bio}</p>
            )}

            {/* First icebreaker prompt */}
            {profile.prompts?.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mb-3 pointer-events-auto">
                <p className="text-white/50 text-xs mb-1">{profile.prompts[0].question}</p>
                <p className="text-white text-sm font-medium">{profile.prompts[0].answer}</p>
              </div>
            )}

            {/* Lifestyle badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.loveLanguage && (
                <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">
                  ❤️ {profile.loveLanguage === "words" ? "Words" : profile.loveLanguage === "acts" ? "Acts of Service" :
                      profile.loveLanguage === "gifts" ? "Gifts" : profile.loveLanguage === "time" ? "Quality Time" : "Touch"}
                </span>
              )}
              {profile.zodiac && <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">{profile.zodiac}</span>}
              {profile.education && <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">🎓 {profile.education}</span>}
              {profile.drinking && profile.drinking !== "Never" && profile.drinking !== "Prefer not to say" && (
                <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">🍷 {profile.drinking}</span>
              )}
            </div>
          </motion.div>

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.slice(0, showInfo ? 10 : 3).map((interest) => (
                <span key={interest} className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/10">
                  {interest}
                </span>
              ))}
              {!showInfo && profile.interests.length > 3 && (
                <span className="bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full">
                  +{profile.interests.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
