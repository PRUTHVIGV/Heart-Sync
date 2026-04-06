import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { FaHeart, FaShieldAlt, FaComments, FaStar, FaBolt, FaArrowRight } from "react-icons/fa";
import Head from "next/head";

const features = [
  { icon: <FaHeart />, title: "Smart Matching", desc: "AI-powered compatibility based on interests, personality & behavior.", color: "from-rose-500/20 to-pink-500/20 border-rose-500/20" },
  { icon: <FaShieldAlt />, title: "100% Verified", desc: "Every profile verified with photo & phone. Zero fake accounts.", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/20" },
  { icon: <FaComments />, title: "Real-time Chat", desc: "Instant messaging with typing indicators and read receipts.", color: "from-purple-500/20 to-violet-500/20 border-purple-500/20" },
  { icon: <FaBolt />, title: "Instant Matches", desc: "Get matched in seconds. No waiting, no guessing.", color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/20" },
];

const testimonials = [
  { name: "Sarah K.", age: 26, text: "Found my soulmate in 2 weeks! HeartSync is unlike any other app.", avatar: "SK" },
  { name: "James M.", age: 29, text: "The matching algorithm is insane. Every match felt so compatible.", avatar: "JM" },
  { name: "Priya R.", age: 24, text: "Safe, verified profiles. I finally felt comfortable using a dating app.", avatar: "PR" },
];

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>HeartSync - Find Your Perfect Match</title>
        <meta name="description" content="The most authentic, futuristic dating app. Verified profiles, AI matching, real connections." />
      </Head>

      <div className="min-h-screen bg-dark">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-6 md:px-12 py-5 border-b border-white/5 sticky top-0 z-50 bg-dark/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <FaHeart className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-white">HeartSync</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <button onClick={() => router.push("/login")} className="btn-outline text-sm py-2 px-5">
              Login
            </button>
            <button onClick={() => router.push("/register")} className="btn-primary text-sm py-2 px-5">
              Get Started
            </button>
          </motion.div>
        </nav>

        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 overflow-hidden">
          {/* Decorative orbs */}
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/80 text-sm px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              🔥 10,000+ matches made today
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Find Your{" "}
              <span className="bg-gradient-to-r from-primary via-[#FF6B6B] to-accent bg-clip-text text-transparent glow-text">
                Perfect
              </span>
              <br />Match Today
            </h1>

            <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              HeartSync uses AI to connect real people with real intentions.
              Verified profiles, smart matching, and genuine connections — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/register")}
                className="btn-primary text-base px-10 py-4 flex items-center justify-center gap-2"
              >
                Start Matching Free <FaArrowRight />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/login")}
                className="btn-outline text-base px-10 py-4"
              >
                I have an account
              </motion.button>
            </div>
          </motion.div>

          {/* Floating cards preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative mt-20 w-full max-w-xs mx-auto"
          >
            <div className="relative h-80">
              {/* Back card */}
              <div className="absolute inset-0 rotate-6 scale-95 rounded-[2rem] overflow-hidden opacity-40">
                <div className="w-full h-full bg-gradient-to-br from-accent/30 to-primary/30 border border-white/10" />
              </div>
              {/* Front card */}
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden glass">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-accent/20 flex flex-col items-center justify-end p-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-3 flex items-center justify-center text-3xl">
                    💕
                  </div>
                  <h3 className="text-white font-bold text-xl">Alex, 24</h3>
                  <p className="text-white/50 text-sm">New York · Designer</p>
                  <div className="flex gap-2 mt-3">
                    {["Travel", "Music", "Art"].map((i) => (
                      <span key={i} className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">{i}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Like badge */}
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-6 left-4 bg-green-400 text-white font-black text-sm px-4 py-1 rounded-lg border-2 border-green-300 rotate-[-15deg]"
              >
                LIKE
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="px-6 py-12 max-w-4xl mx-auto">
          <div className="glass p-8">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[["500K+", "Active Users"], ["10K+", "Daily Matches"], ["98%", "Verified Profiles"]].map(([num, label]) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{num}</div>
                  <div className="text-white/40 text-sm mt-1">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Why <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">HeartSync</span>?
            </h2>
            <p className="text-white/40 text-lg">Everything you need to find real love.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-gradient-to-br ${f.color} border rounded-3xl p-6 backdrop-blur-sm cursor-default`}
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 py-20 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-black text-white mb-4">Real Stories 💕</h2>
            <p className="text-white/40">From people who found love on HeartSync</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">Age {t.age}</p>
                  </div>
                  <div className="ml-auto text-yellow-400 text-xs">★★★★★</div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center glass p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="text-5xl mb-4 float inline-block">💕</div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready for Love?</h2>
              <p className="text-white/50 mb-8 text-lg">Join 500,000+ people already finding their match.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/register")}
                className="btn-primary text-lg px-12 py-4 inline-flex items-center gap-2"
              >
                Start Free Today <FaArrowRight />
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <FaHeart className="text-white text-xs" />
              </div>
              <span className="text-white/60 text-sm font-semibold">HeartSync</span>
            </div>
            <p className="text-white/30 text-sm">© 2024 HeartSync. All rights reserved.</p>
            <div className="flex gap-6 text-white/30 text-sm">
              <span onClick={() => router.push("/privacy")} className="hover:text-white/60 cursor-pointer transition-colors">Privacy</span>
              <span onClick={() => router.push("/terms")} className="hover:text-white/60 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-white/60 cursor-pointer transition-colors">Support</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
