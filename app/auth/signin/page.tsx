"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signinWithPasskey } from "@/app/lib/webauthn";
import Link from "next/link";
import { ArrowLeft, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function SigninPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasskeySignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username) return setStatus("Username required");

    try {
      setLoading(true);
      setStatus("Waiting for passkey…");
      const res = await signinWithPasskey(username);

      const successMessage =
        res.message || res.status || "Authentication successful!";
      setStatus(`✅ ${successMessage}`);

      await checkAuth();

      setTimeout(() => {
        router.push("/polls");
      }, 1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setStatus(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/[0.08] rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-violet-400/[0.08] rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 w-full max-w-md">
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

        <div className="relative rounded-3xl border border-white/[0.15] bg-gradient-to-br from-white/[0.12] to-white/[0.06] backdrop-blur-xl p-8 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/[0.2] to-blue-500/[0.2] border border-cyan-400/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <LogIn className="w-6 h-6 text-cyan-300" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Welcome back
                </h2>
              </div>
              <p className="text-white/60 text-sm pl-15">
                Sign in to continue your journey
              </p>
            </div>

            <form className="space-y-6" onSubmit={handlePasskeySignin}>
              <LabelInputContainer>
                <Label
                  htmlFor="username"
                  className="text-white/80 font-semibold mb-3"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:bg-white/[0.08] px-5 py-3.5 rounded-xl transition-all duration-300"
                />
              </LabelInputContainer>

              <button
                className="group/btn relative block h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500/[0.18] to-blue-500/[0.18] hover:from-cyan-500/[0.25] hover:to-blue-500/[0.25] font-bold text-cyan-300 border border-cyan-400/40 hover:border-cyan-400/60 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                type="submit"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Sparkles
                        className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300"
                        strokeWidth={2.5}
                      />
                      Sign in with Passkey
                    </>
                  )}
                </span>
                <BottomGradient />
              </button>

              {status && (
                <div
                  className={cn(
                    "rounded-xl p-4 text-sm font-medium transition-all duration-300",
                    status.includes("✅")
                      ? "border border-emerald-400/30 bg-gradient-to-r from-emerald-500/[0.12] to-green-500/[0.12] text-emerald-300"
                      : "border border-rose-400/30 bg-gradient-to-r from-rose-500/[0.12] to-red-500/[0.12] text-rose-300 animate-shake",
                  )}
                >
                  {status}
                </div>
              )}
            </form>

            <div className="mt-8 pt-6 border-t border-white/[0.1]">
              <p className="text-white/50 text-sm text-center">
                New here?{" "}
                <Link
                  href="/auth/signup"
                  className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors duration-300 hover:underline"
                >
                  Create an account
                </Link>
              </p>
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

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
