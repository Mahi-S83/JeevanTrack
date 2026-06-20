"use client";

export default function Stats() {
  return (
    <section className="bg-[#0f1a1c] py-16 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="reveal scale">
            <p className="text-5xl md:text-6xl font-medium text-[#81CAD6]">0</p>
            <p className="text-[#5a7a80] text-sm mt-1">Manual entry required</p>
          </div>

          <div className="reveal scale reveal-delay-1 border-x border-white/10 px-8">
            <p className="text-5xl md:text-6xl font-medium text-[#81CAD6]">10s</p>
            <p className="text-[#5a7a80] text-sm mt-1">To extract any report</p>
          </div>

          <div className="reveal scale reveal-delay-2">
            <p className="text-5xl md:text-6xl font-medium text-[#81CAD6]">1</p>
            <p className="text-[#5a7a80] text-sm mt-1">Tap for your Doctor Brief</p>
          </div>
        </div>
      </div>
    </section>
  );
}