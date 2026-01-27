"use client";

import { useState } from "react";

interface Option {
  id: string;
  text: string;
  votes: number;
}

interface Props {
  pollId: string;
  options: Option[];
  closed: boolean;
  userVoted: boolean;
}

export default function PollVoteClient({
  pollId,
  options,
  closed,
  userVoted,
}: Props) {
  const [voted, setVoted] = useState(userVoted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function castVote(optionId: string) {
    if (loading || voted || closed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:8080/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ option_id: optionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Voting failed");
        return;
      }

      setVoted(true);
    } catch (err) {
      setError("Network error");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const totalVotes = options.reduce((s, o) => s + o.votes, 0);

  return (
    <div className="space-y-4">
      {options.map((option) => {
        const percent =
          totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

        return (
          <button
            key={option.id}
            disabled={closed || voted || loading}
            onClick={() => castVote(option.id)}
            className={`relative w-full text-left rounded-xl border border-white/20 px-5 py-4 transition-all
              ${
                closed || voted
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:border-white/40 hover:bg-white/10"
              }`}
          >
            <div
              className="absolute inset-y-0 left-0 bg-white/10 rounded-xl"
              style={{ width: `${percent}%` }}
            />

            <div className="relative flex justify-between">
              <span className="text-white noto-sans-medium">{option.text}</span>
              <span className="xanh-mono-regular text-white/70 text-sm">
                {option.votes} · {percent}%
              </span>
            </div>
          </button>
        );
      })}

      <div className="text-sm text-white/50 mt-3">
        {error && <p className="text-red-400">{error}</p>}
        {voted && !error && "You have already voted."}
        {closed && "Poll is closed."}
        {!closed && !voted && "Click an option to vote."}
      </div>
    </div>
  );
}
