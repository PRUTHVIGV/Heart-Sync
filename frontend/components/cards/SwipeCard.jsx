import { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { FaMapMarkerAlt, FaBriefcase, FaInfoCircle } from "react-icons/fa";
import { useRouter } from "next/router";

export default function SwipeCard({ profile, onSwipeLeft, onSwipeRight, preview = false }) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const router = useRouter();

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

  if (preview) {
    return (
      <div className="w-full h-full rounded-[2rem] overflow-hidden">
        <img
          src={photos[0]}
          alt={profile.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = avatarUrl; }}
        />
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
        <img
          src={photos[currentPhoto]}
          alt={profile.name}
          className="w-full h-full object-cover pointer-events-none"
          onError={(e) => { e.target.src = avatarUrl; }}
        />

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

        {/* Tap zones for photo navigation */}
        <div className="absolute inset-0 flex" style={{ top: "12px" }}>
          <div className="w-1/2 h-full cursor-pointer" onClick={() => setCurrentPhoto(Math.max(0, currentPhoto - 1))} />
          <div className="w-1/2 h-full cursor-pointer" onClick={() => setCurrentPhoto(Math.min(photos.length - 1, currentPhoto + 1))} />
        </div>

        {/* LIKE / NOPE stamps */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-10 left-5 border-[3px] border-green-400 text-green-400 text-xl font-black px-4 py-1.5 rounded-xl rotate-[-22deg] pointer-events-none"
        >
          LIKE 💚
        </motion.div>
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-10 right-5 border-[3px] border-red-500 text-red-500 text-xl font-black px-4 py-1.5 rounded-xl rotate-[22deg] pointer-events-none"
        >
          NOPE ✕
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

        {/* Info toggle button */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="absolute bottom-24 right-4 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
        >
          <FaInfoCircle />
        </button>

        {/* Profile Info */}
        <motion.div
          animate={{ y: showInfo ? 0 : 0 }}
          className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none"
        >
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-white text-2xl font-black tracking-tight">
                {profile.name}
                <span className="font-light text-white/70 ml-2">{profile.age}</span>
              </h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.location && (
                  <span className="flex items-center gap-1 text-white/60 text-xs">
                    <FaMapMarkerAlt className="text-primary text-xs" /> {profile.location}
                  </span>
                )}
                {profile.occupation && (
                  <span className="flex items-center gap-1 text-white/60 text-xs">
                    <FaBriefcase className="text-primary text-xs" /> {profile.occupation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio (shown on info toggle) */}
          <motion.div
            animate={{ height: showInfo ? "auto" : 0, opacity: showInfo ? 1 : 0 }}
            className="overflow-hidden"
          >
            {profile.bio && (
              <p className="text-white/70 text-sm mb-3 leading-relaxed pointer-events-auto">{profile.bio}</p>
            )}
          </motion.div>

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.slice(0, showInfo ? 8 : 3).map((interest) => (
                <span key={interest} className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/10">
                  {interest}
                </span>
              ))}
              {!showInfo && profile.interests.length > 3 && (
                <span className="bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full">
                  +{profile.interests.length - 3}
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
