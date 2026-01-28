"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

    const cookieString = document.cookie;

    try {
      const response = await fetch("http://localhost:8080/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieString,
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          description: description || null,
          options: options.filter((opt) => opt.trim() !== ""),
        }),
      });
      if (response.status === 401) {
        setError("You need to be signed in to create a poll");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create poll");
      }

      const data = await response.json();
      router.push(`/polls/${data.poll_id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating poll:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/polls"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Polls
          </Link>

          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-6 h-6 text-cyan-300/80" />
              <h1 className="text-3xl text-white inria-serif-bold">
                Create New Poll
              </h1>
            </div>

            {error === "You need to be signed in to create a poll" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LogIn className="w-8 h-8 text-white/60" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Sign In Required
                </h2>
                <p className="text-white/60 mb-6">
                  You need to be signed in to create a new poll.
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-white/80 mb-2">
                      Poll Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
                      placeholder="What's your poll about?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 min-h-25"
                      placeholder="Add more details about your poll..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-white/80">
                        Poll Options
                      </label>
                      <button
                        type="button"
                        onClick={addOption}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white text-sm transition-colors"
                      >
                        Add Option
                      </button>
                    </div>
                    <div className="space-y-3">
                      {options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updateOption(index, e.target.value)
                            }
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
                            placeholder={`Option ${index + 1}`}
                            required
                          />
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-white/40 text-sm mt-2">
                      At least 2 options are required
                    </p>
                  </div>

                  {error &&
                    error !== "You need to be signed in to create a poll" && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-300">{error}</p>
                      </div>
                    )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-xl text-cyan-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating Poll..." : "Create Poll"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
