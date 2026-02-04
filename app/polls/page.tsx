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
        <div className="fixed inset-0 z-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="absolute inset-0 z-10 bg-linear-to-b from-[#0a1e33] via-[#081525] to-[#050f1a]" />
        <NavbarDemo />

        <div className="relative z-20 pt-32 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-lg" />
              <div className="absolute inset-2 border-2 border-cyan-500/30 rounded-lg" />
              <div className="absolute inset-0 border-2 border-transparent border-t-cyan-500 rounded-lg animate-spin" />
              <div
                className="absolute inset-2 border-2 border-transparent border-t-purple-500 rounded-lg animate-spin"
                style={{ animationDirection: "reverse" }}
              />
            </div>

            <div className="space-y-3">
              <p className="text-cyan-300 font-mono text-sm tracking-widest">
                SYSTEM_INITIALIZING
              </p>
              <div className="w-48 h-px bg-linear-to-r from-transparent via-cyan-500 to-transparent mx-auto" />
              <p className="text-white/60 font-medium">
                Loading polling interface...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#175588] relative overflow-hidden">
        <div className="fixed inset-0 z-0 opacity-25">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(90deg, rgba(255,50,50,0.05) 1px, transparent 1px),
              linear-gradient(rgba(255,50,50,0.05) 1px, transparent 1px)
            `,
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="absolute inset-0 z-10 bg-linear-to-b from-[#1a0a1a] via-[#0f050f] to-[#0a050a]" />
        <NavbarDemo />

        <div className="relative z-20 pt-32 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 overflow-hidden group">
              <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-red-500/60" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-red-500/60" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-red-500/60" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-red-500/60" />

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-8 h-8 border-2 border-red-500 rounded" />
                    <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 rotate-45" />
                    <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 -rotate-45" />
                  </div>
                </div>

                <p className="text-red-400 font-mono mb-4">SYSTEM_ERROR</p>
                <p className="text-white/80 mb-6 text-lg">{error}</p>

                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg text-white font-medium transition-all duration-300 inline-flex items-center gap-2 group/btn"
                >
                  <span className="group-hover/btn:translate-x-1 transition-transform">
                    RETRY_CONNECTION
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="square"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
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
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#0a1e33] via-[#081525] to-[#050f1a]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div
        className="fixed inset-0 z-0 opacity-5"
        style={{
          background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(100, 200, 255, 0.1) 2px,
          rgba(100, 200, 255, 0.1) 4px
        )`,
        }}
      />

      <NavbarDemo />

      <div className="relative z-10 pt-32 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div className="space-y-4">
              <button
                onClick={() => router.push("/")}
                className="group inline-flex items-center gap-2 text-gray-400 hover:text-cyan-300 transition-all duration-300 font-mono text-sm"
              >
                <ArrowLeft
                  className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
                  strokeWidth={2}
                />
                <span>BACK_TO_TERMINAL</span>
              </button>

              <div>
                <h1 className="text-4xl md:text-5xl text-white font-bold tracking-tighter mb-3">
                  <span className="text-cyan-400">POLL</span>
                  <span className="text-gray-300">_INTERFACE</span>
                </h1>
                <p className="text-gray-400 font-mono text-sm tracking-wide">
                  LIVE_DATA_STREAM // ACTIVE_NODES: {polls.length}
                </p>
              </div>
            </div>

            <Link
              href="/create-new-poll"
              className="group relative px-6 py-3 bg-gray-900/80 border border-cyan-500/40 hover:border-cyan-500 rounded-lg text-cyan-300 font-mono text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2.5 overflow-hidden"
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
