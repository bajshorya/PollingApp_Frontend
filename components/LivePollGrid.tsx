/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Users, Clock, Circle } from "lucide-react";
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

      eventSource.addEventListener("poll_restarted", (event) => {
        console.log("🔄 Received poll_restarted event");
        try {
          const data = JSON.parse(event.data);
          console.log("Restarted poll data:", data);

          setPolls((prev) =>
            prev.map((poll) =>
              poll.id === data.poll_id ? { ...poll, closed: false } : poll,
            ),
          );
        } catch (error) {
          console.error("❌ Error parsing poll_restarted:", error);
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
      <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-lg p-24 border border-gray-700 text-center overflow-hidden">
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-gray-800 border border-gray-600 flex items-center justify-center">
            <div className="text-gray-400 font-mono">NO_DATA</div>
          </div>
          <h3 className="text-xl text-gray-300 mb-2 font-mono">
            NO_ACTIVE_POLLS
          </h3>
          <p className="text-gray-500 text-sm font-mono">
            INITIATE_FIRST_QUERY
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-2.5 h-2.5 rounded transition-all duration-500 ${
                isConnected ? "bg-cyan-400" : "bg-gray-500"
              }`}
            />
            {isConnected && (
              <>
                <div className="absolute inset-0 w-2.5 h-2.5 rounded bg-cyan-400 animate-ping opacity-40" />
              </>
            )}
          </div>
          <span className="text-gray-400 text-sm font-mono">
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>

        {newPollCount > 0 && (
          <button
            onClick={handleNewPollNotification}
            className="relative px-5 py-2.5 bg-cyan-900/30 border border-cyan-500/40 rounded-lg text-cyan-300 text-sm font-mono transition-all duration-300 flex items-center gap-2.5"
          >
            <span>
              {newPollCount} NEW_{newPollCount > 1 ? "POLLS" : "POLL"}
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className={`group relative backdrop-blur-sm rounded-lg p-6 border transition-all duration-300 hover:scale-[1.02] cursor-pointer h-56 flex flex-col overflow-hidden
                ${
                  isNew
                    ? "border-cyan-500/40 bg-cyan-900/10"
                    : isLive
                      ? "border-gray-600 hover:border-cyan-500/40 bg-gray-800/50 hover:bg-gray-800/70"
                      : "border-gray-700 bg-gray-800/30 hover:bg-gray-800/50"
                }`}
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: 0,
                animation:
                  "slideUpFade 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              {isNew && (
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-cyan-500 rounded text-xs text-white font-mono">
                  NEW
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    {isLive && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-900/30 border border-green-500/40 rounded text-xs">
                        <Circle className="w-1.5 h-1.5 fill-green-400" />
                        <span className="text-green-400 font-mono">LIVE</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-lg text-white line-clamp-2 leading-tight font-mono">
                    {poll.title}
                  </h2>
                </div>
                <span className="text-gray-500 text-xs font-mono">
                  #{poll.id.slice(0, 6)}
                </span>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span className="text-white/80">
                      {totalVotes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{timeAgo}</span>
                  </div>
                  <div className="w-px h-3.5 bg-gray-600" />
                  <span>
                    {optionsCount} OPTION{optionsCount !== 1 ? "S" : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div
                    className={`px-3 py-1 rounded text-xs font-mono ${
                      poll.closed
                        ? "bg-red-900/30 border border-red-500/40 text-red-400"
                        : "bg-green-900/30 border border-green-500/40 text-green-400"
                    }`}
                  >
                    {poll.closed ? "TERMINATED" : "ACTIVE"}
                  </div>

                  <div className="w-8 h-8 rounded bg-gray-700 border border-gray-600 flex items-center justify-center group-hover:border-cyan-500/40 transition-all duration-300">
                    <ArrowRight
                      className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyan-300"
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
      `}</style>
    </>
  );
};

export default LivePollGrid;
