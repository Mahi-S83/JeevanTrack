"use client";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-[#81CAD6]/10 border-t border-[#81CAD6]/25 py-20 px-4 md:px-12">
      <div className="reveal scale max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-medium text-[#1a2e32] leading-tight">
          Your full health story, <br />
          <span className="text-[#81CAD6]">always in your pocket.</span>
        </h2>
        <p className="text-[#5a7a80] text-lg mt-4">
          No lost reports. No starting from scratch. No confusion.
        </p>
        <Link href="/login" className="inline-block bg-[#DC3E26] text-white px-12 py-4 rounded-full text-lg font-medium mt-8 hover:bg-[#c03520] transition">
          Create your free account →
        </Link>
      </div>
    </section>
  );
}