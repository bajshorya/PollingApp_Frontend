"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signinWithPasskey } from "@/app/lib/webauthn";
import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function SigninPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasskeySignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username.trim()) {
      setStatus("Username is required");
      return;
    }

    if (username[0] === " ") {
      setStatus("Username cannot start with a space");
      return;
    }

    if (!/^[a-zA-Z0-9]/.test(username)) {
      setStatus("Username must start with a letter or number");
      return;
    }

    try {
      setLoading(true);
      setStatus("Waiting for passkey…");
      const res = await signinWithPasskey(username);

      if (!res) {
        setStatus("Invalid response from server. Please try again.");
        return;
      }

      if (res.error) {
        const errorLower = res.error.toLowerCase();

        if (
          errorLower.includes("not found") ||
          errorLower.includes("user not found")
        ) {
          setStatus(
            "❌ User does not exist. Please check your username and try again.",
          );
          return;
        }

        if (
          errorLower.includes("passkey invalid") ||
          errorLower.includes("invalid passkey")
        ) {
          setStatus(
            "❌ Passkey authentication failed. Your passkey is invalid or expired.",
          );
          return;
        }

        if (
          errorLower.includes("biometric") ||
          errorLower.includes("fingerprint") ||
          errorLower.includes("face id")
        ) {
          setStatus("❌ Biometric authentication failed. Please try again.");
          return;
        }

        if (errorLower.includes("authentication failed")) {
          setStatus(
            "❌ Authentication failed. Please verify your credentials and try again.",
          );
          return;
        }

        if (errorLower.includes("unauthorized")) {
          setStatus("❌ Unauthorized. Access denied.");
          return;
        }

        setStatus(`❌ ${res.error}`);
        return;
      }

      if (res.status === "success" || res.message) {
        const successMessage =
          res.message || res.status || "Authentication successful!";
        setStatus(`✅ ${successMessage}`);

        await checkAuth();

        setTimeout(() => {
          router.push("/polls");
        }, 1000);
      } else {
        setStatus("❌ Unexpected response from server. Please try again.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const errorMessage = e.message || "Unknown error";
      const errorLower = errorMessage.toLowerCase();

      if (errorLower.includes("network") || errorLower.includes("fetch")) {
        setStatus(
          "❌ Network error. Please check your connection and try again.",
        );
      } else if (errorLower.includes("timeout")) {
        setStatus("❌ Request timed out. Please try again.");
      } else if (errorLower.includes("not found")) {
        setStatus(
          "❌ User does not exist. Please check your username and try again.",
        );
      } else if (errorLower.includes("passkey")) {
        setStatus("❌ Passkey authentication failed. Please try again.");
      } else if (errorLower.includes("user not authenticated")) {
        setStatus("❌ Authentication failed. Please try again.");
      } else {
        setStatus(`❌ ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#175588] relative overflow-hidden flex items-center justify-center px-4">
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

      <div className="fixed top-10 left-10 z-0 opacity-10 font-mono text-xs text-cyan-400">
        01110011 01101001 01100111 01101110 01101001 01101110
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-gray-400 hover:text-cyan-300 mb-8 transition-colors duration-300 font-mono text-sm"
        >
          <ArrowLeft
            className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
            strokeWidth={2}
          />
          <span>RETURN_TO_TERMINAL</span>
        </Link>

        <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-8 overflow-hidden">
          <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-cyan-500/60" />
          <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-cyan-500/60" />
          <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-cyan-500/60" />
          <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-cyan-500/60" />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-800 border border-cyan-500/40 rounded-lg flex items-center justify-center">
                <LogIn className="w-6 h-6 text-cyan-400" strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tighter font-mono">
                ACCESS_PORTAL
              </h2>
            </div>
            <p className="text-gray-400 text-sm pl-15 font-mono">
              AUTHENTICATION_REQUIRED
            </p>
          </div>

          <form className="space-y-6" onSubmit={handlePasskeySignin}>
            <LabelInputContainer>
              <Label
                htmlFor="username"
                className="text-gray-300 mb-3 font-mono text-sm"
              >
                USERNAME
              </Label>
              <Input
                id="username"
                placeholder="ENTER_USERNAME"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:bg-gray-700 px-5 py-3.5 rounded-lg transition-all duration-300 font-mono text-sm"
              />
            </LabelInputContainer>

            <button
              className="group relative block h-12 w-full rounded-lg bg-gray-800 hover:bg-cyan-900/30 font-mono text-cyan-300 border border-gray-600 hover:border-cyan-500 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              type="submit"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    <span>VERIFYING_CREDENTIALS...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" strokeWidth={2.5} />
                    <span>INITIATE_AUTHENTICATION</span>
                  </>
                )}
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300" />
            </button>

            {status && (
              <div
                className={cn(
                  "rounded-lg p-4 font-mono text-sm transition-all duration-300",
                  status.includes("✅")
                    ? "border border-green-500/40 bg-green-900/30 text-green-400"
                    : "border border-red-500/40 bg-red-900/30 text-red-400",
                )}
              >
                {status}
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-500 text-sm text-center font-mono">
              NEW_USER?{" "}
              <Link
                href="/auth/signup"
                className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors duration-300"
              >
                REQUEST_ACCESS
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
