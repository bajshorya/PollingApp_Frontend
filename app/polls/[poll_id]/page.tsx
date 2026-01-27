import React from "react";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollData {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  created_at: string;
  closed: boolean;
  user_voted: boolean;
  options: PollOption[];
}

async function fetchPollData(poll_id: string): Promise<PollData | null> {
  try {
    const response = await fetch(`http://localhost:8080/polls/${poll_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching poll data:", error);
    return null;
  }
}

export default async function LivePollPage({
  params,
}: {
  params: Promise<{ poll_id: string }>;
}) {
  const { poll_id } = await params;

  const pollData = await fetchPollData(poll_id);

  if (!pollData) {
    return (
      <div className="min-h-screen bg-[#175588] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Poll Not Found</h1>
          <p className="text-white/60 text-lg">
            The poll you&apos;re looking for doesn&apos;t exist or could not be
            loaded.
          </p>
        </div>
      </div>
    );
  }

  const totalVotes = pollData.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden">
      {/* background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 w-full pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-5xl text-white mb-4 inria-serif-bold">
                {pollData.title}
              </h1>
              <p className="text-white/70 text-lg mb-6 noto-sans-regular">
                {pollData.description}
              </p>

              <div className="flex flex-wrap gap-4 text-white/50 text-sm">
                <div>
                  <span className="font-semibold">Poll ID:</span>
                  <span className="xanh-mono-regular ml-2 bg-white/10 px-3 py-1 rounded border border-white/20">
                    {pollData.id.slice(0, 8)}…
                  </span>
                </div>

                <div>
                  <span className="font-semibold">Created:</span>
                  <span className="ml-2">
                    {new Date(pollData.created_at).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`ml-2 ${
                      pollData.closed ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {pollData.closed ? "Closed" : "Open"}
                  </span>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {pollData.options.map((option) => {
                const percentage =
                  totalVotes === 0
                    ? 0
                    : Math.round((option.votes / totalVotes) * 100);

                return (
                  <button
                    key={option.id}
                    disabled={pollData.closed || pollData.user_voted}
                    className={`relative w-full text-left rounded-xl border border-white/20 px-5 py-4 transition-all duration-300
                      ${
                        pollData.closed || pollData.user_voted
                          ? "cursor-not-allowed opacity-80"
                          : "hover:border-white/40 hover:bg-white/10"
                      }`}
                  >
                    {/* progress bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-white/10 rounded-xl"
                      style={{ width: `${percentage}%` }}
                    />

                    <div className="relative flex items-center justify-between">
                      <span className="text-white noto-sans-medium">
                        {option.text}
                      </span>

                      <span className="xanh-mono-regular text-sm text-white/70">
                        {option.votes} votes · {percentage}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer info */}
            <div className="mt-6 text-sm text-white/50">
              {pollData.user_voted && "You have already voted in this poll."}
              {pollData.closed && " Voting is closed for this poll."}
              {!pollData.closed &&
                !pollData.user_voted &&
                " Select an option to vote."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
