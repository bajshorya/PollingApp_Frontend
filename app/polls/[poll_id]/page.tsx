import React from "react";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import PollVoteClient from "@/components/PollVoteClient";
import Link from "next/link";
import { LogIn } from "lucide-react";

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
  current_user_id?: string;
}

async function fetchPollData(poll_id: string): Promise<PollData | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const response = await fetch(`http://localhost:8080/polls/${poll_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      // User is not authenticated
      return null;
    }

    if (!response.ok) {
      console.error(await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching poll data:", error);
    return null;
  }
}

async function closePollAction(pollId: string) {
  "use server";

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`http://localhost:8080/polls/${pollId}/close`, {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to close poll");
  }

  revalidatePath(`/polls/${pollId}`);
}

function UnauthenticatedMessage() {
  return (
    <div className="min-h-screen bg-[#175588] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-8 h-8 text-white/60" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Sign In Required</h1>
        <p className="text-white/60 text-lg mb-6">
          You need to be signed in to view this poll.
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

export default async function LivePollPage({
  params,
}: {
  params: Promise<{ poll_id: string }>;
}) {
  const { poll_id } = await params;
  const pollData = await fetchPollData(poll_id);

  if (pollData === null) {
    return <UnauthenticatedMessage />;
  }

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

  const isCreator = pollData.current_user_id === pollData.creator_id;

  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden">
      <div className="relative z-10 w-full pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h1 className="text-5xl text-white mb-4 inria-serif-bold">
              {pollData.title}
            </h1>
            <p className="text-white/70 text-lg mb-6 noto-sans-regular">
              {pollData.description}
            </p>
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 text-white text-sm">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>Creator ID: {pollData.creator_id || "missing"}</p>
              <p>Current User ID: {pollData.current_user_id ?? "not set"}</p>
              <p>Is Creator: {isCreator ? "YES" : "NO"}</p>
              <p>Poll Closed: {pollData.closed ? "YES" : "NO"}</p>
              <p>User Voted: {pollData.user_voted ? "YES" : "NO"}</p>
            </div>
            <div className="flex gap-4 text-white/50 text-sm mb-8">
              <span>Status:</span>
              <span
                className={pollData.closed ? "text-red-400" : "text-green-400"}
              >
                {pollData.closed ? "Closed" : "Open"}
              </span>
            </div>
            {isCreator && !pollData.closed && (
              <form
                action={async () => {
                  "use server";
                  await closePollAction(pollData.id);
                }}
                className="mb-8"
              >
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 transition"
                >
                  🔒 Close Poll
                </button>
              </form>
            )}
            <PollVoteClient
              pollId={pollData.id}
              options={pollData.options}
              closed={pollData.closed}
              userVoted={pollData.user_voted}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
