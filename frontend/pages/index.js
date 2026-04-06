import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { FaHeart, FaShieldAlt, FaComments, FaStar } from "react-icons/fa";
import Head from "next/head";

const features = [
  { icon: <FaHeart />, title: "Smart Matching", desc: "AI-powered compatibility matching based on your interests and personality." },
  { icon: <FaShieldAlt />, title: "Verified Profiles", desc: "Every profile is verified with phone & photo verification for authenticity." },
  { icon: <FaComments />, title: "Real-time Chat", desc: "Instant messaging with your matches. Send texts, emojis, and voice notes." },
  { icon: <FaStar />, title: "Super Likes", desc: "Stand out from the crowd and let someone know you really like them." },
];

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>HeartSync - Find Your Match</title>
        <meta name="description" content="The most authentic dating app to find your perfect match." />
      </Head>

      <div className="min-h-screen bg-dark">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <FaHeart className="text-primary text-2xl" />
            <span className="text-2xl font-bold text-white">HeartSync</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => router.push("/login")} className="btn-outline text-sm py-2 px-5">
              Login
            </button>
            <button onClick={() => router.push("/register")} className="btn-primary text-sm py-2 px-5">
              Sign Up Free
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-primary/20 text-primary text-sm font-medium px-4 py-1 rounded-full mb-6 inline-block">
              🔥 Over 10,000 matches made daily
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
              Find Your <span className="text-primary">Perfect</span> Match
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              HeartSync connects real people with real intentions. Verified profiles, smart matching, and genuine connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => router.push("/register")} className="btn-primary text-lg px-10 py-4">
                Get Started Free
              </button>
              <button onClick={() => router.push("/login")} className="btn-outline text-lg px-10 py-4">
                I have an account
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex gap-12 mt-20"
          >
            {[["500K+", "Active Users"], ["10K+", "Daily Matches"], ["98%", "Verified Profiles"]].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-primary">{num}</div>
                <div className="text-gray-400 text-sm mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Features */}
        <section className="px-8 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-14">
            Why Choose <span className="text-primary">HeartSync</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card text-center hover:border-primary/50 transition-colors"
              >
                <div className="text-primary text-3xl mb-4 flex justify-center">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-20 px-6">
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-3xl max-w-3xl mx-auto p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Find Love?</h2>
            <p className="text-gray-400 mb-8">Join thousands of people who found their match on HeartSync.</p>
            <button onClick={() => router.push("/register")} className="btn-primary text-lg px-12 py-4">
              Start Matching Now 💕
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-gray-600 border-t border-gray-800">
          <p>© 2024 HeartSync. All rights reserved. | Privacy Policy | Terms of Service</p>
        </footer>
      </div>
    </>
  );
}
