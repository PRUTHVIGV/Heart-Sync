import { useRouter } from "next/router";
import Head from "next/head";
import { FaHeart } from "react-icons/fa";

export default function PaymentCancelled() {
  const router = useRouter();
  return (
    <>
      <Head><title>Payment Cancelled - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center py-10">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-white mb-3">Payment Cancelled</h1>
          <p className="text-gray-400 mb-8">No worries! You can upgrade anytime to unlock premium features.</p>
          <div className="flex gap-3">
            <button onClick={() => router.push("/premium")} className="btn-primary flex-1">
              Try Again
            </button>
            <button onClick={() => router.push("/dashboard")} className="btn-outline flex-1">
              Continue Free
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
