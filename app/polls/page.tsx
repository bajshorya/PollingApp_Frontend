"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LivePollGrid from "@/components/LivePollGrid";
import { NavbarDemo } from "@/components/Navbar";
import { ArrowLeft, Plus, LogIn } from "lucide-react";
import Link from "next/link";
import { getAuthToken, isAuthenticated } from "@/app/lib/jwt";

interface Poll {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  created_at: string;
  closed: boolean;
  user_voted: boolean;
  current_user_id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any[];
  total_votes?: number;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);

        if (!isAuthenticated()) {
          router.push("/auth/signin");
          return;
        }

        const token = getAuthToken();
        if (!token) {
          router.push("/auth/signin");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/polls`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          router.push("/auth/signin");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch polls");
        }

        const data = await response.json();
        setPolls(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#175588] relative overflow-hidden">
        <NavbarDemo />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-cyan-300 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/60">Loading polls...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#175588] relative overflow-hidden">
        <NavbarDemo />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden">
      <NavbarDemo />

      <div className="pt-32 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 text-white/60 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
              <h1 className="text-4xl text-white inria-serif-bold">
                Live Polls
              </h1>
            </div>
            <Link
              href="/create-new-poll"
              className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-xl text-cyan-300 font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Poll
            </Link>
          </div>

          <LivePollGrid initialPolls={polls} />
        </div>
      </div>
    </div>
  );
}
