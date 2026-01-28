import Link from "next/link";

export default function Home() {
  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/bgHome.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold p-5 pointer-events-none  text-center ">
        <span>
          <h1 className="text-4xl md:text-4xl lg:text-7xl">
            <span className="xanh-mono-regular-italic ">Poll</span>
            <span className="noto-sans-light">Aesthetically</span>
          </h1>
          <Link
            href="/polls"
            className="mt-10 inline-block pointer-events-auto"
          >
            <div className="xanh-mono-regular font-bold border-2 p-3 rounded-2xl hover:cursor-pointer hover:transform transition-all hover:scale-105 hover:bg-white/10">
              Get Started
            </div>
          </Link>
        </span>
      </div>
    </>
  );
}
