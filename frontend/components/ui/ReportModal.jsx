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
  "Other",
];

export default function ReportModal({ targetUserId, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("report"); // "report" | "block"

  const handleSubmit = async () => {
    if (!reason) return toast.error("Please select a reason");
    setLoading(true);
    try {
      if (action === "report") {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/report`, {
          targetUserId,
          reason,
          details,
        });
        toast.success("Report submitted. Thank you!");
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/block`, { targetUserId });
        toast.success("User blocked.");
      }
      onClose();
    } catch {
      toast.error("Failed to submit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="card w-full max-w-md"
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-white font-bold text-lg">Report or Block</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <FaTimes />
            </button>
          </div>

          {/* Action tabs */}
          <div className="flex gap-2 mb-5">
            {["report", "block"].map((a) => (
              <button
                key={a}
                onClick={() => setAction(a)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  action === a ? "bg-primary text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {a} User
              </button>
            ))}
          </div>

          {action === "report" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Reason</label>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                        reason === r
                          ? "bg-primary/20 border border-primary text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Additional details (optional)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={2}
                  maxLength={300}
                  placeholder="Tell us more..."
                  className="input-field resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
              <p className="text-red-400 text-sm">
                Blocking this user will remove them from your matches and prevent future contact. This cannot be undone.
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full mt-5 py-3 rounded-xl font-semibold transition-colors ${
              action === "block"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "btn-primary"
            }`}
          >
            {loading ? "Submitting..." : action === "block" ? "Block User" : "Submit Report"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
