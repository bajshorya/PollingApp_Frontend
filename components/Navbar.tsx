"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthButton } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";

export function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-4" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_PORT}/polls`, {
        method: "GET",
        credentials: "include",
      });
      setIsLoggedIn(response.status !== 401);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={cn("fixed inset-x-0 max-w-2xl mx-auto z-50", className)}>
        <div className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex justify-between items-center px-6 py-3">
          <div className="h-8 w-24 bg-white/10 rounded-full animate-pulse" />
          <div className="h-8 w-20 bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("fixed inset-x-0 max-w-2xl mx-auto z-50", className)}>
      <div className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex justify-between items-center px-6 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-200 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </button>
          <button
            onClick={() => router.push("/polls")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-200 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Polls
          </button>
          {isLoggedIn && (
            <button
              onClick={() => router.push("/create-new-poll")}
              className="px-4 py-2 text-sm font-medium rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 transition-all duration-200 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Poll
            </button>
          )}
        </div>
        <AuthButton isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      </div>
    </div>
  );
}
