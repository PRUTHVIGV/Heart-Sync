import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const REASONS = [
  "Fake profile",
  "Inappropriate photos",
  "Harassment or abuse",
  "Spam or scam",
  "Underage user",
  "Hate speech",
  "Other",
];

export default function ReportModal({ targetUserId, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("report");

  const handleSubmit = async () => {
    if (action === "report" && !reason) return toast.error("Please select a reason");
    setLoading(true);
    try {
      if (action === "report") {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/report`, { targetUserId, reason, details });
        toast.success("Report submitted. We'll review it shortly.");
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/block`, { targetUserId });
        toast.success("User blocked successfully.");
      }
      onClose();
    } catch {
      toast.error("Failed to submit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="glass w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-white font-black text-lg">Report or Block</h2>
            <button onClick={onClose} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5 bg-white/5 p-1 rounded-2xl">
            {["report", "block"].map((a) => (
              <button key={a} onClick={() => setAction(a)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                  action === a
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "text-white/40 hover:text-white/60"
                }`}>
                {a} User
              </button>
            ))}
          </div>

          {action === "report" ? (
            <div className="space-y-4">
              <div>
                <label className="text-white/30 text-xs mb-2 block uppercase tracking-wider">Reason</label>
                <div className="space-y-1.5">
                  {REASONS.map((r) => (
                    <button key={r} onClick={() => setReason(r)}
                      className={`w-full text-left px-4 py-2.5 rounded-2xl text-sm transition-all ${
                        reason === r
                          ? "bg-primary/20 border border-primary/40 text-white"
                          : "bg-white/5 border border-white/5 text-white/50 hover:bg-white/8 hover:text-white/70"
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/30 text-xs mb-1.5 block uppercase tracking-wider">Details (optional)</label>
                <textarea value={details} onChange={(e) => setDetails(e.target.value)}
                  rows={2} maxLength={300} placeholder="Tell us more..."
                  className="input-field resize-none text-sm" />
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <p className="text-red-400 text-sm leading-relaxed">
                Blocking this user will remove them from your matches and prevent any future contact. <strong>This cannot be undone.</strong>
              </p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className={`w-full mt-5 py-3 rounded-2xl font-bold transition-all ${
              action === "block"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "btn-primary"
            } disabled:opacity-40`}>
            {loading ? "Submitting..." : action === "block" ? "Block User" : "Submit Report"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
