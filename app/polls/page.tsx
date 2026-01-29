export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { TrendingUp, LogIn } from "lucide-react";
import LivePollGrid from "@/components/LivePollGrid";
import { cookies } from "next/headers";
import Link from "next/link";

interface Poll {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  created_at: string;
  closed: boolean;
  user_voted: boolean;
  current_user_id?: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
}

const getLivePolls = async (): Promise<Poll[] | null> => {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const response = await fetch("http://localhost:8080/polls", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("Backend /polls error:", text);
      return [];
    }

    const polls: Poll[] = await response.json();

    return polls.map((poll) => ({
      ...poll,
      options: poll.options || [],
      total_votes:
        poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0,
    }));
  } catch (error) {
    console.error("Error fetching live polls:", error);
    return [];
  }
};

function UnauthenticatedMessage() {
  return (
    <div className="w-full py-20 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-8 h-8 text-white/60" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Authentication Required
        </h2>
        <p className="text-white/60 mb-6">
          You need to be signed in to view and participate in polls.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Link>
      </div>
    </div>
  );
}

async function PollsFetcher() {
  const polls = await getLivePolls();

  if (polls === null) {
    return <UnauthenticatedMessage />;
  }

  return <LivePollGrid initialPolls={polls} />;
}

const Loader = () => (
  <div className="w-full py-20 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white/60 text-base noto-sans-regular">
        Loading live polls...
      </p>
    </div>
  </div>
);

export default function LivePollsPage() {
  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden noto-sans-regular">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full pt-30 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-cyan-300/80" />
              <h1 className="text-4xl text-white inria-serif-bold">
                Live Polls
              </h1>
              <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-sm text-green-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Real-time
              </div>
            </div>
            <p className="text-white/50 text-sm noto-sans-light">
              Browse and participate in polls. Updates happen in real-time as
              users vote.
            </p>
          </div>

          <Suspense fallback={<Loader />}>
            <PollsFetcher />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
