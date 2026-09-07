import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SessionScape | Revenue intelligence for massage businesses",
  description: "Find empty capacity, bring clients back, and grow revenue using your existing booking data."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
