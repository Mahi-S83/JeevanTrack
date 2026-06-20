"use client";

import { Upload, Brain, Calendar, LucideIcon } from "lucide-react";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  direction: "left" | "right";
};

const steps: Step[] = [
  {
    number: "01",
    icon: Upload,
    title: "Upload",
    desc: "Drop any report — PDF, photo, scan. JeevanTrack accepts everything.",
    direction: "left",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Extracts",
    desc: "Gemini Vision reads it and pulls out doctor, hospital, diagnosis, medicines, dates, lab values — automatically.",
    direction: "right",
  },
  {
    number: "03",
    icon: Calendar,
    title: "Timeline builds",
    desc: "Every report adds to your growing health story. Visual, searchable, yours.",
    direction: "left",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 px-4 md:px-12 bg-[#f5fafb]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="reveal text-[#81CAD6] text-sm font-medium tracking-wider uppercase">
            How it works
          </span>

          <h2 className="reveal text-3xl md:text-5xl font-medium text-[#1a2e32] mt-2">
            Three steps. Your whole <br className="hidden md:block" />
            health story.
          </h2>
        </div>

        <div className="space-y-12 md:space-y-16">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className={`flex flex-col md:flex-row gap-8 items-center ${
                  step.direction === "right" ? "md:flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`reveal ${
                    step.direction === "left" ? "left" : "right"
                  } flex-1`}
                >
                  <span className="text-6xl md:text-8xl font-medium text-[#81CAD6]/20">
                    {step.number}
                  </span>

                  <h3 className="text-2xl font-medium text-[#1a2e32] mt-[-10px]">
                    {step.title}
                  </h3>

                  <p className="text-[#5a7a80] text-lg mt-2 max-w-md">
                    {step.desc}
                  </p>
                </div>

                <div
                  className={`reveal ${
                    step.direction === "left" ? "right" : "left"
                  } reveal-delay-1 flex-1 flex justify-center`}
                >
                  <div className="w-full max-w-sm aspect-[4/3] bg-white rounded-xl border border-[rgba(129,202,214,0.25)] flex items-center justify-center shadow-lg">
                    <Icon className="w-16 h-16 text-[#81CAD6]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}