"use client";

import { useState, useEffect, useCallback } from "react";

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

    const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/polls/${pollId}/sse`;
    console.log("Connecting to SSE URL:", sseUrl);

    const eventSource = new EventSource(sseUrl, {
      withCredentials: true,
    });

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

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/polls/${pollId}/vote`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">
            Total votes: {totalVotes.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500 animate-pulse"
                  : connectionStatus === "connecting"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />
            <span className="text-xs text-white/50">{connectionStatus}</span>
          </div>
        </div>
        {!closed && (
          <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-300">
            Live updating
          </span>
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
            className={`relative w-full text-left rounded-xl border px-5 py-4 transition-all duration-300
              ${
                closed
                  ? "opacity-70 cursor-not-allowed border-white/10"
                  : voted
                    ? "cursor-not-allowed border-white/10"
                    : "hover:border-white/40 hover:bg-white/10 border-white/20"
              }
              ${
                voted && !closed
                  ? "cursor-default hover:border-white/10 hover:bg-transparent"
                  : ""
              }`}
          >
            <div
              className="absolute inset-y-0 left-0 bg-white/10 rounded-xl transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />

            <div className="relative flex justify-between items-center">
              <span className="text-white noto-sans-medium text-base">
                {option.text || "Unnamed option"}
              </span>
              <div className="flex items-center gap-3">
                <span className="xanh-mono-regular text-white/80 text-sm">
                  {option.votes.toLocaleString()} votes
                </span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/90 min-w-12 text-center">
                  {percent}%
                </span>
              </div>
            </div>
          </button>
        );
      })}

      <div className="text-sm text-white/50 mt-3">
        {error && <p className="text-red-400 mb-2">{error}</p>}
        {voted && !error && (
          <p className="text-green-300">✓ Your vote has been recorded!</p>
        )}
        {closed && <p className="text-red-300">Poll is closed.</p>}
        {!closed && !voted && !loading && (
          <p className="text-cyan-300">Click an option to vote.</p>
        )}
        {loading && <p className="text-yellow-300">Submitting your vote...</p>}
      </div>
    </div>
  );
}
