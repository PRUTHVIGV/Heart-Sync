import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { FaArrowLeft, FaMapMarkerAlt, FaBriefcase, FaFlag } from "react-icons/fa";
import ReportModal from "../../components/ui/ReportModal";

export default function UserProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`);
      setProfile(data.user);
    } catch {
      router.push("/dashboard");
    } finally {
      setFetching(false);
    }
  };

  if (fetching || !profile) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const photos = profile.photos?.length > 0 ? profile.photos : [];

  return (
    <>
      <Head><title>{profile.name} - HeartSync</title></Head>
      <div className="min-h-screen bg-dark">
        {/* Photo Section */}
        <div className="relative h-[60vh] bg-card">
          {photos.length > 0 ? (
            <img
              src={photos[currentPhoto]}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card">
              <span className="text-8xl">👤</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
          >
            <FaArrowLeft />
          </button>

          {/* Report button */}
          <button
            onClick={() => setShowReport(true)}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
          >
            <FaFlag className="text-sm" />
          </button>

          {/* Photo dots */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-16">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhoto(i)}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i === currentPhoto ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 py-6 space-y-6 max-w-2xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {profile.name}, <span className="font-normal">{profile.age}</span>
            </h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {profile.location && (
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <FaMapMarkerAlt className="text-primary" /> {profile.location}
                </span>
              )}
              {profile.occupation && (
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <FaBriefcase className="text-primary" /> {profile.occupation}
                </span>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="card">
              <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-2">About</h2>
              <p className="text-white leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {profile.interests?.length > 0 && (
            <div className="card">
              <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {showReport && (
          <ReportModal
            targetUserId={id}
            onClose={() => setShowReport(false)}
          />
        )}
      </div>
    </>
  );
}
