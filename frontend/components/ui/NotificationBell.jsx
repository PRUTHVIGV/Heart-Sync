import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaBell, FaHeart, FaComments, FaStar } from "react-icons/fa";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
  match: <FaHeart className="text-primary" />,
  message: <FaComments className="text-blue-400" />,
  superlike: <FaStar className="text-yellow-400" />,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const router = useRouter();
  const ref = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`);
      setNotifications(data.notifications);
      setUnread(data.notifications.filter((n) => !n.read).length);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const handleNotifClick = async (notif) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notif._id}/read`);
    } catch {}
    setOpen(false);
    if (notif.link) router.push(notif.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead(); }}
        className="relative w-9 h-9 flex items-center justify-center text-white/30 hover:text-white transition-colors rounded-xl hover:bg-white/5"
      >
        <FaBell className="text-lg" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-dark/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
              <h3 className="text-white font-bold text-sm">Notifications</h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-primary text-xs hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <FaBell className="text-white/10 text-3xl mx-auto mb-2" />
                  <p className="text-white/30 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif._id}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${
                      !notif.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="mt-0.5 text-base flex-shrink-0">{iconMap[notif.type] || <FaBell className="text-white/40" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notif.read ? "text-white font-medium" : "text-white/60"}`}>
                        {notif.message}
                      </p>
                      <p className="text-white/25 text-xs mt-0.5">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.read && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
