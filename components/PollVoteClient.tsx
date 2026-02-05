"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, CheckCircle, RotateCcw } from "lucide-react";

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
  creatorId?: string;
  currentUserId?: string;
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
  creatorId,
  currentUserId,
}: Props) {
  const [options, setOptions] = useState<FrontendOption[]>(initialOptions);
  const [voted, setVoted] = useState(userVoted);
  const [loading, setLoading] = useState(false);
  const [restartLoading, setRestartLoading] = useState(false);
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

  const restartPoll = useCallback(async () => {
    if (!creatorId || !currentUserId || creatorId !== currentUserId) {
      setError("Only the poll creator can restart the poll");
      return;
    }

    setRestartLoading(true);
    setError(null);
    console.log("Restarting poll:", pollId);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Authentication required");
      setRestartLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/polls/${pollId}/restart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Restart poll response status:", res.status);

      const data = await res.json();
      console.log("Restart poll response data:", data);

      if (!res.ok) {
        setError(data.error || "Failed to restart poll");
        return;
      }

      setClosed(false);
      setVoted(false);
      setError(null);
      console.log("✅ Poll restarted successfully");
    } catch (err) {
      console.error("Network error during restart:", err);
      setError("Network error");
    } finally {
      setRestartLoading(false);
    }
  }, [pollId, creatorId, currentUserId]);

  const totalVotes = options.reduce((s, o) => s + o.votes, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className={`w-2 h-2 rounded transition-all duration-500 ${
                  connectionStatus === "connected"
                    ? "bg-cyan-400"
                    : connectionStatus === "connecting"
                      ? "bg-yellow-400"
                      : "bg-gray-500"
                }`}
              />
              {connectionStatus === "connected" && (
                <>
                  <div className="absolute inset-0 w-2 h-2 rounded bg-cyan-400 animate-ping opacity-40" />
                </>
              )}
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {connectionStatus.toUpperCase()}
            </span>
          </div>
        </div>
        {!closed && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-500/40 rounded">
            <span className="text-xs text-green-400 font-mono">
              LIVE_VOTING_ACTIVE
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
            className={`group relative w-full text-left rounded-lg border px-6 py-4 transition-all duration-300 overflow-hidden font-mono
              ${
                closed
                  ? "opacity-60 cursor-not-allowed border-gray-700 bg-gray-800/30"
                  : voted
                    ? "cursor-not-allowed border-gray-600 bg-gray-800/50"
                    : "hover:border-cyan-500/40 hover:bg-gray-800/70 border-gray-600 bg-gray-800/50"
              }`}
          >
            <div
              className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ${
                percent > 0 ? "bg-cyan-900/20" : "bg-transparent"
              }`}
              style={{ width: `${percent}%` }}
            />

            <div className="relative flex justify-between items-center gap-4">
              <span className="text-white font-mono text-sm flex-1">
                {option.text || "Unnamed option"}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-mono text-sm">
                    {option.votes.toLocaleString()}
                  </span>
                </div>
                <div
                  className={`px-3 py-1 rounded text-sm font-mono min-w-16 text-center ${
                    percent > 0
                      ? "bg-cyan-900/30 border border-cyan-500/30 text-cyan-400"
                      : "bg-gray-700 text-gray-400"
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
          <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg">
            <p className="text-red-400 font-mono text-sm">{error}</p>
          </div>
        )}
        {voted && !error && (
          <div className="p-4 bg-green-900/30 border border-green-500/40 rounded-lg">
            <div className="flex items-center gap-2.5 text-green-400 font-mono text-sm">
              <CheckCircle className="w-4 h-4" strokeWidth={2} />
              <span>VOTE_RECORDED_SUCCESSFULLY</span>
            </div>
          </div>
        )}
        {closed && (
          <div className="space-y-3">
            <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg">
              <p className="text-red-400 font-mono text-sm">
                VOTING_TERMINATED
              </p>
            </div>
            {creatorId && currentUserId && creatorId === currentUserId && (
              <button
                onClick={restartPoll}
                disabled={restartLoading}
                className="w-full p-4 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/40 hover:border-emerald-500/60 rounded-lg text-emerald-400 font-mono text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {restartLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    <span>RESTARTING_POLL...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" strokeWidth={2} />
                    <span>RESTART_POLL</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
        {!closed && !voted && !loading && !error && (
          <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
            <p className="text-cyan-400 font-mono text-sm">
              SELECT_OPTION_TO_VOTE
            </p>
          </div>
        )}
        {loading && (
          <div className="p-4 bg-yellow-900/30 border border-yellow-500/40 rounded-lg">
            <div className="flex items-center gap-2.5 text-yellow-400 font-mono text-sm">
              <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
              <span>PROCESSING_VOTE...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
