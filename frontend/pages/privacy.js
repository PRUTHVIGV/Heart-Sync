import Head from "next/head";
import { useRouter } from "next/router";
import { FaHeart, FaArrowLeft } from "react-icons/fa";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-white font-bold text-lg mb-3">{title}</h2>
    <div className="text-white/50 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <>
      <Head><title>Privacy Policy - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        <nav className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
          <button onClick={() => router.back()} className="text-white/40 hover:text-white transition-colors">
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-2">
            <FaHeart className="text-primary" />
            <span className="text-white font-bold">HeartSync</span>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-white/30 text-sm mb-10">Last updated: January 1, 2024</p>

          <Section title="1. Information We Collect">
            <p>We collect information you provide directly to us, such as when you create an account, complete your profile, or contact us for support.</p>
            <p>This includes: name, email address, age, gender, photos, bio, location, and interests.</p>
            <p>We also collect usage data such as swipe activity, messages, and device information.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>To provide, maintain, and improve our services.</p>
            <p>To match you with compatible users based on your preferences.</p>
            <p>To send you notifications about matches and messages.</p>
            <p>To process payments and manage subscriptions.</p>
            <p>To detect and prevent fraud and abuse.</p>
          </Section>

          <Section title="3. Information Sharing">
            <p>We do not sell your personal information to third parties.</p>
            <p>Your profile information is visible to other HeartSync users as part of the matching experience.</p>
            <p>We may share data with service providers (AWS, Stripe, MongoDB) who help us operate the platform.</p>
          </Section>

          <Section title="4. Data Security">
            <p>We use industry-standard encryption (HTTPS/TLS) to protect your data in transit.</p>
            <p>Passwords are hashed using bcrypt and never stored in plain text.</p>
            <p>We regularly review our security practices to protect your information.</p>
          </Section>

          <Section title="5. Your Rights (GDPR)">
            <p>You have the right to access, correct, or delete your personal data at any time.</p>
            <p>You can delete your account from the Settings page, which removes all your data.</p>
            <p>You can request a copy of your data by contacting support@heartsync.app.</p>
          </Section>

          <Section title="6. Cookies">
            <p>We use cookies to keep you logged in and improve your experience.</p>
            <p>We do not use third-party advertising cookies.</p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>HeartSync is strictly for users 18 years of age and older.</p>
            <p>We do not knowingly collect information from anyone under 18.</p>
          </Section>

          <Section title="8. Contact Us">
            <p>If you have questions about this Privacy Policy, contact us at:</p>
            <p className="text-primary">support@heartsync.app</p>
          </Section>
        </div>
      </div>
    </>
  );
}
