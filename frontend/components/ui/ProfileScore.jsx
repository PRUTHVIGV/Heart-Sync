import { motion } from "framer-motion";

const checks = [
  { key: "photos", label: "Add at least 1 photo", check: (u) => u.photos?.length > 0, points: 20 },
  { key: "bio", label: "Write a bio", check: (u) => u.bio?.length > 20, points: 15 },
  { key: "interests", label: "Add 3+ interests", check: (u) => u.interests?.length >= 3, points: 15 },
  { key: "occupation", label: "Add your job", check: (u) => !!u.occupation, points: 10 },
  { key: "location", label: "Add your location", check: (u) => !!u.location, points: 10 },
  { key: "relationshipGoal", label: "Set relationship goal", check: (u) => !!u.relationshipGoal, points: 10 },
  { key: "prompts", label: "Add an icebreaker", check: (u) => u.prompts?.length > 0, points: 10 },
  { key: "photos3", label: "Add 3+ photos", check: (u) => u.photos?.length >= 3, points: 5 },
  { key: "loveLanguage", label: "Set love language", check: (u) => !!u.loveLanguage, points: 5 },
];

export default function ProfileScore({ user }) {
  const score = checks.reduce((acc, c) => acc + (c.check(user) ? c.points : 0), 0);
  const completed = checks.filter((c) => c.check(user)).length;

  const color = score >= 80 ? "from-green-400 to-emerald-500"
    : score >= 50 ? "from-yellow-400 to-orange-400"
    : "from-primary to-accent";

  const label = score >= 80 ? "🔥 Excellent" : score >= 50 ? "⚡ Good" : "💡 Needs work";

  return (
    <div className="glass p-5 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-white font-bold text-sm">Profile Strength</p>
          <p className="text-white/30 text-xs mt-0.5">{label} · {completed}/{checks.length} complete</p>
        </div>
        <div className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {score}%
        </div>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>

      {score < 100 && (
        <div className="space-y-1.5">
          {checks.filter((c) => !c.check(user)).slice(0, 3).map((c) => (
            <div key={c.key} className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-white/10 flex-shrink-0" />
              <span className="text-white/40 text-xs">{c.label}</span>
              <span className="text-white/20 text-xs ml-auto">+{c.points}%</span>
            </div>
          ))}
        </div>
      )}

      {score === 100 && (
        <p className="text-green-400 text-xs font-semibold text-center">
          ✨ Perfect profile! You&apos;ll get 3x more matches.
        </p>
      )}
    </div>
  );
}
