"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, Users } from "lucide-react";

export interface Poll {
  id: string;
  title: string;
  description: string;
  totalVotes: number;
  participants: number;
  timeRemaining: string;
  options: Array<{
    text: string;
    votes: number;
    percentage: number;
  }>;
  status: "live" | "ending-soon";
}

export const PollCard: React.FC<{ poll: Poll }> = ({ poll }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-md p-6 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{poll.title}</h3>
            {poll.status === "ending-soon" && (
              <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-300 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Ending soon
              </span>
            )}
            {poll.status === "live" && (
              <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-300 font-medium">
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">{poll.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6 py-4 border-t border-b border-white/5">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">
            {poll.totalVotes.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Total Votes</div>
        </div>
        <div className="text-center border-l border-r border-white/5">
          <div className="text-xl font-bold text-purple-400 flex items-center justify-center gap-1">
            <Users className="w-4 h-4" />
            {poll.participants.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Participants</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-400">
            {poll.timeRemaining}
          </div>
          <div className="text-xs text-gray-500">Time Left</div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {poll.options.map((option, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                {option.text}
              </span>
              <span className="text-xs text-gray-500">
                {option.votes.toLocaleString()} ({option.percentage}%)
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <Button className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all">
        Vote Now
      </Button>
    </div>
  );
};
