"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthButton } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import { getAuthToken, logoutUser } from "@/app/lib/jwt";

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
      const token = getAuthToken();
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/polls`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const handleSignOut = () => {
    logoutUser();
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div
        className={cn("fixed inset-x-0 max-w-2xl mx-auto z-50 px-4", className)}
      >
        <div className="rounded-full border border-white/15 bg-white/8 backdrop-blur-xl shadow-2xl flex justify-between items-center px-6 py-3">
          <div className="h-9 w-32 bg-white/6 rounded-full animate-pulse" />
          <div className="h-9 w-24 bg-white/6 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("fixed inset-x-0 max-w-2xl mx-auto z-50 px-4", className)}
    >
      <div className="relative rounded-full border border-white/15 bg-white/8 backdrop-blur-xl shadow-2xl flex justify-between items-center px-6 py-3 overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/3 via-transparent to-violet-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={() => router.push("/")}
            className="group/btn relative px-4 py-2 text-sm font-semibold rounded-full bg-white/12 hover:bg-white/18 text-white border border-white/20 hover:border-white/30 transition-all duration-300 flex items-center gap-2 overflow-hidden hover:scale-105"
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/8 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <svg
              className="w-4 h-4 relative z-10 group-hover/btn:scale-110 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="relative z-10">Home</span>
          </button>
          <button
            onClick={() => router.push("/polls")}
            className="group/btn relative px-4 py-2 text-sm font-semibold rounded-full bg-white/12 hover:bg-white/18 text-white border border-white/20 hover:border-white/30 transition-all duration-300 flex items-center gap-2 overflow-hidden hover:scale-105"
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/8 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <svg
              className="w-4 h-4 relative z-10 group-hover/btn:scale-110 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="relative z-10">Polls</span>
          </button>
          {isLoggedIn && (
            <button
              onClick={() => router.push("/create-new-poll")}
              className="group/btn relative px-4 py-2 text-sm font-bold rounded-full bg-linear-to-r from-cyan-500/18 to-blue-500/18 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-300 border border-cyan-400/40 hover:border-cyan-400/60 transition-all duration-300 flex items-center gap-2 overflow-hidden hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <div className="absolute inset-0 bg-linear-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              <svg
                className="w-4 h-4 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="relative z-10">Create</span>
            </button>
          )}
        </div>
        <div className="relative z-10">
          <AuthButton
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            onSignOut={handleSignOut}
          />
        </div>
      </div>
    </div>
  );
}
