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
  Globe,
  XCircle,
  CheckCircle,
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
        <NavbarDemo />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-cyan-300 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/60">
              Loading poll {pollId ? `(${pollId.substring(0, 8)}...)` : ""}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-[#175588] relative overflow-hidden">
        <NavbarDemo />
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
              <p className="text-red-300 mb-4">{error || "Poll not found"}</p>
              <p className="text-white/60 text-sm mb-4">
                Poll ID: {pollId || "Unknown"}
              </p>
              <Link
                href="/polls"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Polls
              </Link>
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
      <NavbarDemo />

      <div className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/polls"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Polls
            </Link>

            {isCreator && !poll.closed && (
              <button
                onClick={handleClosePoll}
                disabled={closing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {closing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin" />
                    Closing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Close Poll
                  </>
                )}
              </button>
            )}
          </div>

          {closeSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle className="w-4 h-4" />
                <p className="text-sm">Poll closed successfully!</p>
              </div>
            </div>
          )}

          {closeError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-red-300">
                <XCircle className="w-4 h-4" />
                <p className="text-sm">{closeError}</p>
              </div>
            </div>
          )}

          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl text-white mb-4">{poll.title}</h1>
                {poll.description && (
                  <p className="text-white/70 mb-6">{poll.description}</p>
                )}
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  poll.closed
                    ? "bg-red-500/20 border border-red-500/30 text-red-300"
                    : "bg-green-500/20 border border-green-500/30 text-green-300"
                }`}
              >
                {poll.closed ? (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Closed
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Live
                  </div>
                )}
              </div>
            </div>

            {isCreator && (
              <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <p className="text-cyan-300 text-sm">
                  👑 You created this poll
                </p>
              </div>
            )}

            <div className="flex items-center gap-6 text-white/50 text-sm mb-8">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{totalVotes.toLocaleString()} total votes</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDate(poll.created_at)}</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              {poll.options && poll.options.length > 0 ? (
                <PollVoteClient
                  pollId={poll.id}
                  options={poll.options}
                  closed={poll.closed}
                  userVoted={poll.user_voted}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60">
                    No options available for this poll
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-white/40 text-sm">
            <p>
              Poll ID: <span className="font-mono">{poll.id}</span>
            </p>
            <p className="mt-1">
              Created by user:{" "}
              <span className="font-mono">
                {poll.creator_id?.substring(0, 8) || "Unknown"}...
              </span>
            </p>
            {isCreator && (
              <p className="mt-1 text-cyan-300">
                👑 You are the creator of this poll
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
