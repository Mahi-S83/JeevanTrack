"use client";
import Link from "next/link";
import { Sparkles, Bot } from "lucide-react";

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-12 py-20 md:py-24 min-h-screen flex items-center">
      <div className="grid md:grid-cols-2 gap-12 items-center w-full">
        <div className="reveal left">
          <div className="inline-flex items-center gap-2 bg-[#81CAD6]/20 border border-[#81CAD6] text-[#2a7a86] px-4 py-1.5 rounded-full text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by Gemini Vision AI
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-tight text-[#1a2e32]">
            Your entire health
            <br />
            history, <span className="text-[#DC3E26]">understood</span>
            <br />
            by AI.
          </h1>

          <p className="text-[#5a7a80] text-lg leading-relaxed mt-4 max-w-lg">
            Every report you've ever had — lab tests, prescriptions, discharge summaries — organized into one timeline automatically. No manual entry. Ever.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/login" className="bg-[#DC3E26] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#c03520] transition">
              Upload your first report
            </Link>
            <a href="#how-it-works" className="border border-[#1a2e32]/30 text-[#1a2e32] px-8 py-3.5 rounded-full font-medium hover:bg-[#1a2e32]/5 transition">
              See how it works ↓
            </a>
          </div>
        </div>

        <div className="reveal right reveal-delay-1">
          <div className="bg-white rounded-[20px] border border-[rgba(129,202,214,0.25)] p-6 shadow-xl">
            <p className="text-xs uppercase tracking-wider text-[#5a7a80] font-medium mb-4">
              YOUR HEALTH TIMELINE · AUTO-BUILT BY AI
            </p>

            <div className="flex gap-3 mb-5">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#81CAD6]"></div>
                <div className="w-0.5 flex-1 min-h-8 bg-[#81CAD6]/30 mt-1"></div>
              </div>
              <div>
                <p className="text-xs text-[#5a7a80]">2023 · Apollo Hospitals</p>
                <p className="font-medium text-[#1a2e32]">Dengue Fever</p>
                <p className="text-sm text-[#5a7a80]">Dr. Priya Sharma · Platelets: 82,000 → 1,40,000</p>
                <span className="inline-block text-xs bg-[#81CAD6]/20 text-[#2a7a86] px-2 py-0.5 rounded mt-1">Resolved</span>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#EDCD44]"></div>
                <div className="w-0.5 flex-1 min-h-8 bg-[#EDCD44]/30 mt-1"></div>
              </div>
              <div>
                <p className="text-xs text-[#5a7a80]">2024 · Fortis Lab</p>
                <p className="font-medium text-[#1a2e32]">Vitamin D Deficiency</p>
                <p className="text-sm text-[#5a7a80]">Vit D: 11 ng/mL · D3 60,000 IU prescribed</p>
                <span className="inline-block text-xs bg-[#EDCD44]/20 text-[#7a6200] px-2 py-0.5 rounded mt-1">Recurring</span>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#DC3E26]"></div>
              </div>
              <div>
                <p className="text-xs text-[#5a7a80]">2025 · City Lab</p>
                <p className="font-medium text-[#1a2e32]">Iron Deficiency Anemia</p>
                <p className="text-sm text-[#5a7a80]">Hemoglobin: 9.8 g/dL · Ferritin: 6 ng/mL</p>
                <span className="inline-block text-xs bg-[#DC3E26]/20 text-[#DC3E26] px-2 py-0.5 rounded mt-1">Active</span>
              </div>
            </div>

            <div className="flex gap-3 bg-[#81CAD6]/10 border border-[#81CAD6]/30 rounded-lg p-3">
              <Bot className="w-5 h-5 text-[#81CAD6] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#5a7a80]">
                AI detected a <span className="text-[#DC3E26] font-medium">recurring nutritional deficiency</span> pattern across 2024–2025.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}