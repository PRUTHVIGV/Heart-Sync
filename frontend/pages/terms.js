import Head from "next/head";
import { useRouter } from "next/router";
import { FaHeart, FaArrowLeft } from "react-icons/fa";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-white font-bold text-lg mb-3">{title}</h2>
    <div className="text-white/50 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function Terms() {
  const router = useRouter();
  return (
    <>
      <Head><title>Terms of Service - HeartSync</title></Head>
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
          <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
          <p className="text-white/30 text-sm mb-10">Last updated: January 1, 2024</p>

          <Section title="1. Acceptance of Terms">
            <p>By creating an account on HeartSync, you agree to these Terms of Service and our Privacy Policy.</p>
            <p>You must be at least 18 years old to use HeartSync.</p>
          </Section>

          <Section title="2. User Conduct">
            <p>You agree not to post false, misleading, or fraudulent information.</p>
            <p>You agree not to harass, abuse, or harm other users.</p>
            <p>You agree not to use HeartSync for commercial solicitation or spam.</p>
            <p>You agree not to impersonate other people or create fake profiles.</p>
            <p>Violations may result in immediate account termination.</p>
          </Section>

          <Section title="3. Premium Subscriptions">
            <p>Premium subscriptions are billed in advance on a monthly, quarterly, or annual basis.</p>
            <p>You can cancel your subscription at any time through the Settings page or Stripe billing portal.</p>
            <p>Cancellations take effect at the end of the current billing period.</p>
            <p>We do not offer refunds for partial subscription periods.</p>
          </Section>

          <Section title="4. Content Ownership">
            <p>You retain ownership of all content you post on HeartSync.</p>
            <p>By posting content, you grant HeartSync a license to display it to other users.</p>
            <p>You must have the rights to any photos you upload.</p>
          </Section>

          <Section title="5. Account Termination">
            <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
            <p>You can delete your account at any time from the Settings page.</p>
          </Section>

          <Section title="6. Disclaimer">
            <p>HeartSync is provided "as is" without warranties of any kind.</p>
            <p>We are not responsible for the conduct of users on or off the platform.</p>
            <p>Always meet new people in public places and trust your instincts.</p>
          </Section>

          <Section title="7. Contact">
            <p>For questions about these terms, contact us at:</p>
            <p className="text-primary">support@heartsync.app</p>
          </Section>
        </div>
      </div>
    </>
  );
}
