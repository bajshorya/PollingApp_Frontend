"use client";

import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Poll {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  created_at: string;
}

const PollGrid = ({ polls }: { polls: Poll[] }) => {
  const formatDate = (dateString: string) => {
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
  };

  if (polls.length === 0) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {polls.map((poll, index) => (
          <Link
            key={poll.id}
            href={`/polls/${poll.id}`}
            className="group relative bg-white/[0.07] backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer h-44 flex flex-col"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute top-4 right-4">
              <span className="xanh-mono-regular text-[10px] text-white/30 tracking-wider">
                #{poll.id.slice(0, 6)}
              </span>
            </div>

            <h2 className="text-xl text-white/95 mb-3 line-clamp-2 leading-snug pr-16 noto-sans-semibold">
              {poll.title}
            </h2>

            <div className="mt-auto flex items-center justify-between">
              <span className="text-xs text-white/40 xanh-mono-regular">
                {formatDate(poll.created_at)}
              </span>

              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:text-white/90 group-hover:translate-x-0.5 transition-all duration-300" />
              </div>
            </div>
          </Link>
        ))}
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

export default PollGrid;
