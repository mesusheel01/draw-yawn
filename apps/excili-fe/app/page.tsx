"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Draw-Yawn</h1>
        <p className="text-lg mb-8">
          Create and collaborate on beautiful drawings effortlessly.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/signin")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-lg font-medium transition"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md text-lg font-medium transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
