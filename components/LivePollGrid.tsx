/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ArrowRight, TrendingUp, Users, Clock, Zap } from "lucide-react";
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

      const eventSource = new EventSource("http://localhost:8080/polls/sse", {
        withCredentials: true,
      });

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
      <div className="bg-white/[0.07] backdrop-blur-md rounded-xl p-16 border border-white/10 text-center">
        <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h3 className="text-lg text-white/90 mb-1 inria-serif-bold">
          No polls yet
        </h3>
        <p className="text-white/40 text-sm noto-sans-regular">
          Create the first poll to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-white/60 text-sm">
            {isConnected ? "Live updates connected" : "Connecting..."}
          </span>
        </div>

        {newPollCount > 0 && (
          <button
            onClick={handleNewPollNotification}
            className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-400/30 rounded-lg text-cyan-300 text-xs font-medium hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3 h-3" />
            {newPollCount} new poll{newPollCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              className={`group relative backdrop-blur-md rounded-xl p-6 border transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer h-48 flex flex-col
                ${
                  isNew
                    ? "border-cyan-400/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10"
                    : isLive
                      ? "border-green-400/20 bg-white/[0.07] hover:border-green-400/40"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isNew && (
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-cyan-500 border border-cyan-400 rounded-full text-xs text-white font-medium animate-bounce z-10">
                  NEW
                </div>
              )}

              {isLive && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[10px] text-green-300">
                  🔴 LIVE
                </div>
              )}

              <div className="absolute top-4 right-4">
                <span className="xanh-mono-regular text-[10px] text-white/30 tracking-wider">
                  #{poll.id.slice(0, 6)}
                </span>
              </div>

              <h2 className="text-xl text-white/95 mb-3 line-clamp-2 leading-snug pr-16 noto-sans-semibold mt-2">
                {poll.title}
              </h2>

              <div className="mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-white/50">
                      <Users className="w-3 h-3" />
                      <span className={isLive ? "text-green-300" : ""}>
                        {totalVotes.toLocaleString()} votes
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/50">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      poll.closed
                        ? "bg-red-500/20 border border-red-500/30 text-red-300"
                        : "bg-green-500/20 border border-green-500/30 text-green-300"
                    }`}
                  >
                    {poll.closed ? "Closed" : "Live"}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 xanh-mono-regular">
                    {optionsCount} option{optionsCount !== 1 ? "s" : ""}
                  </span>

                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                    <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:text-white/90 group-hover:translate-x-0.5 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
};

export default LivePollGrid;
