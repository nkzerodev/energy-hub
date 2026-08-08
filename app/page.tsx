"use client";

import Header from "@/components/layout/Header";
import Background from "@/components/layout/Background";
import HeroSection from "@/components/home/HeroSection";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-20">
      <Background />

      <div className="relative mx-auto max-w-7xl">
        <Header />
        <HeroSection />
      </div>
    </main>
  );
}