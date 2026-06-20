import Nav from "@/app/components/Nav";
import Hero from "@/app/components/Hero";
import Problem from "@/app/components/Problem";
import HowItWorks from "@/app/components/HowItWorks";
import Features from "@/app/components/Features";
import ChatDemo from "@/app/components/ChatDemo";
import DoctorBrief from "@/app/components/DoctorBrief";
import Stats from "@/app/components/Stats";
import FinalCTA from "@/app/components/FinalCTA";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <ChatDemo />
      <DoctorBrief />
      <Stats />
      <FinalCTA />
    </>
  );
}