"use client";
import { FileText, Stethoscope, AlertTriangle } from "lucide-react";

export default function Problem() {
  return (
    <section className="bg-[#0f1a1c] py-20 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="reveal text-3xl md:text-5xl font-medium text-white text-center mb-16 leading-tight">
          Your health history lives in a <br className="hidden md:block" />
          <span className="text-[#DC3E26]">pile of papers.</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="reveal reveal-delay-1 bg-[#141c26] rounded-lg p-8 hover:bg-[#141c26]/80 transition">
            <FileText className="w-10 h-10 text-[#DC3E26] mb-4" />
            <h3 className="text-white font-medium text-lg mb-2">Reports from 10 hospitals, no single place</h3>
            <p className="text-[#5a7a80] text-sm leading-relaxed">Your records are scattered across WhatsApp, email, physical folders, and hospital portals.</p>
          </div>

          <div className="reveal reveal-delay-2 bg-[#141c26] rounded-lg p-8 hover:bg-[#141c26]/80 transition">
            <Stethoscope className="w-10 h-10 text-[#DC3E26] mb-4" />
            <h3 className="text-white font-medium text-lg mb-2">Every new doctor starts from scratch</h3>
            <p className="text-[#5a7a80] text-sm leading-relaxed">You cannot remember your history. Doctors cannot see it. So they run the same tests again.</p>
          </div>

          <div className="reveal reveal-delay-3 bg-[#141c26] rounded-lg p-8 hover:bg-[#141c26]/80 transition">
            <AlertTriangle className="w-10 h-10 text-[#DC3E26] mb-4" />
            <h3 className="text-white font-medium text-lg mb-2">You never notice your own patterns</h3>
            <p className="text-[#5a7a80] text-sm leading-relaxed">Iron was low in 2023. Low again in 2025. But nobody connected the dots until now.</p>
          </div>
        </div>
      </div>
    </section>
  );
}