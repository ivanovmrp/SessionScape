import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SessionScape | Design better massage experiences",
  description: "A professional session-design workspace for massage therapists."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

