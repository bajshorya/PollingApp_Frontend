/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative ">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-white/90 hover:text-white text-sm font-medium"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%+1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-xl"
              >
                <motion.div layout className="w-max h-full p-4">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex justify-between items-center space-x-2 px-4 py-2"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <a href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-40 dark:text-neutral-300">
          {description}
        </p>
      </div>
    </a>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <a
      {...rest}
      className="text-white/70 hover:text-white text-sm transition-colors"
    >
      {children}
    </a>
  );
};

export const AuthButton = ({
  isLoggedIn,
  setIsLoggedIn,
  onSignOut,
}: {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  onSignOut: () => void;
}) => {
  const router = useRouter();

  const handleSignOut = () => {
    onSignOut();
    setIsLoggedIn(false);
    router.push("/auth/signin");
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  return (
    <div className="flex items-center gap-2">
      {isLoggedIn ? (
        <button
          onClick={handleSignOut}
          className="group/btn relative px-4 py-2 text-sm font-bold rounded-full bg-linear-to-r from-rose-500/18 to-red-500/18 hover:from-rose-500/25 hover:to-red-500/25 text-rose-300 border border-rose-400/40 hover:border-rose-400/60 transition-all duration-300 flex items-center gap-2 overflow-hidden hover:scale-105 hover:shadow-lg hover:shadow-rose-500/20"
        >
          <div className="absolute inset-0 bg-linear-to-r from-rose-400/0 via-rose-400/10 to-rose-400/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          <svg
            className="w-4 h-4 relative z-10 group-hover/btn:translate-x-0.5 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="relative z-10">Sign Out</span>
        </button>
      ) : (
        <>
          <button
            onClick={handleSignIn}
            className="group/btn relative px-4 py-2 text-sm font-semibold rounded-full bg-white/12 hover:bg-white/18 text-white border border-white/20 hover:border-white/30 transition-all duration-300 flex items-center gap-2 overflow-hidden hover:scale-105"
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/8 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <svg
              className="w-4 h-4 relative z-10 group-hover/btn:-translate-x-0.5 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <span className="relative z-10">Sign In</span>
          </button>
          <button
            onClick={() => router.push("/auth/signup")}
            className="group/btn relative px-4 py-2 text-sm font-bold rounded-full bg-linear-to-r from-cyan-500/18 to-blue-500/18 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-300 border border-cyan-400/40 hover:border-cyan-400/60 transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <div className="absolute inset-0 bg-linear-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <span className="relative z-10">Sign Up</span>
          </button>
        </>
      )}
    </div>
  );
};
