import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaCheck } from "react-icons/fa";

const PROMPTS = [
  "My ideal weekend looks like...",
  "The way to my heart is...",
  "I'm looking for someone who...",
  "My most controversial opinion is...",
  "Two truths and a lie...",
  "I get way too excited about...",
  "My love language is...",
  "The best trip I've ever taken...",
  "I'm weirdly good at...",
  "My simple pleasures are...",
];

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

  const removePrompt = (index) => {
    onChange(prompts.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-white font-bold text-sm">Icebreaker Prompts</p>
          <p className="text-white/30 text-xs">Help matches start a conversation</p>
        </div>
        {prompts.length < 3 && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-primary text-xs font-semibold hover:text-accent transition-colors">
            <FaPlus className="text-xs" /> Add
          </button>
        )}
      </div>

      {/* Existing prompts */}
      <div className="space-y-2 mb-3">
        {prompts.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 relative">
            <p className="text-white/40 text-xs mb-1">{p.question}</p>
            <p className="text-white text-sm font-medium">{p.answer}</p>
            <button onClick={() => removePrompt(i)}
              className="absolute top-3 right-3 w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-white/40 hover:bg-red-500/30 hover:text-red-400 transition-all">
              <FaTimes className="text-xs" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add prompt modal */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Choose a prompt</p>
            <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
              {PROMPTS.filter((p) => !prompts.some((ep) => ep.question === p)).map((prompt) => (
                <button key={prompt} onClick={() => setSelectedPrompt(prompt)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${
                    selectedPrompt === prompt
                      ? "bg-primary/20 text-white border border-primary/30"
                      : "text-white/50 hover:bg-white/5"
                  }`}>
                  {prompt}
                </button>
              ))}
            </div>
            {selectedPrompt && (
              <div className="mt-3">
                <p className="text-white/40 text-xs mb-1">{selectedPrompt}</p>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your answer..." rows={2} maxLength={150}
                  className="input-field resize-none text-sm mb-2" />
                <div className="flex gap-2">
                  <button onClick={() => { setAdding(false); setSelectedPrompt(""); setAnswer(""); }}
                    className="btn-outline flex-1 py-2 text-sm">Cancel</button>
                  <button onClick={addPrompt} disabled={!answer.trim()}
                    className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1">
                    <FaCheck /> Add
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
