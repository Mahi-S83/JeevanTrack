"use client";
import { Scan, ChartLine, MessageCircle, FileText, Lock, Calendar } from "lucide-react";

const features = [
  { icon: Scan, title: "Zero manual entry", desc: "AI reads any format and extracts everything", color: "teal" },
  { icon: ChartLine, title: "Trend detection", desc: "Spots recurring deficiencies across years", color: "yellow" },
  { icon: MessageCircle, title: "Ask your records", desc: "Natural questions, answers from your history", color: "red" },
  { icon: FileText, title: "AI Doctor Brief", desc: "One-page summary for any appointment", color: "teal" },
  { icon: Lock, title: "Private by design", desc: "Encrypted, yours, shareable only when you choose", color: "yellow" },
  { icon: Calendar, title: "One unified timeline", desc: "Every hospital merged into one visual journey", color: "red" }
];

const colorMap = {
  teal: { bg: "bg-[#81CAD6]/20", icon: "text-[#81CAD6]" },
  yellow: { bg: "bg-[#EDCD44]/20", icon: "text-[#b09000]" },
  red: { bg: "bg-[#DC3E26]/20", icon: "text-[#DC3E26]" }
};

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="reveal text-[#81CAD6] text-sm font-medium tracking-wider uppercase">What it does</span>
          <h2 className="reveal text-3xl md:text-5xl font-medium text-[#1a2e32] mt-2">
            Everything your health <br className="hidden md:block" />
            records should be.
          </h2>
          <p className="reveal text-[#5a7a80] text-lg mt-3 max-w-2xl mx-auto">
            JeevanTrack turns scattered reports into one living, searchable, AI-understood health story.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const colors = colorMap[feature.color as keyof typeof colorMap];
            return (
              <div
                key={index}
                className={`reveal reveal-delay-${index + 1} bg-white rounded-lg border border-[rgba(129,202,214,0.25)] p-6 hover:shadow-xl transition hover:-translate-y-1`}
              >
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
                  <feature.icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <h3 className="font-medium text-[#1a2e32] mb-1">{feature.title}</h3>
                <p className="text-sm text-[#5a7a80] leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}