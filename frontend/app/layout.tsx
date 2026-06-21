import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeChat · 情绪同频的匿名房间",
  description: "输入此刻心情，AI 解析情绪色彩，把你送进一间情绪同频的匿名房间。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
