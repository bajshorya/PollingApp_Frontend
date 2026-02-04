"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LivePollGrid from "@/components/LivePollGrid";
import { NavbarDemo } from "@/components/Navbar";
import { ArrowLeft, Plus } from "lucide-react";
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
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
        <NavbarDemo />
        <div className="pt-32 pb-12 px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" />
              <div
                className="absolute inset-2 border-4 border-transparent border-t-violet-400 rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              />
            </div>
            <p className="text-white/70 text-lg font-medium">
              Loading the good stuff...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#175588] relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-500/5 via-transparent to-red-500/5" />
        <NavbarDemo />
        <div className="pt-32 pb-12 px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-linear-to-br from-rose-500/12 to-red-500/8 border border-rose-400/30 rounded-2xl p-12 text-center overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-tr from-rose-400/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-rose-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-rose-300 mb-6 text-lg font-medium">
                  Oops! Something went wrong
                </p>
                <p className="text-rose-300/70 mb-8 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-white/8 hover:bg-white/12 border border-white/20 hover:border-white/30 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/3 via-transparent to-violet-500/3" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
      <NavbarDemo />

      <div className="pt-32 pb-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div className="space-y-3">
              <button
                onClick={() => router.push("/")}
                className="group inline-flex items-center gap-2 text-white/50 hover:text-white/90 transition-all duration-300 mb-2"
              >
                <ArrowLeft
                  className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
                  strokeWidth={2}
                />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-5xl text-white font-bold tracking-tight mb-2">
                  Live Polls
                </h1>
                <p className="text-white/60 text-lg font-light">
                  Real-time voting, powered by the community
                </p>
              </div>
            </div>
            <Link
              href="/create-new-poll"
              className="group relative px-6 py-3.5 bg-linear-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/22 hover:to-blue-500/22 border border-cyan-400/40 hover:border-cyan-400/60 rounded-full text-cyan-300 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 flex items-center gap-2.5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Plus
                className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300"
                strokeWidth={2.5}
              />
              <span className="relative z-10">Create Poll</span>
            </Link>
          </div>

          <LivePollGrid initialPolls={polls} />
        </div>
      </div>
    </div>
  );
}
