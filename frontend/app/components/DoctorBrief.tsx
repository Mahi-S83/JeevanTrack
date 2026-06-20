"use client";
import { FileText, Download } from "lucide-react";

export default function DoctorBrief() {
  return (
    <section id="doctor-brief" className="py-20 px-4 md:px-12 bg-[#f5fafb]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="reveal left order-2 md:order-1">
            <div className="bg-white rounded-xl border border-[rgba(129,202,214,0.25)] overflow-hidden shadow-xl">
              <div className="bg-[#81CAD6] p-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">AI Doctor Brief</h3>
                  <p className="text-white/70 text-sm">Auto-generated · Share instantly</p>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f5fafb] rounded-lg p-3">
                    <p className="text-xs text-[#5a7a80] uppercase tracking-wider">Active Conditions</p>
                    <p className="font-medium text-[#DC3E26]">Iron deficiency, Vit D low</p>
                  </div>
                  <div className="bg-[#f5fafb] rounded-lg p-3">
                    <p className="text-xs text-[#5a7a80] uppercase tracking-wider">Last Visit</p>
                    <p className="font-medium">City Lab · Mar 2025</p>
                  </div>
                  <div className="bg-[#f5fafb] rounded-lg p-3">
                    <p className="text-xs text-[#5a7a80] uppercase tracking-wider">Current Medicines</p>
                    <p className="font-medium">Iron tablets · D3 60,000 IU</p>
                  </div>
                  <div className="bg-[#f5fafb] rounded-lg p-3">
                    <p className="text-xs text-[#5a7a80] uppercase tracking-wider">AI Alert</p>
                    <p className="font-medium text-[#DC3E26]">Recurring nutritional deficiency</p>
                  </div>
                </div>
                <button className="w-full bg-[#DC3E26] text-white py-3 rounded-full font-medium mt-4 hover:bg-[#c03520] transition flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Generate PDF for my doctor →
                </button>
              </div>
            </div>
          </div>

          <div className="reveal right reveal-delay-1 order-1 md:order-2">
            <span className="text-[#81CAD6] text-sm font-medium tracking-wider uppercase">Doctor Brief</span>
            <h2 className="text-3xl md:text-5xl font-medium text-[#1a2e32] mt-2 leading-tight">
              Walk into every <br />appointment prepared.
            </h2>
            <p className="text-[#5a7a80] text-lg mt-3">
              One tap. Full context. Any doctor, anywhere gets your complete picture instantly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}