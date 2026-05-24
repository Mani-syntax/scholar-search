"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, Layers, PenTool, BookOpen } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Search", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: Bookmark },
  { name: "Compare Papers", href: "/compare", icon: Layers },
  { name: "Writing Assistant", href: "/writing", icon: PenTool }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full md:w-64 h-[72px] md:h-full bg-slate-50 border-t md:border-t-0 md:border-r border-slate-200 flex flex-row md:flex-col pt-0 md:pt-8 pb-0 md:pb-4 justify-around md:justify-start items-center md:items-stretch z-50 shrink-0">
      <div className="hidden md:flex px-6 mb-8 items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
        <BookOpen className="w-6 h-6" />
        <span>Research Scholar</span>
      </div>
      
      <nav className="flex-1 flex flex-row md:flex-col px-2 md:px-4 space-x-2 md:space-x-0 md:space-y-1 w-full justify-around md:justify-start items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors duration-200 w-full",
                isActive 
                  ? "text-indigo-700 bg-indigo-50/50 md:bg-indigo-50" 
                  : "text-slate-500 md:text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className={clsx("w-6 h-6 md:w-5 md:h-5", isActive ? "text-indigo-600" : "text-slate-400")} />
              <span className="hidden md:inline">{item.name}</span>
              <span className="inline md:hidden truncate w-full text-center text-[10px]">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Optional: Add Auth / Profile widget here later */}
      <div className="hidden md:block px-6 mt-auto">
        <div className="p-4 bg-indigo-50 rounded-xl text-xs text-indigo-800 border border-indigo-100">
          <p className="font-semibold mb-1">AI Powered</p>
          <p>Helping you from abstract to publication.</p>
        </div>
      </div>
    </div>
  );
}
