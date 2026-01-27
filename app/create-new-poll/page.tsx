"use client";
import React, { useState } from "react";

interface PollOption {
  id?: string;
  text: string;
}

interface CreatePollResponse {
  poll_id: string;
  title: string;
  description: string;
  options: PollOption[];
}

const CreateNewPoll = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdPoll, setCreatedPoll] = useState<CreatePollResponse | null>(
    null,
  );
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    if (!title.trim()) {
      setError("Poll title is required");
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setError("Poll description is required");
      setLoading(false);
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      setError("Please provide at least 2 options");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          options: validOptions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create poll: ${response.statusText}`);
      }

      const data = (await response.json()) as CreatePollResponse;
      setCreatedPoll(data);
      setSuccess(true);
      setTitle("");
      setDescription("");
      setOptions(["", ""]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create poll. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success && createdPoll) {
    return (
      <div className="min-h-screen bg-[#175588] relative overflow-hidden flex items-center justify-center p-6">
        {/* Animated background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="w-full max-w-2xl relative">
          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
            {/* Success icon with animation */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="inline-block bg-linear-to-r from-emerald-400/20 to-cyan-400/20 text-emerald-300 px-6 py-2 rounded-full text-sm mb-4 border border-emerald-400/30 shadow-lg">
                ✨ Poll Created Successfully
              </div>
              <h2 className="text-4xl font-bold bg-linear-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3">
                {createdPoll.title}
              </h2>
              <p className="text-white/70 text-base">
                {createdPoll.description}
              </p>
            </div>

            <div className="mb-8">
              <p className="text-cyan-300 text-xs uppercase tracking-widest mb-4 font-bold">
                Poll Options
              </p>
              <div className="space-y-3">
                {createdPoll.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 text-white/90 px-5 py-4 rounded-xl border border-white/20 text-sm backdrop-blur-sm hover:bg-white/10 hover:border-cyan-400/40 transition-all duration-300 transform hover:translate-x-2"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <span className="text-cyan-400 font-bold mr-3">
                      {idx + 1}.
                    </span>
                    {opt.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <a
                href="/polls"
                className="flex-1 bg-linear-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-white px-6 py-4 rounded-xl text-center transition-all duration-300 border border-cyan-400/30 hover:border-cyan-400/50 font-medium shadow-lg hover:shadow-cyan-500/20 hover:scale-105"
              >
                View Live Polls →
              </a>
              <button
                onClick={() => {
                  setSuccess(false);
                  setCreatedPoll(null);
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white/90 px-6 py-4 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 font-medium hover:scale-105"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#175588] relative overflow-hidden flex items-center justify-center p-2">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="w-full max-w-2xl relative">
        {/* Floating header */}
        <div className="mb-3 transform hover:scale-105 transition-all duration-300">
          <h1 className="text-3xl font-bold bg-linear-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-1 drop-shadow-lg noto-sans-bold">
            Create Poll
          </h1>
          <p className="text-white/60 text-xs xanh-mono-regular">
            Share your question with the world ✨
          </p>
        </div>

        <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="space-y-3">
            {/* Title input */}
            <div className="group">
              <label className="block text-white/80 text-xs mb-1 font-medium group-hover:text-cyan-300 transition-colors duration-200 noto-sans-semibold">
                Title
              </label>
              <div
                className={`relative ${focusedField === "title" ? "scale-[1.02]" : ""} transition-transform duration-200`}
              >
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="What's your question?"
                  className="w-full bg-white/5 text-white placeholder:text-white/40 px-3 py-2 rounded-lg border-2 border-white/20 focus:border-cyan-400/60 focus:bg-white/10 outline-none transition-all duration-300 shadow-lg focus:shadow-cyan-500/20 text-sm"
                />
                {focusedField === "title" && (
                  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-cyan-400/20 to-blue-400/20 -z-10 blur-xl" />
                )}
              </div>
            </div>

            {/* Description textarea */}
            <div className="group">
              <label className="block text-white/80 text-xs mb-1 font-medium group-hover:text-cyan-300 transition-colors duration-200 noto-sans-semibold">
                Description
              </label>
              <div
                className={`relative ${focusedField === "description" ? "scale-[1.02]" : ""} transition-transform duration-200`}
              >
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Add some context..."
                  rows={2}
                  className="w-full bg-white/5 text-white placeholder:text-white/40 px-3 py-2 rounded-lg border-2 border-white/20 focus:border-cyan-400/60 focus:bg-white/10 outline-none transition-all duration-300 resize-none shadow-lg focus:shadow-cyan-500/20 text-sm"
                />
                {focusedField === "description" && (
                  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-cyan-400/20 to-blue-400/20 -z-10 blur-xl" />
                )}
              </div>
            </div>

            {/* Options */}
            <div className="group">
              <label className="block text-white/80 text-xs mb-2 font-medium group-hover:text-cyan-300 transition-colors duration-200 noto-sans-semibold">
                Options
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex gap-3 group/option hover:scale-[1.02] transition-transform duration-200"
                  >
                    <div
                      className={`relative flex-1 ${focusedField === `option-${index}` ? "scale-[1.02]" : ""} transition-transform duration-200`}
                    >
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        onFocus={() => setFocusedField(`option-${index}`)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={`Option ${index + 1}`}
                        className="w-full bg-white/5 text-white placeholder:text-white/40 px-3 py-2 rounded-lg border-2 border-white/20 focus:border-cyan-400/60 focus:bg-white/10 outline-none transition-all duration-300 shadow-lg focus:shadow-cyan-500/20 text-sm"
                      />
                      {focusedField === `option-${index}` && (
                        <div className="absolute inset-0 rounded-xl bg-linear-to-r from-cyan-400/20 to-blue-400/20 -z-10 blur-xl" />
                      )}
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="bg-linear-to-br from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-300 px-5 rounded-xl transition-all duration-300 border-2 border-red-500/30 hover:border-red-500/50 font-bold text-xl hover:rotate-90 hover:scale-110 shadow-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="w-full bg-linear-to-r from-white/5 to-white/10 hover:from-cyan-400/10 hover:to-blue-400/10 text-white/80 hover:text-white py-2 rounded-lg transition-all duration-300 border-2 border-dashed border-white/30 hover:border-cyan-400/50 text-xs font-medium hover:scale-[1.02] shadow-lg"
                >
                  + Add Another Option
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-linear-to-r from-red-500/20 to-pink-500/20 text-red-200 px-5 py-4 rounded-xl border-2 border-red-500/30 text-sm backdrop-blur-sm animate-pulse shadow-lg">
                ⚠️ {error}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="relative w-full bg-linear-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/40 hover:to-blue-500/40 disabled:from-white/5 disabled:to-white/5 text-white disabled:text-white/40 py-5 rounded-xl transition-all duration-300 border-2 border-cyan-400/40 hover:border-cyan-400/60 disabled:border-white/20 disabled:cursor-not-allowed font-bold text-lg shadow-xl hover:shadow-cyan-500/30 hover:scale-105 disabled:scale-100 overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Magic...
                  </span>
                ) : (
                  "Create Poll "
                )}
              </span>
              {!loading && (
                <div className="absolute inset-0 bg-linear-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewPoll;
