import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weavy Clone",
  description: "A clone of Weavy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0f0f0f] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
