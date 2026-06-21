import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "航海家计划",
  description: "JSSHMZX - 航海家计划",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-[#f5f5f7] font-sans antialiased">{children}</body>
    </html>
  );
}
