import Link from "next/link";
import { Vortex } from "@/components/ui/vortex";

export default function Home() {
  return (
    <Vortex
      backgroundColor="black"
      baseHue={200}
      particleCount={5000}
      rangeY={300}
      className="min-h-screen flex items-center justify-center p-5"
      containerClassName="fixed inset-0 z-0"
    >
      <div className="fixed inset-0 z-10 bg-linear-to-b from-[#175588]/20 via-[#0d2a44]/20 to-[#7d3c69]" />

      <div className="fixed inset-0 z-20 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          )`,
          }}
        />
      </div>

      {/* Main content container */}
      <div className="relative z-30 w-full">
        <div className="text-center max-w-4xl mx-auto">
          <div className="relative mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter">
              <span className="relative inline-block">
                <span className="xanh-mono-regular-italic text-white block">
                  Poll
                </span>
                <span
                  className="absolute top-0 left-0 xanh-mono-regular-italic text-cyan-400 opacity-60"
                  style={{ transform: "translate(2px, 1px)" }}
                >
                  Poll
                </span>
              </span>

              <span className="relative inline-block ml-2 md:ml-4">
                <span className="noto-sans-light text-white block">
                  Aesthetically
                </span>
                <span
                  className="absolute top-0 left-0 noto-sans-light text-purple-400 opacity-60"
                  style={{ transform: "translate(-1px, 2px)" }}
                >
                  Aesthetically
                </span>
              </span>
            </h1>

            <div className="mt-6 h-px w-48 mx-auto bg-linear-to-r from-transparent via-cyan-500 to-transparent" />
            <div className="mt-1 h-px w-32 mx-auto bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-70" />
          </div>

          <p className="text-gray-300 noto-sans-light text-lg md:text-xl mb-12 tracking-wide max-w-2xl mx-auto">
            Create polls because Sydney Sweeny Says so, and vote because Dua
            Lipa Says so.
          </p>

          <Link href="/polls">
            <div className="group relative inline-block">
              <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300" />

              <button className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700 px-10 py-4 rounded-lg group-hover:border-cyan-500 transition-all duration-300">
                <div className="flex items-center justify-center gap-3">
                  <span className="xanh-mono-regular font-bold text-white text-lg tracking-wider">
                    GET STARTED
                  </span>
                  <svg
                    className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="square"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>

                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-cyan-500 transition-all duration-300" />
              </button>

              <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-purple-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-purple-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>
        </div>
      </div>

      <div className="fixed top-10 left-10 z-20 opacity-10">
        <div className="w-20 h-20 border border-gray-600 rotate-45" />
      </div>
      <div className="fixed bottom-10 right-10 z-20 opacity-10">
        <div className="w-32 h-px bg-linear-to-l from-cyan-500 to-transparent" />
      </div>
    </Vortex>
  );
}
