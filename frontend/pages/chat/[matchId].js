import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import io from "socket.io-client";
import Head from "next/head";
import { FaArrowLeft, FaPaperPlane, FaHeart } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

let socket;

export default function Chat() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { matchId } = router.query;
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (!matchId || !user) return;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token: document.cookie.replace(/.*token=([^;]+).*/, "$1") },
    });

    socket.emit("join_room", matchId);

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("user_typing", ({ userId }) => {
      if (userId !== user._id) setTyping(true);
    });

    socket.on("user_stop_typing", ({ userId }) => {
      if (userId !== user._id) setTyping(false);
    });

    fetchChatData();

    return () => {
      socket.emit("leave_room", matchId);
      socket.disconnect();
    };
  }, [matchId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      matchId,
      content: newMessage.trim(),
      senderId: user._id,
      createdAt: new Date(),
    };

    socket.emit("send_message", message);
    setMessages((prev) => [...prev, { ...message, sender: user }]);
    setNewMessage("");
    socket.emit("stop_typing", { matchId, userId: user._id });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit("typing", { matchId, userId: user._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { matchId, userId: user._id });
    }, 1500);
  };

  const otherUser = match?.users?.find((u) => u._id !== user?._id);

  return (
    <>
      <Head><title>{otherUser?.name || "Chat"} - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex flex-col max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-4 border-b border-gray-800 bg-dark sticky top-0 z-10">
          <button onClick={() => router.push("/matches")} className="text-gray-400 hover:text-white">
            <FaArrowLeft className="text-xl" />
          </button>
          {otherUser && (
            <>
              <img
                src={otherUser.photos?.[0] || `https://ui-avatars.com/api/?name=${otherUser.name}&background=FF4458&color=fff&size=80`}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="text-white font-semibold">{otherUser.name}</h2>
                <p className="text-xs text-gray-400">{typing ? "typing..." : "Online"}</p>
              </div>
            </>
          )}
          <div className="ml-auto">
            <FaHeart className="text-primary text-xl" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">💕</div>
              <p className="text-gray-400">You matched! Say hello to {otherUser?.name}</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?._id || msg.sender?._id === user?._id;
            return (
              <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-card text-white border border-gray-700 rounded-bl-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? "text-red-200" : "text-gray-500"}`}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-card border border-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 py-4 border-t border-gray-800 bg-dark">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={`Message ${otherUser?.name || ""}...`}
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </>
  );
}
