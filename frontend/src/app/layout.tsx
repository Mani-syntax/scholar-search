import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Research Scholar | Search, Explain, Write",
  description: "AI-powered web platform that helps students and researchers throughout the entire research lifecycle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased h-[100dvh] overflow-hidden flex flex-col-reverse md:flex-row bg-white text-slate-900`}>
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto bg-slate-50/50 pb-safe">
          {children}
        </main>
      </body>
    </html>
  );
}
