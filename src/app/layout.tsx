import type { Metadata } from "next";
import { overusedGrotesk } from "@/app/fonts";
import "./globals.css";


export const metadata: Metadata = {
  title: "3D Editor",
  description: "Real-time 3D model viewer and configurator",
  icons: {
    icon: "/releases/3d-editor/Jades_Stone.png",
    shortcut: "/releases/3d-editor/Jades_Stone.png",
    apple: "/releases/3d-editor/Jades_Stone.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${overusedGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
