import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import io from "socket.io-client";
import Head from "next/head";
import { FaArrowLeft, FaPaperPlane, FaHeart, FaEllipsisV } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Cookies from "js-cookie";

export default function Chat() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { matchId } = router.query;
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (!matchId || !user) return;

    const token = Cookies.get("token");
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_room", matchId);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("receive_message", (message) => {
      setMessages((prev) => {
        // avoid duplicates
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("user_typing", ({ userId: tid }) => {
      if (tid !== user._id) setTyping(true);
    });

    socket.on("user_stop_typing", ({ userId: tid }) => {
      if (tid !== user._id) setTyping(false);
    });

    fetchChatData();

    return () => {
      socket.emit("leave_room", matchId);
      socket.disconnect();
    };
  }, [matchId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const fetchChatData = async () => {
    try {
      const [matchRes, messagesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/${matchId}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${matchId}`),
      ]);
      setMatch(matchRes.data.match);
      setMessages(messagesRes.data.messages);
    } catch {
      router.push("/matches");
    }
  };

  const sendMessage = useCallback((e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      matchId,
      content: newMessage.trim(),
      senderId: user._id,
      sender: user,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    socketRef.current.emit("send_message", { matchId, content: newMessage.trim() });
    setNewMessage("");
    socketRef.current.emit("stop_typing", { matchId, userId: user._id });
  }, [newMessage, matchId, user]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit("typing", { matchId, userId: user._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { matchId, userId: user._id });
    }, 1500);
  };

  const otherUser = match?.users?.find((u) => u._id !== user?._id);
  const avatarUrl = otherUser
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=FF4458&color=fff&size=80&bold=true`
    : null;

  return (
    <>
      <Head><title>{otherUser?.name || "Chat"} - HeartSync</title></Head>
      <div className="h-screen bg-dark flex flex-col max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-dark/90 backdrop-blur-xl flex-shrink-0">
          <button onClick={() => router.push("/matches")}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <FaArrowLeft />
          </button>

          {otherUser && (
            <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => router.push(`/user/${otherUser._id}`)}>
              <div className="relative">
                <img
                  src={otherUser.photos?.[0] || avatarUrl}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => { e.target.src = avatarUrl; }}
                />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-dark ${connected ? "bg-green-400" : "bg-gray-500"}`} />
              </div>
              <div>
                <h2 className="text-white font-bold text-sm">{otherUser.name}</h2>
                <p className="text-xs text-white/30">
                  {typing ? (
                    <span className="text-primary">typing...</span>
                  ) : connected ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          )}

          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <FaEllipsisV />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl mb-3"
              >
                💕
              </motion.div>
              <p className="text-white/40 text-sm">
                You matched with <span className="text-white font-semibold">{otherUser?.name}</span>!
              </p>
              <p className="text-white/20 text-xs mt-1">Say hello 👋</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?._id || msg.sender?._id === user?._id;
            const showTime = i === messages.length - 1 ||
              new Date(messages[i + 1]?.createdAt) - new Date(msg.createdAt) > 5 * 60 * 1000;

            return (
              <motion.div
                key={msg._id || i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-br from-primary to-accent text-white rounded-br-sm"
                      : "bg-white/8 text-white border border-white/5 rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                  {showTime && (
                    <p className="text-white/20 text-xs px-1">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start"
              >
                <div className="bg-white/8 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                        className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 py-3 border-t border-white/5 bg-dark/90 backdrop-blur-xl flex-shrink-0">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={`Message ${otherUser?.name || ""}...`}
            className="input-field flex-1 py-2.5 text-sm"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!newMessage.trim()}
            className="w-11 h-11 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <FaPaperPlane className="text-sm" />
          </motion.button>
        </form>
      </div>
    </>
  );
}
