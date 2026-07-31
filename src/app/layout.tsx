import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Yard: Rags to Riches",
  description: "A horse-racing trainer sim — from the bottom box to a Group 1.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
