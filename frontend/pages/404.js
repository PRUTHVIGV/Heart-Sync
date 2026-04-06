import { useRouter } from "next/router";
import { FaHeart } from "react-icons/fa";
import Head from "next/head";

export default function NotFound() {
  const router = useRouter();
  return (
    <>
      <Head><title>404 - HeartSync</title></Head>
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-center px-4">
        <FaHeart className="text-primary text-6xl mb-6 animate-pulse" />
        <h1 className="text-6xl font-extrabold text-white mb-2">404</h1>
        <p className="text-gray-400 text-lg mb-8">Oops! This page got lost looking for a match.</p>
        <button onClick={() => router.push("/")} className="btn-primary px-10">
          Go Home
        </button>
      </div>
    </>
  );
}
