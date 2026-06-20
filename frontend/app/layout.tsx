import type { Metadata } from "next";
import "./globals.css";
import ScrollObserver from "@/app/components/ScrollObserver";

export const metadata: Metadata = {
  title: "JeevanTrack - AI-Powered Personal Health Timeline",
  description: "Your entire health history, understood by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ScrollObserver />
        {children}
      </body>
    </html>
  );
}