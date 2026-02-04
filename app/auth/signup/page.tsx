"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupWithPasskey } from "@/app/lib/webauthn";
import { registerUser } from "@/app/lib/jwt";
import {
  ArrowLeft,
  UserPlus,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authMethod, setAuthMethod] = useState<"passkey" | "traditional">(
    "passkey",
  );
  const router = useRouter();

  const handlePasskeySignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await signupWithPasskey(username.trim());

      const successMessage =
        res.message || res.status || "Registration successful!";
      setSuccess(`${successMessage} You can now sign in.`);

      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTraditionalSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await registerUser(username.trim());

      setSuccess(
        `Registration successful! Welcome ${res.username}. Redirecting to polls...`,
      );

      setTimeout(() => {
        router.push("/polls");
      }, 1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit =
    authMethod === "passkey" ? handlePasskeySignUp : handleTraditionalSignUp;

  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/[0.08] rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-violet-400/[0.08] rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-white/50 hover:text-white/90 mb-8 transition-colors duration-300"
          >
            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
              strokeWidth={2}
            />
            <span className="font-medium">Back</span>
          </Link>

          <div className="relative bg-gradient-to-br from-white/[0.12] to-white/[0.06] backdrop-blur-xl rounded-3xl p-8 border border-white/[0.15] shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/[0.2] to-blue-500/[0.2] border border-cyan-400/40 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-7 h-7 text-cyan-300" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Join the Community
                  </h1>
                  <p className="text-white/60 text-sm mt-1">
                    Create your account to get started
                  </p>
                </div>
              </div>

              <div className="relative flex border border-white/[0.12] rounded-xl p-1.5 bg-white/[0.06] mb-8 overflow-hidden">
                <div
                  className="absolute inset-y-1.5 bg-gradient-to-r from-cyan-500/[0.15] to-blue-500/[0.15] border border-cyan-400/30 rounded-lg transition-all duration-300"
                  style={{
                    left: authMethod === "passkey" ? "6px" : "50%",
                    width: "calc(50% - 6px)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setAuthMethod("passkey")}
                  className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${
                    authMethod === "passkey"
                      ? "text-cyan-300"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  Passkey
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod("traditional")}
                  className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${
                    authMethod === "traditional"
                      ? "text-cyan-300"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  Traditional
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/80 mb-3 text-sm font-semibold">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose your username"
                    className="w-full px-5 py-3.5 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition-all duration-300"
                    disabled={loading}
                  />
                  <p className="text-white/40 text-xs mt-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Pick something memorable
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-gradient-to-r from-rose-500/[0.12] to-red-500/[0.12] border border-rose-400/30 rounded-xl animate-shake">
                    <div className="flex items-center gap-2.5 text-rose-300">
                      <XCircle
                        className="w-4 h-4 flex-shrink-0"
                        strokeWidth={2}
                      />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-gradient-to-r from-emerald-500/[0.12] to-green-500/[0.12] border border-emerald-400/30 rounded-xl">
                    <div className="flex items-center gap-2.5 text-emerald-300">
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0"
                        strokeWidth={2}
                      />
                      <p className="text-sm font-medium">{success}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group/btn relative w-full px-6 py-4 bg-gradient-to-r from-cyan-500/[0.18] to-blue-500/[0.18] hover:from-cyan-500/[0.25] hover:to-blue-500/[0.25] border border-cyan-400/40 hover:border-cyan-400/60 rounded-xl text-cyan-300 font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 overflow-hidden hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
                      <span className="relative z-10">
                        {authMethod === "passkey"
                          ? "Creating your account..."
                          : "Setting things up..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <UserPlus
                        className="w-5 h-5 relative z-10 group-hover/btn:scale-110 transition-transform duration-300"
                        strokeWidth={2.5}
                      />
                      <span className="relative z-10">
                        {authMethod === "passkey"
                          ? "Create with Passkey"
                          : "Create Account"}
                      </span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/[0.1]">
                <p className="text-white/50 text-sm text-center">
                  Already part of the community?{" "}
                  <Link
                    href="/auth/signin"
                    className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors duration-300 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              {authMethod === "passkey" && (
                <div className="mt-6 p-5 bg-gradient-to-br from-white/[0.06] to-white/[0.03] rounded-xl border border-white/12">
                  <p className="text-white/60 text-xs text-center leading-relaxed">
                    Passkey authentication uses your device&apos;s biometrics
                    like Face ID or fingerprint. No passwords to remember, just
                    secure and seamless access.
                  </p>
                </div>
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
