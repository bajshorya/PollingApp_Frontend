/* eslint-disable @typescript-eslint/no-explicit-any */ "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signinWithPasskey } from "@/app/lib/webauthn";

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

      // Redirect to home page after 1 second
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (e: any) {
      setStatus(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-neutral-800 bg-black p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-neutral-100">Welcome back</h2>
          <p className="text-sm text-neutral-400">
            Sign in with your passkey to access your account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSignin}>
          <LabelInputContainer>
            <Label htmlFor="username" className="text-neutral-300">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-linear-to-br from-neutral-900 to-black font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] transition-all duration-200 hover:shadow-[0px_1px_0px_0px_#ffffff60_inset,0px_-1px_0px_0px_#ffffff60_inset] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ? "border border-green-900/50 bg-green-950/20 text-green-400"
                  : "border border-red-900/50 bg-red-950/20 text-red-400",
              )}
            >
              {status}
            </div>
          )}
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-black px-2 text-neutral-500">
              Don&apos;t have an account?
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push("/auth/signup")}
          className="group/btn shadow-input relative flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-neutral-800 bg-neutral-950 px-4 font-medium text-neutral-300 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900 hover:text-neutral-200"
          type="button"
        >
          <span className="text-sm">Create an account</span>
        </button>
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
