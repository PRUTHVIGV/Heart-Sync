import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaCopy, FaCheck } from "react-icons/fa";

const DIMENSIONS = [
  { key: "interests", label: "Interests", emoji: "🎯" },
  { key: "personality", label: "Personality", emoji: "🧠" },
  { key: "loveLanguage", label: "Love Language", emoji: "💕" },
  { key: "lifestyle", label: "Lifestyle", emoji: "🌿" },
  { key: "goals", label: "Goals", emoji: "🎯" },
];

function ScoreRing({ score }) {
  const [display, setDisplay] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (display / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const step = score / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= score) { setDisplay(score); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#FF4458";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle cx="64" cy="64" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white">{display}</span>
        <span className="text-white/40 text-xs">/ 100</span>
      </div>
    </div>
  );
}

export default function CompatibilityScore({ you, match, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!you?._id || !match?._id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/compatibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ targetUserId: match._id }),
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [you, match]);

  const copyIcebreaker = () => {
    navigator.clipboard.writeText(data.icebreaker);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      onClick={onClose}>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-md rounded-[2rem] overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 p-6 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60 text-xl">✕</button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              {match?.photos?.[0] ? <img src={match.photos[0]} className="w-full h-full object-cover" /> : match?.name?.[0]}
            </div>
            <FaHeart className="text-primary text-xl" />
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold">
              {you?.photos?.[0] ? <img src={you.photos[0]} className="w-full h-full object-cover" /> : you?.name?.[0]}
            </div>
          </div>
          <p className="text-white/60 text-sm mb-4">You & {match?.name}</p>

          {loading ? (
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            <ScoreRing score={data?.score || 0} />
          )}

          {!loading && data && (
            <p className="text-white/70 text-sm mt-3 leading-relaxed">{data.summary}</p>
          )}
        </div>

        {!loading && data && (
          <div className="p-5 space-y-5">
            {/* Dimension bars */}
            <div className="space-y-3">
              {DIMENSIONS.map((dim, i) => (
                <motion.div key={dim.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/60 text-xs">{dim.emoji} {dim.label}</span>
                    <span className="text-white/40 text-xs">{data.dimensions?.[dim.key] || 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${data.dimensions?.[dim.key] || 0}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Green flags */}
            {data.greenFlags?.length > 0 && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Green Flags</p>
                <div className="space-y-1.5">
                  {data.greenFlags.map((flag, i) => (
                    <div key={i} className="flex items-center gap-2 text-green-400 text-sm">
                      <span>✅</span><span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Growth areas */}
            {data.growthAreas?.length > 0 && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Growth Areas</p>
                <div className="space-y-1.5">
                  {data.growthAreas.map((area, i) => (
                    <div key={i} className="flex items-center gap-2 text-yellow-400 text-sm">
                      <span>💡</span><span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Icebreaker */}
            {data.icebreaker && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">💬 Suggested Icebreaker</p>
                <p className="text-white/80 text-sm leading-relaxed mb-3">{data.icebreaker}</p>
                <button onClick={copyIcebreaker}
                  className="flex items-center gap-2 text-primary text-xs font-semibold hover:text-accent transition-colors">
                  {copied ? <FaCheck /> : <FaCopy />} {copied ? "Copied!" : "Copy message"}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
