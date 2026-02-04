/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  Circle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  created_at: string;
  closed: boolean;
  user_voted: boolean;
  current_user_id?: string;
  options: PollOption[];
  total_votes?: number;
}

const LivePollGrid = ({ initialPolls }: { initialPolls: Poll[] }) => {
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [newPollCount, setNewPollCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recent";
    }
  };

  const getTotalVotes = (poll: Poll) => {
    if (poll.total_votes !== undefined) {
      return poll.total_votes;
    }

    if (!poll.options || !Array.isArray(poll.options)) {
      return 0;
    }
    return poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
  };

  useEffect(() => {
    console.log("🔗 Attempting to connect to SSE...");

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimer: NodeJS.Timeout;

    const connectSSE = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error("❌ Max reconnection attempts reached");
        return;
      }

      console.log(
        `🔗 SSE connection attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`,
      );

      // Get JWT token
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("❌ No auth token found for SSE");
        return;
      }

      const eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_API_URL}/polls/sse?token=${encodeURIComponent(token)}`,
      );

      eventSource.onopen = () => {
        console.log("✅ SSE connection opened successfully");
        setIsConnected(true);
        reconnectAttempts = 0;
      };

      eventSource.onmessage = (event) => {
        console.log("📨 Raw SSE message:", event.data);

        try {
          const data = JSON.parse(event.data);
          console.log("📦 Parsed message data:", data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
      };

      eventSource.addEventListener("init", (event) => {
        console.log("📦 Received init event");
        try {
          const data = JSON.parse(event.data);
          console.log(
            "Parsed init data, polls count:",
            data.polls?.length || 0,
          );

          if (data.polls && Array.isArray(data.polls)) {
            console.log(`Setting ${data.polls.length} polls from SSE`);

            const updatedPolls = data.polls.map((poll: any) => ({
              id: poll.id,
              title: poll.title,
              description: poll.description,
              creator_id: poll.creator_id,
              created_at: poll.created_at,
              closed: poll.closed,
              user_voted: poll.user_voted || false,
              current_user_id: poll.current_user_id,
              options: Array.isArray(poll.options)
                ? poll.options.map((opt: any) => ({
                    id: opt.id,
                    text: opt.option_text || opt.text || "",
                    votes: opt.votes || 0,
                  }))
                : [],
              total_votes: poll.total_votes || 0,
            }));

            setPolls(updatedPolls);
          } else {
            console.error("No polls array in init data:", data);
          }
        } catch (error) {
          console.error("❌ Error parsing init event:", error);
          console.error("Raw event data:", event.data);
        }
      });

      eventSource.addEventListener("poll_created", (event) => {
        console.log("🎉 Received poll_created event");
        try {
          const data = JSON.parse(event.data);
          console.log("New poll data:", data);

          if (data.poll) {
            const newPoll = {
              id: data.poll.id,
              title: data.poll.title,
              description: data.poll.description,
              creator_id: data.poll.creator_id,
              created_at: data.poll.created_at,
              closed: data.poll.closed,
              user_voted: data.poll.user_voted || false,
              current_user_id: data.poll.current_user_id,
              options: Array.isArray(data.poll.options)
                ? data.poll.options.map((opt: any) => ({
                    id: opt.id,
                    text: opt.option_text || opt.text || "",
                    votes: opt.votes || 0,
                  }))
                : [],
              total_votes: data.poll.total_votes || 0,
            };

            setPolls((prev) => [newPoll, ...prev]);
            setNewPollCount((prev) => prev + 1);

            setTimeout(() => {
              setNewPollCount((prev) => Math.max(0, prev - 1));
            }, 5000);
          }
        } catch (error) {
          console.error("❌ Error parsing poll_created:", error);
        }
      });

      eventSource.addEventListener("poll_updated", (event) => {
        console.log("🔄 Received poll_updated event");
        try {
          const data = JSON.parse(event.data);
          console.log("Updated poll data:", data);

          if (data.poll) {
            const updatedPoll = {
              id: data.poll.id,
              title: data.poll.title,
              description: data.poll.description,
              creator_id: data.poll.creator_id,
              created_at: data.poll.created_at,
              closed: data.poll.closed,
              user_voted: data.poll.user_voted || false,
              current_user_id: data.poll.current_user_id,
              options: Array.isArray(data.poll.options)
                ? data.poll.options.map((opt: any) => ({
                    id: opt.id,
                    text: opt.option_text || opt.text || "",
                    votes: opt.votes || 0,
                  }))
                : [],
              total_votes: data.poll.total_votes || 0,
            };

            setPolls((prev) =>
              prev.map((poll) =>
                poll.id === data.poll_id ? updatedPoll : poll,
              ),
            );
          }
        } catch (error) {
          console.error("❌ Error parsing poll_updated:", error);
        }
      });

      eventSource.addEventListener("poll_closed", (event) => {
        console.log("🔒 Received poll_closed event");
        try {
          const data = JSON.parse(event.data);
          setPolls((prev) =>
            prev.map((poll) =>
              poll.id === data.poll_id ? { ...poll, closed: true } : poll,
            ),
          );
        } catch (error) {
          console.error("❌ Error parsing poll_closed:", error);
        }
      });

      eventSource.onerror = (error) => {
        console.error("❌ SSE connection error details:", {
          error,
          readyState: eventSource.readyState,
          url: eventSource.url,
          withCredentials: eventSource.withCredentials,
          eventType: error.type || "unknown",
        });

        setIsConnected(false);
        reconnectAttempts++;

        eventSource.close();

        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(
            `🔄 Will attempt to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`,
          );

          reconnectTimer = setTimeout(() => {
            connectSSE();
          }, delay);
        } else {
          console.error("❌ Max reconnection attempts reached. Giving up.");
        }
      };

      return () => {
        console.log("🔌 Cleaning up SSE connection");
        if (reconnectTimer) clearTimeout(reconnectTimer);
        eventSource.close();
        setIsConnected(false);
      };
    };

    connectSSE();

    return () => {
      console.log("🔌 Component unmounting, cleaning up SSE");
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  const handleNewPollNotification = () => {
    if (newPollCount > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setNewPollCount(0);
    }
  };

  if (!polls || polls.length === 0) {
    return (
      <div className="relative bg-linear-to-br from-white/[0.07] via-white/4 to-white/2 backdrop-blur-sm rounded-3xl p-24 border border-white/8 text-center overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/3 via-transparent to-violet-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.12] flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <TrendingUp
              className="w-9 h-9 text-white/40 group-hover:text-white/60 transition-colors duration-500"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="text-xl text-white/85 mb-2 font-semibold tracking-tight">
            Nothing here yet
          </h3>
          <p className="text-white/45 text-sm font-light">
            Be the first to spark a conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                isConnected
                  ? "bg-emerald-400 shadow-lg shadow-emerald-400/50"
                  : "bg-slate-400"
              }`}
            />
            {isConnected && (
              <>
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-40" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse opacity-60" />
              </>
            )}
          </div>
          <span className="text-white/60 text-sm font-medium tracking-wide group-hover:text-white/80 transition-colors duration-300">
            {isConnected ? "Connected" : "Reconnecting"}
          </span>
        </div>

        {newPollCount > 0 && (
          <button
            onClick={handleNewPollNotification}
            className="relative px-5 py-2.5 bg-linear-to-r from-cyan-500/12 to-blue-500/12 border border-cyan-400/30 rounded-full text-cyan-300 text-sm font-semibold hover:from-cyan-500/18 hover:to-blue-500/18 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 flex items-center gap-2.5 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="relative">
              {newPollCount} fresh {newPollCount > 1 ? "polls" : "poll"}
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls.map((poll, index) => {
          const totalVotes = getTotalVotes(poll);
          const timeAgo = formatDate(poll.created_at);
          const isNew = index < newPollCount;
          const optionsCount = poll.options?.length || 0;
          const isLive = !poll.closed;

          return (
            <Link
              key={poll.id}
              href={`/polls/${poll.id}`}
              className={`group relative backdrop-blur-md rounded-2xl p-7 border transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer h-56 flex flex-col overflow-hidden
                ${
                  isNew
                    ? "border-cyan-400/40 bg-linear-to-br from-cyan-500/8 to-blue-500/5 shadow-xl shadow-cyan-500/10"
                    : isLive
                      ? "border-white/10 bg-linear-to-br from-white/6 to-white/3 hover:from-white/8 hover:to-white/5 hover:border-white/15 hover:shadow-xl hover:shadow-white/5"
                      : "border-white/8 bg-linear-to-br from-white/4 to-white/2 hover:from-white/6 hover:to-white/3 hover:border-white/12"
                }`}
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: 0,
                animation:
                  "slideUpFade 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              <div className="absolute inset-0 bg-linear-to-br from-white/4 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-cyan-400/6 to-transparent rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-linear-to-tr from-violet-400/6 to-transparent rounded-full blur-2xl transform -translate-x-8 translate-y-8" />
              </div>

              {isNew && (
                <div className="absolute -top-3 -right-3 px-3.5 py-1.5 bg-linear-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-full text-[11px] text-white font-bold tracking-wider shadow-xl shadow-cyan-500/30 animate-subtle-bounce z-20">
                  NEW
                </div>
              )}

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    {isLive && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-linear-to-r from-emerald-500/15 to-green-500/15 border border-emerald-400/30 rounded-full group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
                        <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-300 font-bold tracking-widest">
                          LIVE
                        </span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl text-white/95 line-clamp-2 leading-tight font-semibold tracking-tight group-hover:text-white transition-colors duration-300">
                    {poll.title}
                  </h2>
                </div>
                <span className="text-[10px] text-white/25 tracking-widest font-mono mt-1 group-hover:text-white/40 transition-colors duration-300">
                  #{poll.id.slice(0, 6)}
                </span>
              </div>

              <div className="mt-auto space-y-4 relative z-10">
                <div className="flex items-center gap-5 text-xs text-white/45">
                  <div className="flex items-center gap-1.5 group/stat hover:text-white/70 transition-colors duration-300">
                    <Users
                      className="w-3.5 h-3.5 group-hover/stat:scale-110 transition-transform duration-300"
                      strokeWidth={1.5}
                    />
                    <span
                      className={`font-medium ${isLive ? "text-white/65" : ""}`}
                    >
                      {totalVotes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 group/stat hover:text-white/70 transition-colors duration-300">
                    <Clock
                      className="w-3.5 h-3.5 group-hover/stat:scale-110 transition-transform duration-300"
                      strokeWidth={1.5}
                    />
                    <span className="font-medium">{timeAgo}</span>
                  </div>
                  <div className="w-px h-3.5 bg-white/15" />
                  <span className="font-medium">
                    {optionsCount} choice{optionsCount !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/8 group-hover:border-white/12 transition-colors duration-300">
                  <div
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-300 ${
                      poll.closed
                        ? "bg-linear-to-r from-rose-500/15 to-red-500/15 border-rose-400/30 text-rose-300 group-hover:shadow-lg group-hover:shadow-rose-500/20"
                        : "bg-linear-to-r from-emerald-500/15 to-green-500/15 border-emerald-400/30 text-emerald-300 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
                    }`}
                  >
                    {poll.closed ? "Closed" : "Active"}
                  </div>

                  <div className="relative w-9 h-9 rounded-full bg-white/6 border border-white/10 flex items-center justify-center group-hover:bg-white/12 group-hover:border-white/20 group-hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <ArrowRight
                      className="w-4 h-4 text-white/60 group-hover:text-white/90 group-hover:translate-x-0.5 transition-all duration-300 relative z-10"
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes subtle-bounce {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.02);
          }
        }

        .animate-subtle-bounce {
          animation: subtle-bounce 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default LivePollGrid;
