import { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { FaHeart, FaTimes, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";
import Image from "next/image";

export default function SwipeCard({ profile, onSwipeLeft, onSwipeRight, preview = false }) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const x = useMotionValue(0);
  const controls = useAnimation();

  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);

  const handleDragEnd = async (_, info) => {
    if (info.offset.x > 120) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      onSwipeRight?.();
    } else if (info.offset.x < -120) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      onSwipeLeft?.();
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300 } });
    }
  };

  const photos = profile.photos?.length > 0 ? profile.photos : ["/default-avatar.png"];

  if (preview) {
    return (
      <div className="w-full h-full rounded-3xl overflow-hidden bg-card">
        <div className="relative w-full h-full">
          <img src={photos[0]} alt={profile.name} className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="swipe-card bg-card select-none"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={{ cursor: "grabbing" }}
    >
      {/* Photo */}
      <div className="relative w-full h-full">
        <img
          src={photos[currentPhoto]}
          alt={profile.name}
          className="w-full h-full object-cover pointer-events-none"
          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${profile.name}&background=FF4458&color=fff&size=400`; }}
        />

        {/* Photo dots */}
        {photos.length > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 px-4">
            {photos.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentPhoto(i)}
                className={`h-1 flex-1 rounded-full cursor-pointer ${i === currentPhoto ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}

        {/* Photo navigation */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full" onClick={() => setCurrentPhoto(Math.max(0, currentPhoto - 1))} />
          <div className="w-1/2 h-full" onClick={() => setCurrentPhoto(Math.min(photos.length - 1, currentPhoto + 1))} />
        </div>

        {/* Like / Nope overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-8 left-6 border-4 border-green-400 text-green-400 text-2xl font-black px-4 py-1 rounded-lg rotate-[-20deg]"
        >
          LIKE
        </motion.div>
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-8 right-6 border-4 border-red-500 text-red-500 text-2xl font-black px-4 py-1 rounded-lg rotate-[20deg]"
        >
          NOPE
        </motion.div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-white text-2xl font-bold">
                {profile.name}, <span className="font-normal">{profile.age}</span>
              </h2>
              {profile.location && (
                <p className="text-gray-300 text-sm flex items-center gap-1 mt-1">
                  <FaMapMarkerAlt className="text-primary" /> {profile.location}
                </p>
              )}
              {profile.occupation && (
                <p className="text-gray-300 text-sm flex items-center gap-1 mt-1">
                  <FaBriefcase className="text-primary" /> {profile.occupation}
                </p>
              )}
              {profile.bio && (
                <p className="text-gray-300 text-sm mt-2 line-clamp-2">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.interests.slice(0, 4).map((interest) => (
                <span key={interest} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
