"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavbarDemo } from "@/components/Navbar";
import PollVoteClient from "@/components/PollVoteClient";
import {
  ArrowLeft,
  Users,
  Clock,
  Lock,
  Circle,
  XCircle,
  CheckCircle,
  Crown,
} from "lucide-react";
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
}

export default function PollPage() {
  const params = useParams();
  const router = useRouter();

  const getPollId = () => {
    const id = params.pollId || params.poll_id;

    if (!id) {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const segments = path.split("/");
        const lastSegment = segments[segments.length - 1];
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(lastSegment)) {
          return lastSegment;
        }
      }
    }

    return id as string;
  };

  const pollId = getPollId();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [closeSuccess, setCloseSuccess] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const getCurrentUserId = (): string | null => {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const isCreator = currentUserId && poll?.creator_id === currentUserId;

  const fetchPoll = async () => {
    if (!pollId || pollId === "undefined" || pollId === "[pollId]") {
      console.error("❌ Invalid pollId:", pollId);
      setError("Invalid poll ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (!isAuthenticated()) {
        console.log("🔐 Not authenticated, redirecting to signin");
        router.push("/auth/signin");
        return;
      }

      const token = getAuthToken();
      if (!token) {
        console.log("🔐 No token found, redirecting to signin");
        router.push("/auth/signin");
        return;
      }

      console.log("📡 Fetching poll with ID:", pollId);
      console.log(
        "📡 API URL:",
        `${process.env.NEXT_PUBLIC_API_URL}/polls/${pollId}`,
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/polls/${pollId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("📡 Response status:", response.status);

      if (response.status === 401) {
        console.log("🔐 Unauthorized, removing token");
        localStorage.removeItem("auth_token");
        router.push("/auth/signin");
        return;
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Poll not found");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch poll (${response.status})`,
        );
      }

      const data = await response.json();
      console.log("✅ Poll data received:", data);
      setPoll(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("❌ Error fetching poll:", err);
      setError(err.message || "Failed to fetch poll");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pollId) {
      fetchPoll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId, router]);

  const handleClosePoll = async () => {
    if (!pollId || !isCreator || poll?.closed) return;

    if (
      !window.confirm(
        "Are you sure you want to close this poll? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setClosing(true);
      setCloseError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      console.log("🔒 Closing poll:", pollId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/polls/${pollId}/close`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("🔒 Close poll response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to close poll");
      }

      const data = await response.json();
      console.log("✅ Poll closed successfully:", data);

      setCloseSuccess(true);

      if (poll) {
        setPoll({ ...poll, closed: true });
      }

      setTimeout(() => {
        setCloseSuccess(false);
      }, 3000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("❌ Error closing poll:", err);
      setCloseError(err.message || "Failed to close poll");
    } finally {
      setClosing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#175588] relative overflow-hidden">
        <div className="fixed inset-0 z-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(90deg, rgba(100, 200, 255, 0.03) 1px, transparent 1px),
              linear-gradient(rgba(100, 200, 255, 0.03) 1px, transparent 1px)
            `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="absolute inset-0 z-10 bg-linear-to-b from-[#0a1a2a] via-[#081220] to-[#050a15]" />
        <NavbarDemo />

        <div className="relative z-20 pt-32 pb-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8 font-mono text-sm text-cyan-400 tracking-wider">
              <div className="animate-pulse">LOADING_POLL_DATA...</div>
              <div className="text-gray-500 mt-2">ID: {pollId}</div>
            </div>

            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-2 border-gray-700 rounded-lg" />
              <div className="absolute inset-2 border-2 border-cyan-500/30 rounded-lg" />
              <div className="absolute inset-0 border-2 border-transparent border-t-cyan-500 rounded-lg animate-spin" />
              <div
                className="absolute inset-2 border-2 border-transparent border-t-purple-500 rounded-lg animate-spin"
                style={{ animationDirection: "reverse" }}
              />
            </div>

            <p className="text-gray-400 font-mono text-sm">
              QUERYING_DATABASE...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-[#175588] relative overflow-hidden">
        <div className="fixed inset-0 z-0 opacity-25">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(90deg, rgba(255, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(rgba(255, 0, 0, 0.03) 1px, transparent 1px)
            `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="absolute inset-0 z-10 bg-linear-to-b from-[#1a0a0a] via-[#0f0505] to-[#0a0202]" />
        <NavbarDemo />

        <div className="relative z-20 pt-32 pb-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-gray-900/90 backdrop-blur-sm border border-red-500/40 rounded-lg p-8 overflow-hidden">
              <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-red-500" />
              <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-red-500" />
              <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-red-500" />
              <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-red-500" />

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-red-500/10 border border-red-500/40 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-10 h-10 border-2 border-red-500 rotate-45" />
                    <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 rotate-45" />
                    <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 -rotate-45" />
                  </div>
                </div>

                <p className="text-red-400 font-mono mb-3">ERROR_404</p>
                <p className="text-gray-300 mb-2 text-lg">
                  {error || "Poll not found"}
                </p>
                <p className="text-gray-500 text-sm mb-8 font-mono">
                  POLL_ID: {pollId || "UNKNOWN"}
                </p>

                <Link
                  href="/polls"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white font-medium transition-all duration-300"
                >
                  <ArrowLeft
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                    strokeWidth={2}
                  />
                  <span>RETURN_TO_GRID</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalVotes =
    poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#0a1e33] via-[#081525] to-[#050f1a]" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
            linear-gradient(90deg, rgba(100, 200, 255, 0.05) 1px, transparent 1px),
            linear-gradient(rgba(100, 200, 255, 0.05) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div
        className="fixed inset-0 z-0 opacity-10"
        style={{
          background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 1px,
          rgba(100, 200, 255, 0.1) 1px,
          rgba(100, 200, 255, 0.1) 2px
        )`,
        }}
      />

      <NavbarDemo />

      <div className="relative z-10 pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/polls"
              className="group inline-flex items-center gap-2 text-gray-400 hover:text-cyan-300 transition-colors duration-300 font-mono text-sm"
            >
              <ArrowLeft
                className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
                strokeWidth={2}
              />
              <span>BACK_TO_GRID</span>
            </Link>

            {isCreator && !poll.closed && (
              <button
                onClick={handleClosePoll}
                disabled={closing}
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900/80 hover:bg-red-900/30 border border-red-500/40 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 font-mono text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {closing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    <span>TERMINATING...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>TERMINATE_POLL</span>
                  </>
                )}
              </button>
            )}
          </div>

          {closeSuccess && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-500/40 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 font-mono text-sm">
                <CheckCircle className="w-4 h-4" strokeWidth={2} />
                <span>POLL_TERMINATED_SUCCESSFULLY</span>
              </div>
            </div>
          )}

          {closeError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/40 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 font-mono text-sm">
                <XCircle className="w-4 h-4" strokeWidth={2} />
                <span>{closeError}</span>
              </div>
            </div>
          )}

          <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-8 mb-8 overflow-hidden">
            <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-cyan-500/60" />
            <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-cyan-500/60" />
            <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-cyan-500/60" />
            <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-cyan-500/60" />

            <div className="flex items-start justify-between mb-8 gap-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl text-white font-bold tracking-tight mb-4 font-mono">
                  {poll.title}
                </h1>
                {poll.description && (
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {poll.description}
                  </p>
                )}
              </div>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-mono ${
                  poll.closed
                    ? "bg-red-900/30 border-red-500/40 text-red-400"
                    : "bg-green-900/30 border-green-500/40 text-green-400"
                }`}
              >
                {poll.closed ? (
                  <>
                    <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>TERMINATED</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-2 h-2 fill-green-400" />
                    <span>ACTIVE</span>
                  </>
                )}
              </div>
            </div>

            {isCreator && (
              <div className="mb-6 p-3 bg-cyan-900/30 border border-cyan-500/40 rounded-lg">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm">
                  <Crown className="w-4 h-4" strokeWidth={2} />
                  <span>SYSTEM_ADMINISTRATOR</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm mb-8 font-mono">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-white/80">
                  {totalVotes.toLocaleString()}
                </span>
                <span>VOTES</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                <span>{formatDate(poll.created_at)}</span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-8">
              {poll.options && poll.options.length > 0 ? (
                <PollVoteClient
                  pollId={poll.id}
                  options={poll.options}
                  closed={poll.closed}
                  userVoted={poll.user_voted}
                  creatorId={poll.creator_id}
                  currentUserId={poll.current_user_id}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-mono">
                    NO_OPTIONS_AVAILABLE
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-gray-500 text-xs space-y-1.5 font-mono">
            <p>POLL_ID: {poll.id}</p>
            <p>CREATOR_ID: {poll.creator_id?.substring(0, 8)}...</p>
            {isCreator && (
              <div className="flex items-center justify-center gap-2 text-cyan-400 mt-3">
                <Crown className="w-3.5 h-3.5" strokeWidth={2} />
                <span>ADMINISTRATOR_MODE</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
