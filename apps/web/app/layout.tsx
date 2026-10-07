import "./globals.css"; import type { Metadata } from "next";
export const metadata: Metadata = { title: "CallPilot AI", description: "AI voice employees for considered conversations." };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
