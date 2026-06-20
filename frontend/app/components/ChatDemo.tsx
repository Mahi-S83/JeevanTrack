"use client";
import { ArrowUp } from "lucide-react";

export default function ChatDemo() {
  return (
    <section className="py-20 px-4 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="reveal left">
            <span className="text-[#81CAD6] text-sm font-medium tracking-wider uppercase">Ask anything</span>
            <h2 className="text-3xl md:text-5xl font-medium text-[#1a2e32] mt-2 leading-tight">
              Your records answer <br />your questions.
            </h2>
            <p className="text-[#5a7a80] text-lg mt-3">
              No more digging through old files. Just ask in plain language.
            </p>
          </div>

          <div className="reveal right reveal-delay-1">
            <div className="bg-[#f5fafb] rounded-xl border border-[rgba(129,202,214,0.25)] p-6">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-[#EDCD44] text-[#3d3000] rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                    When was my iron level lowest?
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-[#81CAD6]/15 border border-[#81CAD6]/30 text-[#1a2e32] rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] text-sm leading-relaxed">
                    Your ferritin hit its lowest in <strong className="text-[#DC3E26]">March 2025 at 6 ng/mL</strong> — City Lab report. Also low in June 2024 at 14 ng/mL.
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-[#EDCD44] text-[#3d3000] rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                    Show all thyroid reports
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-[#81CAD6]/15 border border-[#81CAD6]/30 text-[#1a2e32] rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] text-sm leading-relaxed">
                    Found <strong>3 thyroid panels</strong> from 2022–2024. TSH stable: 2.1–3.4 mIU/L. No abnormal values.
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-[#81CAD6]/20">
                  <div className="flex-1 bg-white border border-[#81CAD6]/25 rounded-full px-4 py-2.5 text-sm text-[#5a7a80]">
                    Ask about your health records…
                  </div>
                  <button className="bg-[#81CAD6] text-white rounded-full p-2.5 hover:bg-[#6bb8c4] transition">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}