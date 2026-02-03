"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupWithPasskey } from "@/app/lib/webauthn";
import { registerUser } from "@/app/lib/jwt";
import { ArrowLeft, UserPlus, CheckCircle, XCircle } from "lucide-react";

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

      // WebAuthn returns a different response structure
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

      // Traditional registration returns AuthResponse which doesn't have message
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-400/30 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Create Account
                </h1>
                <p className="text-white/60 text-sm">
                  Sign up for secure authentication
                </p>
              </div>
            </div>

            {/* Auth method selector */}
            <div className="flex border border-white/10 rounded-lg p-1 bg-white/5 mb-6">
              <button
                type="button"
                onClick={() => setAuthMethod("passkey")}
                className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                  authMethod === "passkey"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                Passkey
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("traditional")}
                className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                  authMethod === "traditional"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                Traditional
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  disabled={loading}
                />
                <p className="text-white/40 text-xs mt-2">
                  Choose a username for your account
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-300">
                    <XCircle className="w-4 h-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-green-300">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm">{success}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-xl text-cyan-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
                    {authMethod === "passkey"
                      ? "Creating account..."
                      : "Registering..."}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {authMethod === "passkey"
                      ? "Create Account with Passkey"
                      : "Create Account"}
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/50 text-sm text-center">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {authMethod === "passkey" && (
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/60 text-xs text-center">
                  Using Passkey means no passwords to remember. Your
                  device&apos;s biometrics (like Face ID or fingerprint) will be
                  used for authentication.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
