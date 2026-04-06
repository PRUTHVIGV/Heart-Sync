import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaCheck } from "react-icons/fa";
import { ICEBREAKER_PROMPTS } from "../../utils/profileData";

export default function IcebreakerPrompts({ prompts = [], onChange }) {
  const [adding, setAdding] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [answer, setAnswer] = useState("");

  const addPrompt = () => {
    if (!selectedPrompt || !answer.trim()) return;
    if (prompts.length >= 3) return;
    onChange([...prompts, { question: selectedPrompt, answer: answer.trim() }]);
    setSelectedPrompt("");
    setAnswer("");
    setAdding(false);
  };

  const availablePrompts = ICEBREAKER_PROMPTS.filter(
    (p) => !prompts.some((ep) => ep.question === p)
  );

  return (
    <div>
      <div className="space-y-2 mb-3">
        {prompts.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 relative group">
            <p className="text-primary text-xs font-medium mb-1">{p.question}</p>
            <p className="text-white text-sm leading-relaxed">{p.answer}</p>
            <button onClick={() => onChange(prompts.filter((_, j) => j !== i))}
              className="absolute top-3 right-3 w-6 h-6 bg-white/5 rounded-full flex items-center justify-center text-white/30 opacity-0 group-hover:opacity-100 hover:bg-red-500/30 hover:text-red-400 transition-all">
              <FaTimes className="text-xs" />
            </button>
          </motion.div>
        ))}
      </div>

      {prompts.length < 3 && !adding && (
        <button onClick={() => setAdding(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/30 hover:border-primary/30 hover:text-primary transition-all text-sm flex items-center justify-center gap-2">
          <FaPlus className="text-xs" /> Add a prompt
        </button>
      )}

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">Choose a prompt</p>
            <div className="space-y-1 mb-4 max-h-48 overflow-y-auto">
              {availablePrompts.map((prompt) => (
                <button key={prompt} onClick={() => setSelectedPrompt(prompt)}
                  className={`w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all ${
                    selectedPrompt === prompt
                      ? "bg-primary/20 text-white border border-primary/30"
                      : "text-white/50 hover:bg-white/5 hover:text-white/70"
                  }`}>
                  {prompt}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {selectedPrompt && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <p className="text-primary text-xs font-medium mb-1.5">{selectedPrompt}</p>
                  <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Your answer..." rows={2} maxLength={150}
                    className="input-field resize-none text-sm mb-3" />
                  <p className="text-white/20 text-xs text-right mb-3">{answer.length}/150</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <button onClick={() => { setAdding(false); setSelectedPrompt(""); setAnswer(""); }}
                className="btn-outline flex-1 py-2 text-sm">Cancel</button>
              <button onClick={addPrompt} disabled={!answer.trim() || !selectedPrompt}
                className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1 disabled:opacity-40">
                <FaCheck className="text-xs" /> Add Prompt
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
