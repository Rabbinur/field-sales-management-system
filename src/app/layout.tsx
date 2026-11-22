import type { Metadata, Viewport } from "next";
import StoreProvider from "@/store/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Field Sales Management System",
    template: "%s | Field Sales Pro",
  },
  description:
    "Enterprise multi-dealership field sales, route beats, and dispatch operations platform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
