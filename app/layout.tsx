import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muhammad Ahmad | .NET Full Stack Developer",
  description:
    "Muhammad Ahmad’s portfolio: ASP.NET Core APIs, Angular applications, and full-stack projects. Based in Faisalabad, Pakistan.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
