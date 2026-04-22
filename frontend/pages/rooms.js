import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import Navbar from "../components/ui/Navbar";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";

export default function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`)
      .then(({ data }) => setRooms(data.rooms))
      .catch(() => toast.error("Failed to load rooms"));
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${activeRoom.id}/messages`)
      .then(({ data }) => setMessages(data.messages))
      .catch(() => {});
    const interval = setInterval(() => {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${activeRoom.id}/messages`)
        .then(({ data }) => setMessages(data.messages));
    }, 3000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${activeRoom.id}/messages`, { content: text });
      setMessages((p) => [...p, data.message]);
      setText("");
    } catch { toast.error("Failed to send"); }
  };

  return (
    <>
      <Head><title>Interest Rooms - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
          <AnimatePresence mode="wait">
            {!activeRoom ? (
              <motion.div key="rooms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-black text-white mb-2">Interest Rooms</h1>
                <p className="text-white/40 text-sm mb-6">Meet people through shared passions — no swiping needed</p>
                <div className="grid grid-cols-2 gap-3">
                  {rooms.map((room) => (
                    <motion.button key={room.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveRoom(room)}
                      className="glass p-5 text-left rounded-3xl hover:border-primary/30 transition-all">
                      <div className="text-3xl mb-2">{room.name.split(" ").pop()}</div>
                      <p className="text-white font-bold text-sm">{room.name.split(" ").slice(0, -1).join(" ")}</p>
                      <p className="text-white/30 text-xs mt-1">{room.city}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col h-[calc(100vh-120px)]">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setActiveRoom(null)} className="w-9 h-9 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors">
                    <FaArrowLeft className="text-sm" />
                  </button>
                  <div>
                    <h2 className="text-white font-bold">{activeRoom.name}</h2>
                    <p className="text-white/30 text-xs">{activeRoom.city}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                  {messages.length === 0 && (
                    <div className="text-center text-white/20 text-sm mt-10">No messages yet — say hi! 👋</div>
                  )}
                  {messages.map((msg) => {
                    const isMe = msg.sender._id?.toString() === user?._id?.toString();
                    return (
                      <div key={msg._id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {msg.sender.name?.[0]}
                        </div>
                        <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                          {!isMe && <p className="text-white/30 text-xs mb-1 ml-1">{msg.sender.name}</p>}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-gradient-to-r from-primary to-accent text-white rounded-tr-sm" : "glass text-white/80 rounded-tl-sm"}`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={send} className="flex gap-2">
                  <input value={text} onChange={(e) => setText(e.target.value)}
                    placeholder={`Message ${activeRoom.name}...`}
                    className="input-field flex-1 text-sm" />
                  <button type="submit" className="w-11 h-11 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                    <FaPaperPlane className="text-sm" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
