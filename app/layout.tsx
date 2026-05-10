import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Twitter",
  description: "A small full-stack Twitter-style app built with Next.js and Prisma.",
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
