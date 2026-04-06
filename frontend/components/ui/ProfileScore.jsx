import { motion } from "framer-motion";

const checks = [
  { key: "photos", label: "Add a photo", check: (u) => u.photos?.length > 0, points: 25 },
  { key: "bio", label: "Write a bio", check: (u) => u.bio?.length > 10, points: 20 },
  { key: "occupation", label: "Add occupation", check: (u) => !!u.occupation, points: 15 },
  { key: "location", label: "Add location", check: (u) => !!u.location, points: 15 },
  { key: "interests", label: "Add 3+ interests", check: (u) => u.interests?.length >= 3, points: 15 },
  { key: "prompts", label: "Add a prompt", check: (u) => u.prompts?.length > 0, points: 10 },
];

export default function ProfileScore({ user }) {
  const score = checks.reduce((acc, c) => acc + (c.check(user) ? c.points : 0), 0);
  const color = score >= 80 ? "from-green-400 to-emerald-500" :
                score >= 50 ? "from-yellow-400 to-orange-400" :
                "from-primary to-accent";

  return (
    <div className="glass p-5 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-white font-bold text-sm">Profile Strength</p>
          <p className="text-white/30 text-xs">Complete your profile to get more matches</p>
        </div>
        <div className={`text-2xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {score}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {checks.map((c) => {
          const done = c.check(user);
          return (
            <div key={c.key} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                done ? "bg-green-500" : "bg-white/10"
              }`}>
                {done && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`text-xs ${done ? "text-white/40 line-through" : "text-white/60"}`}>
                {c.label}
              </span>
              <span className="text-white/20 text-xs ml-auto">+{c.points}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
