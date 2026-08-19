import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "Coin Flip Arena",
  description: "Coin Flip Arena powered by Unicity Sphere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
