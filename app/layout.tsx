import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
    <ClerkProvider>
      <html lang="en">
        <body className="bg-[#0f0f0f] text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
