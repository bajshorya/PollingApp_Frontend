"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { AuthButton } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";

export function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-4" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    router.push("/auth/signin");
  };

  return (
    <div
      className={cn("fixed inset-x-0 max-w-2xl mx-auto z-50 px-4", className)}
    >
      <div className="relative rounded-lg border border-gray-700 bg-gray-900/80 backdrop-blur-sm shadow-lg flex justify-between items-center px-6 py-3 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
            linear-gradient(90deg, rgba(100, 200, 255, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(100, 200, 255, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={() => router.push("/")}
            className="group/btn relative px-4 py-2 text-sm font-mono rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-cyan-300 border border-gray-600 hover:border-cyan-500/40 transition-all duration-300 flex items-center gap-2"
          >
            <span className="relative z-10">TERMINAL</span>
          </button>
          <button
            onClick={() => router.push("/polls")}
            className="group/btn relative px-4 py-2 text-sm font-mono rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-cyan-300 border border-gray-600 hover:border-cyan-500/40 transition-all duration-300 flex items-center gap-2"
          >
            <span className="relative z-10">POLL_GRID</span>
          </button>
          {isLoggedIn && (
            <button
              onClick={() => router.push("/create-new-poll")}
              className="group/btn relative px-4 py-2 text-sm font-mono rounded-lg bg-gray-800 hover:bg-cyan-900/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-500 transition-all duration-300 flex items-center gap-2"
            >
              <span className="relative z-10">CREATE_NEW</span>
            </button>
          )}
        </div>

        <div className="relative z-10">
          <AuthButton
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={() => {}}
            onSignOut={handleSignOut}
          />
        </div>
      </div>
    </div>
  );
}
