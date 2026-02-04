"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupWithPasskey } from "@/app/lib/webauthn";
import { ArrowLeft, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { checkAuth } = useAuth();

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

      await checkAuth();

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
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="fixed bottom-10 left-10 z-0 opacity-10 font-mono text-xs text-purple-400">
        01110011 01101001 01100111 01101110 01110101 01110000
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-gray-400 hover:text-cyan-300 mb-8 transition-colors duration-300 font-mono text-sm"
          >
            <ArrowLeft
              className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
              strokeWidth={2}
            />
            <span>CANCEL_REGISTRATION</span>
          </Link>

          <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-8 overflow-hidden">
            <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-cyan-500/60" />
            <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-cyan-500/60" />
            <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-cyan-500/60" />
            <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-cyan-500/60" />

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gray-800 border border-cyan-500/40 rounded-lg flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-cyan-400" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tighter font-mono">
                  REQUEST_ACCESS
                </h1>
                <p className="text-gray-400 text-sm mt-1 font-mono">
                  CREATE_NEW_CREDENTIALS
                </p>
              </div>
            </div>

            <form onSubmit={handlePasskeySignUp} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-3 text-sm font-mono">
                  USERNAME
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ENTER_DESIRED_USERNAME"
                  className="w-full px-5 py-3.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-gray-700 transition-all duration-300 font-mono text-sm"
                  disabled={loading}
                />
                <p className="text-gray-500 text-xs mt-2.5 font-mono">
                  SELECT_UNIQUE_IDENTIFIER
                </p>
              </div>
              ]{" "}
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg">
                  <div className="flex items-center gap-2.5 text-red-400 font-mono text-sm">
                    <XCircle className="w-4 h-4" strokeWidth={2} />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-900/30 border border-green-500/40 rounded-lg">
                  <div className="flex items-center gap-2.5 text-green-400 font-mono text-sm">
                    <CheckCircle className="w-4 h-4" strokeWidth={2} />
                    <span>{success}</span>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full px-6 py-4 bg-gray-800 hover:bg-cyan-900/30 border border-gray-600 hover:border-cyan-500 rounded-lg text-gray-300 hover:text-cyan-300 font-mono text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                <div className="absolute inset-0 bg-linear-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    <span>PROCESSING_REQUEST...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" strokeWidth={2.5} />
                    <span>GENERATE_CREDENTIALS</span>
                  </>
                )}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-gray-500 text-sm text-center font-mono">
                EXISTING_USER?{" "}
                <Link
                  href="/auth/signin"
                  className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors duration-300"
                >
                  PROCEED_TO_AUTHENTICATION
                </Link>
              </p>
            </div>

            <div className="mt-6 p-5 bg-gray-800/50 rounded-lg border border-gray-600">
              <p className="text-gray-500 text-xs text-center leading-relaxed font-mono">
                AUTHENTICATION_USES_BIOMETRIC_CREDENTIALS.
                NO_PASSWORDS_REQUIRED.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
