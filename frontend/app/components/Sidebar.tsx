"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Clock, Upload, MessageCircle, FileText, Settings, User, TrendingUp , NotebookPen} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Clock, label: "Timeline" },
  { href: "/upload", icon: Upload, label: "Upload Report" },
  { href: "/trends", icon: TrendingUp, label: "Health Trends" },  // <-- Add this line
  { href: "/ask", icon: MessageCircle, label: "Ask AI" },
  { href: "/brief", icon: FileText, label: "Doctor Brief" },
  { href: "/journal", icon: NotebookPen, label: "Health Journal" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-55 min-h-screen bg-white border-r border-[rgba(129,202,214,0.25)] p-4 flex flex-col">
      <Link href="/" className="flex items-center gap-2 text-[#1a2e32] font-medium text-lg mb-8 px-3">
        <div className="w-8 h-8 bg-[#81CAD6] rounded-lg flex items-center justify-center">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        JeevanTrack
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? "bg-[#81CAD6]/10 text-[#1a2e32] border-l-2 border-[#81CAD6]"
                  : "text-[#5a7a80] hover:bg-[#f5fafb]"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 px-3 py-3 border-t border-[rgba(129,202,214,0.25)]">
        <div className="w-8 h-8 rounded-full bg-[#81CAD6] flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
        <div>
          <p className="text-sm font-medium text-[#1a2e32]">User</p>
          <p className="text-xs text-[#5a7a80]">user@example.com</p>
        </div>
      </div>
    </aside>
  );
}