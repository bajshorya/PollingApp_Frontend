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

  useEffect(() => {
    console.log("🔍 Route params:", params);
    console.log("🔍 Type of params:", typeof params);
    console.log("🔍 Params keys:", Object.keys(params));

    console.log("🔍 params.pollId:", params.pollId);
    console.log("🔍 params.poll_id:", params.poll_id);

    if (typeof window !== "undefined") {
      console.log("🔍 Current URL:", window.location.href);
      console.log("🔍 Current path:", window.location.pathname);
      const idFromPath = window.location.pathname.split("/").pop();
      console.log("🔍 ID from path:", idFromPath);
    }
  }, [params]);

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
  console.log("✅ Final pollId:", pollId);

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
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03]" />
        <NavbarDemo />
        <div className="pt-32 pb-12 px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
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
              Loading poll details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-[#175588] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.03] via-transparent to-red-500/[0.03]" />
        <NavbarDemo />
        <div className="pt-32 pb-12 px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-gradient-to-br from-rose-500/[0.12] to-red-500/[0.08] border border-rose-400/30 rounded-2xl p-12 text-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-400/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center">
                  <XCircle
                    className="w-8 h-8 text-rose-300"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-rose-300 mb-2 text-lg font-medium">
                  {error || "Poll not found"}
                </p>
                <p className="text-rose-300/60 text-sm mb-8 font-mono">
                  Poll ID: {pollId || "Unknown"}
                </p>
                <Link
                  href="/polls"
                  className="group/btn relative inline-flex items-center gap-2.5 px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 overflow-hidden hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.08] to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                  <ArrowLeft
                    className="w-4 h-4 relative z-10"
                    strokeWidth={2}
                  />
                  <span className="relative z-10">Back to Polls</span>
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
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/[0.05] rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/[0.05] rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
      <NavbarDemo />

      <div className="pt-32 pb-12 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/polls"
              className="group inline-flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors duration-300"
            >
              <ArrowLeft
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
                strokeWidth={2}
              />
              <span className="font-medium">Back to Polls</span>
            </Link>

            {isCreator && !poll.closed && (
              <button
                onClick={handleClosePoll}
                disabled={closing}
                className="group/btn relative inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-rose-500/[0.18] to-red-500/[0.18] hover:from-rose-500/[0.25] hover:to-red-500/[0.25] border border-rose-400/40 hover:border-rose-400/60 rounded-xl text-rose-300 font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden hover:scale-105 hover:shadow-lg hover:shadow-rose-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400/0 via-rose-400/10 to-rose-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                {closing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-rose-300/30 border-t-rose-300 rounded-full animate-spin relative z-10" />
                    <span className="relative z-10">Closing...</span>
                  </>
                ) : (
                  <>
                    <XCircle
                      className="w-4 h-4 relative z-10"
                      strokeWidth={2}
                    />
                    <span className="relative z-10">Close Poll</span>
                  </>
                )}
              </button>
            )}
          </div>

          {closeSuccess && (
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/[0.12] to-green-500/[0.12] border border-emerald-400/30 rounded-xl animate-slideDown">
              <div className="flex items-center gap-2.5 text-emerald-300">
                <CheckCircle
                  className="w-4 h-4 flex-shrink-0"
                  strokeWidth={2}
                />
                <p className="text-sm font-medium">Poll closed successfully!</p>
              </div>
            </div>
          )}

          {closeError && (
            <div className="mb-6 p-4 bg-gradient-to-r from-rose-500/[0.12] to-red-500/[0.12] border border-rose-400/30 rounded-xl animate-shake">
              <div className="flex items-center gap-2.5 text-rose-300">
                <XCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                <p className="text-sm font-medium">{closeError}</p>
              </div>
            </div>
          )}

          <div className="relative bg-gradient-to-br from-white/[0.12] to-white/[0.06] backdrop-blur-xl rounded-3xl p-8 border border-white/[0.15] shadow-2xl mb-8 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative">
              <div className="flex items-start justify-between mb-6 gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl text-white font-bold tracking-tight mb-4">
                    {poll.title}
                  </h1>
                  {poll.description && (
                    <p className="text-white/70 leading-relaxed">
                      {poll.description}
                    </p>
                  )}
                </div>
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${
                    poll.closed
                      ? "bg-gradient-to-r from-rose-500/[0.15] to-red-500/[0.15] border-rose-400/30 text-rose-300"
                      : "bg-gradient-to-r from-emerald-500/[0.15] to-green-500/[0.15] border-emerald-400/30 text-emerald-300"
                  }`}
                >
                  {poll.closed ? (
                    <>
                      <Lock className="w-4 h-4" strokeWidth={2} />
                      Closed
                    </>
                  ) : (
                    <>
                      <Circle className="w-3 h-3 fill-emerald-400 animate-pulse" />
                      Live
                    </>
                  )}
                </div>
              </div>

              {isCreator && (
                <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/[0.12] to-blue-500/[0.12] border border-cyan-400/30 rounded-xl">
                  <div className="flex items-center gap-2.5 text-cyan-300">
                    <Crown className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                    <p className="text-sm font-bold">You created this poll</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6 text-white/60 text-sm mb-8">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-semibold text-white/80">
                    {totalVotes.toLocaleString()}
                  </span>
                  <span>total votes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4" strokeWidth={1.5} />
                  <span>{formatDate(poll.created_at)}</span>
                </div>
              </div>

              <div className="border-t border-white/[0.1] pt-8">
                {poll.options && poll.options.length > 0 ? (
                  <PollVoteClient
                    pollId={poll.id}
                    options={poll.options}
                    closed={poll.closed}
                    userVoted={poll.user_voted}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/60 font-medium">
                      No options available for this poll
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center text-white/40 text-sm space-y-1.5">
            <p className="font-mono">Poll ID: {poll.id}</p>
            <p className="font-mono">
              Created by: {poll.creator_id?.substring(0, 8) || "Unknown"}...
            </p>
            {isCreator && (
              <div className="flex items-center justify-center gap-2 text-cyan-300 mt-2">
                <Crown className="w-3.5 h-3.5" strokeWidth={2} />
                <p className="text-sm font-semibold">You are the creator</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
