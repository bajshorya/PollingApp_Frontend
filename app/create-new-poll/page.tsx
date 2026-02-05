"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogIn, ArrowLeft, X } from "lucide-react";
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

    if (!title.trim()) {
      setError("Poll title is required");
      setLoading(false);
      return;
    }

    if (title[0] === " ") {
      setError("Poll title cannot start with a space");
      setLoading(false);
      return;
    }

    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      setError("Please provide at least 2 valid poll options");
      setLoading(false);
      return;
    }

    for (const option of validOptions) {
      if (option[0] === " ") {
        setError("Poll options cannot start with a space");
        setLoading(false);
        return;
      }
    }

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
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#0a1a2a] via-[#081220] to-[#050a15]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
            linear-gradient(90deg, rgba(100, 200, 255, 0.03) 1px, transparent 1px),
            linear-gradient(rgba(100, 200, 255, 0.03) 1px, transparent 1px)
          `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="fixed top-10 left-10 z-0 opacity-10 font-mono text-xs text-cyan-400">
        01110000 01101111 01101100 01101100
      </div>
      <div className="fixed bottom-10 right-10 z-0 opacity-10 font-mono text-xs text-purple-400">
        01100011 01110010 01100101 01100001 01110100 01100101
      </div>

      <div className="relative z-10 w-full pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/polls"
            className="group inline-flex items-center gap-2 text-gray-400 hover:text-cyan-300 mb-8 transition-colors duration-300 font-mono text-sm"
          >
            <ArrowLeft
              className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
              strokeWidth={2}
            />
            <span>CANCEL_CREATION</span>
          </Link>

          <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-8 overflow-hidden">
            <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-cyan-500/60" />
            <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-cyan-500/60" />
            <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-cyan-500/60" />
            <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-cyan-500/60" />

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gray-800 border border-cyan-500/40 rounded-lg flex items-center justify-center">
                <Plus className="w-7 h-7 text-cyan-400" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl text-white font-bold tracking-tighter font-mono">
                  CREATE_NEW_POLL
                </h1>
                <p className="text-gray-400 text-sm mt-1 font-mono">
                  INITIALIZE_NEW_DATASET
                </p>
              </div>
            </div>

            {error === "You need to be signed in to create a poll" ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-800 border border-cyan-500/40 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <LogIn
                    className="w-10 h-10 text-cyan-400"
                    strokeWidth={1.5}
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 font-mono">
                  AUTHENTICATION_REQUIRED
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto font-mono">
                  ACCESS_DENIED: ADMINISTRATOR_CREDENTIALS_REQUIRED
                </p>
                <Link
                  href="/auth/signin"
                  className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-gray-800 hover:bg-gray-700 border border-cyan-500/40 hover:border-cyan-500 rounded-lg text-cyan-300 font-mono text-sm transition-all duration-300"
                >
                  <LogIn className="w-5 h-5" strokeWidth={2} />
                  <span>PROCEED_TO_AUTHENTICATION</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                  <div>
                    <label className="flex items-center gap-2 text-gray-300 mb-3 font-mono text-sm">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      POLL_TITLE
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-5 py-3.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-gray-700 transition-all duration-300 font-mono text-sm"
                      placeholder="ENTER_QUERY_TITLE"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-3 font-mono text-sm">
                      DESCRIPTION{" "}
                      <span className="text-gray-500">(OPTIONAL)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-5 py-3.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-gray-700 min-h-28 transition-all duration-300 resize-none font-mono text-sm"
                      placeholder="ADD_CONTEXTUAL_DATA"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="flex items-center gap-2 text-gray-300 font-mono text-sm">
                        <div className="w-2 h-2 bg-purple-400"></div>
                        POLL_OPTIONS
                      </label>
                      <button
                        type="button"
                        onClick={addOption}
                        className="group/add px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-cyan-500/40 rounded-lg text-gray-300 hover:text-cyan-300 text-sm font-mono transition-all duration-300 flex items-center gap-2"
                      >
                        <Plus
                          className="w-4 h-4 group-hover/add:rotate-90 transition-transform"
                          strokeWidth={2}
                        />
                        ADD_OPTION
                      </button>
                    </div>
                    <div className="space-y-3">
                      {options.map((option, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateOption(index, e.target.value)
                              }
                              className="w-full px-5 py-3.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-gray-700 transition-all duration-300 font-mono text-sm"
                              placeholder={`OPTION_${index + 1}`}
                              required
                            />
                          </div>
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="px-4 py-3.5 bg-gray-800 hover:bg-red-900/30 border border-gray-600 hover:border-red-500/40 rounded-lg text-gray-400 hover:text-red-400 font-mono transition-all duration-300 flex items-center"
                            >
                              <X className="w-4 h-4" strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-3 flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      MINIMUM_2_OPTIONS_REQUIRED
                    </p>
                  </div>

                  {error &&
                    error !== "You need to be signed in to create a poll" && (
                      <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg">
                        <p className="text-red-400 font-mono text-sm">
                          {error}
                        </p>
                      </div>
                    )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full px-6 py-4 bg-gray-800 hover:bg-cyan-900/30 border border-gray-600 hover:border-cyan-500 rounded-lg text-gray-300 hover:text-cyan-300 font-mono text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                        <span>INITIALIZING_SYSTEM...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        <span>EXECUTE_CREATION</span>
                      </>
                    )}
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300" />
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
