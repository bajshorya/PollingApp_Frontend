"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signinWithPasskey } from "@/app/lib/webauthn";
import Link from "next/link";

export default function SigninPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username) return setStatus("Username required");

    try {
      setLoading(true);
      setStatus("Waiting for passkey…");
      const res = await signinWithPasskey(username);
      setStatus(`✅ ${res.message}`);

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
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="text-sm text-white/60">
            Sign in with your passkey to access your account
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSignin}>
          <LabelInputContainer>
            <Label htmlFor="username" className="text-white/90">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-lg bg-linear-to-br from-cyan-500 to-blue-500 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Waiting for passkey…" : "Sign in with Passkey"} →
            <BottomGradient />
          </button>

          {status && (
            <div
              className={cn(
                "rounded-md p-3 text-sm",
                status.includes("✅")
                  ? "border border-green-400/30 bg-green-500/10 text-green-300"
                  : "border border-red-400/30 bg-red-500/10 text-red-300",
              )}
            >
              {status}
            </div>
          )}
        </form>
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-white/50 text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
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
