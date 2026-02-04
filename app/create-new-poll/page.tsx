"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogIn, ArrowLeft, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { removeAuthToken } from "@/app/lib/jwt";

export default function CreateNewPollPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("You need to be signed in to create a poll");
      setLoading(false);
      return;
    }

    try {
      console.log("Creating poll with data:", {
        title,
        description: description || null,
        options: options.filter((opt) => opt.trim() !== ""),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || null,
          options: options.filter((opt) => opt.trim() !== ""),
        }),
      });

      console.log("Create poll response status:", response.status);

      if (response.status === 401) {
        setError("You need to be signed in to create a poll");
        removeAuthToken();
        router.push("/auth/signin");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        console.error("Create poll error:", data);
        throw new Error(data.error || "Failed to create poll");
      }

      const data = await response.json();
      console.log("Create poll success data:", data);

      if (!data.poll_id) {
        throw new Error("No poll ID returned from server");
      }

      router.push(`/polls/${data.poll_id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error creating poll:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/3 via-transparent to-violet-500/3" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/8 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-violet-400/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 w-full pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/polls"
            className="group inline-flex items-center gap-2 text-white/50 hover:text-white/90 mb-8 transition-colors duration-300"
          >
            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
              strokeWidth={2}
            />
            <span className="font-medium">Back to Polls</span>
          </Link>

          <div className="relative bg-gradient-to-br from-white/[0.12] to-white/[0.06] backdrop-blur-xl rounded-3xl p-8 border border-white/[0.15] shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/[0.2] to-blue-500/[0.2] border border-cyan-400/40 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Plus className="w-7 h-7 text-cyan-300" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl text-white font-bold tracking-tight">
                    Create New Poll
                  </h1>
                  <p className="text-white/60 text-sm mt-1">
                    Share your question with the community
                  </p>
                </div>
              </div>

              {error === "You need to be signed in to create a poll" ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-white/[0.12] to-white/[0.06] border border-white/[0.15] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <LogIn
                      className="w-10 h-10 text-white/60"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Authentication Required
                  </h2>
                  <p className="text-white/60 mb-8 max-w-md mx-auto">
                    You need to be signed in to create a poll and share your
                    ideas
                  </p>
                  <Link
                    href="/auth/signin"
                    className="group/btn relative inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-cyan-500/[0.18] to-blue-500/[0.18] hover:from-cyan-500/[0.25] hover:to-blue-500/[0.25] border border-cyan-400/40 hover:border-cyan-400/60 rounded-xl text-cyan-300 font-bold transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    <LogIn className="w-5 h-5 relative z-10" strokeWidth={2} />
                    <span className="relative z-10">Sign In</span>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-white/80 mb-3 font-semibold">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        Poll Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-5 py-3.5 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition-all duration-300"
                        placeholder="What would you like to know?"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-3 font-semibold">
                        Description{" "}
                        <span className="text-white/40 font-normal text-sm">
                          (Optional)
                        </span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-5 py-3.5 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] min-h-28 transition-all duration-300 resize-none"
                        placeholder="Add context or details about your poll..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="flex items-center gap-2 text-white/80 font-semibold">
                          Poll Options
                        </label>
                        <button
                          type="button"
                          onClick={addOption}
                          className="group/add px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] hover:border-white/[0.2] rounded-lg text-white text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                          <Plus
                            className="w-4 h-4 group-hover/add:rotate-90 transition-transform duration-300"
                            strokeWidth={2}
                          />
                          Add Option
                        </button>
                      </div>
                      <div className="space-y-3">
                        {options.map((option, index) => (
                          <div key={index} className="flex gap-3 group/option">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  updateOption(index, e.target.value)
                                }
                                className="w-full px-5 py-3.5 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition-all duration-300"
                                placeholder={`Option ${index + 1}`}
                                required
                              />
                            </div>
                            {options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="px-4 py-3.5 bg-gradient-to-r from-rose-500/[0.15] to-red-500/[0.15] hover:from-rose-500/[0.22] hover:to-red-500/[0.22] border border-rose-400/30 hover:border-rose-400/50 rounded-xl text-rose-300 font-medium transition-all duration-300 hover:scale-105 opacity-0 group-hover/option:opacity-100 flex items-center gap-2"
                              >
                                <X className="w-4 h-4" strokeWidth={2} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-white/40 text-xs mt-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        At least 2 options required
                      </p>
                    </div>

                    {error &&
                      error !== "You need to be signed in to create a poll" && (
                        <div className="p-4 bg-gradient-to-r from-rose-500/[0.12] to-red-500/[0.12] border border-rose-400/30 rounded-xl animate-shake">
                          <p className="text-rose-300 font-medium">{error}</p>
                        </div>
                      )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="group/btn relative w-full px-6 py-4 bg-gradient-to-r from-cyan-500/[0.18] to-blue-500/[0.18] hover:from-cyan-500/[0.25] hover:to-blue-500/[0.25] border border-cyan-400/40 hover:border-cyan-400/60 rounded-xl text-cyan-300 font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20 flex items-center justify-center gap-2.5"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
                          <span className="relative z-10">
                            Creating your poll...
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles
                            className="w-5 h-5 relative z-10 group-hover/btn:rotate-12 transition-transform duration-300"
                            strokeWidth={2.5}
                          />
                          <span className="relative z-10">Create Poll</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
