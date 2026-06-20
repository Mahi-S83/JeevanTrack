"use client";
import Link from "next/link";
import { Heart, Menu } from "lucide-react";
import { useState } from "react";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#f5fafb]/92 backdrop-blur-lg border-b border-[rgba(129,202,214,0.25)] px-4 md:px-12 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[#1a2e32] font-medium text-lg">
          <div className="w-8 h-8 bg-[#81CAD6] rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          JeevanTrack
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-[#5a7a80]">
          <Link href="#how-it-works" className="hover:text-[#1a2e32] transition">How it works</Link>
          <Link href="#features" className="hover:text-[#1a2e32] transition">Features</Link>
          <Link href="#doctor-brief" className="hover:text-[#1a2e32] transition">Doctor Brief</Link>
        </div>

        <Link href="/login" className="hidden md:block bg-[#DC3E26] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#c03520] transition">
          Upload a report →
        </Link>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          <Menu className="w-6 h-6 text-[#1a2e32]" />
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 text-[#5a7a80] border-t border-[rgba(129,202,214,0.25)] pt-4">
          <Link href="#how-it-works" onClick={() => setIsOpen(false)}>How it works</Link>
          <Link href="#features" onClick={() => setIsOpen(false)}>Features</Link>
          <Link href="#doctor-brief" onClick={() => setIsOpen(false)}>Doctor Brief</Link>
          <Link href="/login" className="bg-[#DC3E26] text-white px-6 py-2 rounded-full text-center">Upload a report →</Link>
        </div>
      )}
    </nav>
  );
}