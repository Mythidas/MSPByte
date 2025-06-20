import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MSPByte",
  description: "SaaS delivering asset tracking to MSPs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="h-screen w-screen flex flex-col items-center justify-center">
            {children}
          </main>
          <Toaster position='top-center' />
          <div id="search-portal" className="fixed top-0 flex flex-col z-[999] w-screen h-screen pointer-events-none" />
        </ThemeProvider>
      </body>
    </html>
  );
}
