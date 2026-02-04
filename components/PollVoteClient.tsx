"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, TrendingUp, CheckCircle } from "lucide-react";

interface BackendOption {
  id: string;
  option_text: string;
  poll_id: string;
  votes: number;
}

interface FrontendOption {
  id: string;
  text: string;
  votes: number;
}

interface Props {
  pollId: string;
  options: FrontendOption[];
  closed: boolean;
  userVoted: boolean;
}

interface SseUpdate {
  options: BackendOption[];
  total_votes: number;
  updated_option_id?: string;
}

export default function PollVoteClient({
  pollId,
  options: initialOptions,
  closed: initialClosed,
  userVoted,
}: Props) {
  const [options, setOptions] = useState<FrontendOption[]>(initialOptions);
  const [voted, setVoted] = useState(userVoted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState(initialClosed);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");

  const transformOptions = (
    backendOptions: BackendOption[],
  ): FrontendOption[] => {
    return backendOptions.map((opt) => ({
      id: opt.id,
      text: opt.option_text || "",
      votes: opt.votes || 0,
    }));
  };

  useEffect(() => {
    if (closed) {
      console.log("SSE not starting because poll is closed");
      return;
    }

    console.log("Starting SSE connection for poll:", pollId);
    setConnectionStatus("connecting");

    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("❌ No auth token found for SSE");
      setConnectionStatus("disconnected");
      return;
    }

    const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/polls/${pollId}/sse?token=${encodeURIComponent(token)}`;
    console.log("Connecting to SSE URL:", sseUrl);

    const eventSource = new EventSource(sseUrl);
    eventSource.onopen = () => {
      console.log("✅ SSE connection opened for poll:", pollId);
      setConnectionStatus("connected");
    };

    eventSource.addEventListener("init", (event) => {
      console.log("📦 Received init event for poll:", pollId);
      try {
        const data = JSON.parse(event.data);
        if (data.poll && data.poll.closed) {
          setClosed(true);
        }
        if (data.options) {
          console.log("Setting initial options:", data.options);
          const transformedOptions = transformOptions(data.options);
          setOptions(transformedOptions);
        }
      } catch (err) {
        console.error("Error parsing init event:", err);
      }
    });

    eventSource.addEventListener("vote_update", (event) => {
      console.log("🔄 Received vote_update event for poll:", pollId);
      try {
        const data: SseUpdate = JSON.parse(event.data);
        console.log("Updated options received:", data.options);
        const transformedOptions = transformOptions(data.options);
        setOptions(transformedOptions);
      } catch (err) {
        console.error("Error parsing vote_update:", err);
      }
    });

    eventSource.addEventListener("poll_closed", () => {
      console.log("🔒 Received poll_closed event for poll:", pollId);
      setClosed(true);
      eventSource.close();
      setConnectionStatus("disconnected");
    });

    eventSource.onerror = (err) => {
      console.error("❌ SSE connection error for poll", pollId, ":", {
        error: err,
        readyState: eventSource.readyState,
        url: sseUrl,
      });

      if (eventSource.readyState === EventSource.CLOSED) {
        console.log("SSE connection was closed");
        setConnectionStatus("disconnected");
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.log("SSE is connecting/reconnecting...");
        setConnectionStatus("connecting");
      }
    };

    eventSource.onmessage = (event) => {
      console.log("📨 Raw SSE message for poll", pollId, ":", event.data);
    };

    return () => {
      console.log("🔌 Cleaning up SSE connection for poll:", pollId);
      eventSource.close();
      setConnectionStatus("disconnected");
    };
  }, [pollId, closed]);

  const castVote = useCallback(
    async (optionId: string) => {
      if (loading || voted || closed) return;

      setLoading(true);
      setError(null);
      console.log("Casting vote for option:", optionId);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/polls/${pollId}/vote`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ option_id: optionId }),
          },
        );

        console.log("Vote response status:", res.status);

        const data = await res.json();
        console.log("Vote response data:", data);

        if (!res.ok) {
          setError(data.error || "Voting failed");
          return;
        }

        setVoted(true);
        console.log("✅ Vote recorded successfully");

        setOptions((prevOptions) =>
          prevOptions.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt,
          ),
        );
      } catch (err) {
        console.error("Network error during vote:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    },
    [pollId, loading, voted, closed],
  );

  const totalVotes = options.reduce((s, o) => s + o.votes, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  connectionStatus === "connected"
                    ? "bg-emerald-400 shadow-lg shadow-emerald-400/50"
                    : connectionStatus === "connecting"
                      ? "bg-yellow-400"
                      : "bg-slate-400"
                }`}
              />
              {connectionStatus === "connected" && (
                <>
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-40" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse opacity-60" />
                </>
              )}
            </div>
            <span className="text-xs text-white/50 font-medium">
              {connectionStatus}
            </span>
          </div>
        </div>
        {!closed && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-emerald-500/15 to-green-500/15 border border-emerald-400/30 rounded-full">
            <TrendingUp className="w-3 h-3 text-emerald-400" strokeWidth={2} />
            <span className="text-xs text-emerald-300 font-bold">
              This Poll is Currently live !!!! VOTE NOW
            </span>
          </div>
        )}
      </div>

      {options.map((option) => {
        const percent =
          totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

        return (
          <button
            key={option.id}
            disabled={closed || voted || loading}
            onClick={() => castVote(option.id)}
            className={`group relative w-full text-left rounded-2xl border px-6 py-5 transition-all duration-500 overflow-hidden
              ${
                closed
                  ? "opacity-60 cursor-not-allowed border-white/8 bg-white/2"
                  : voted
                    ? "cursor-not-allowed border-white/12 bg-white/4"
                    : "hover:border-cyan-400/40 hover:bg-white/8 hover:scale-[1.02] border-white/15 bg-white/4 hover:shadow-lg hover:shadow-cyan-500/10"
              }
              ${
                voted && !closed
                  ? "cursor-default hover:border-white/12 hover:bg-white/4 hover:scale-100 hover:shadow-none"
                  : ""
              }`}
          >
            <div
              className={`absolute inset-y-0 left-0 rounded-2xl transition-all duration-700 ease-out ${
                percent > 0
                  ? "bg-linear-to-r from-cyan-500/15 to-blue-500/12"
                  : "bg-transparent"
              }`}
              style={{ width: `${percent}%` }}
            />

            <div className="relative flex justify-between items-center gap-4">
              <span className="text-white font-semibold text-base flex-1">
                {option.text || "Unnamed option"}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-white/70">
                  <Users className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-semibold text-sm">
                    {option.votes.toLocaleString()}
                  </span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold min-w-16 text-center transition-all duration-300 ${
                    percent > 0
                      ? "bg-linear-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300"
                      : "bg-white/8 text-white/60"
                  }`}
                >
                  {percent}%
                </div>
              </div>
            </div>
          </button>
        );
      })}

      <div className="pt-4 space-y-3">
        {error && (
          <div className="p-4 bg-linear-to-r from-rose-500/12 to-red-500/12 border border-rose-400/30 rounded-xl">
            <p className="text-rose-300 font-medium text-sm">{error}</p>
          </div>
        )}
        {voted && !error && (
          <div className="p-4 bg-linear-to-r from-emerald-500/12 to-green-500/12 border border-emerald-400/30 rounded-xl">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <CheckCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
              <p className="font-medium text-sm">
                Your vote has been recorded!
              </p>
            </div>
          </div>
        )}
        {closed && (
          <div className="p-4 bg-linear-to-r from-rose-500/12 to-red-500/12 border border-rose-400/30 rounded-xl">
            <p className="text-rose-300 font-medium text-sm">
              This poll is now closed
            </p>
          </div>
        )}
        {!closed && !voted && !loading && !error && (
          <div className="p-4 bg-linear-to-r from-cyan-500/8 to-blue-500/8 border border-cyan-400/25 rounded-xl">
            <p className="text-cyan-300 font-medium text-sm">
              Click an option to cast your vote
            </p>
          </div>
        )}
        {loading && (
          <div className="p-4 bg-linear-to-r from-yellow-500/12 to-amber-500/12 border border-yellow-400/30 rounded-xl">
            <div className="flex items-center gap-2.5 text-yellow-300">
              <div className="w-4 h-4 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
              <p className="font-medium text-sm">Submitting your vote...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
