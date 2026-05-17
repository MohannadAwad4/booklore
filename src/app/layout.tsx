import type { Metadata } from "next";
import { BRAND_NAME } from "@/components/brand-wordmark";
import { GetUserSession } from "@/app/api/auth/core/session";
import NavigationHeader from "@/components/nav_header";
import NavigationHeaderGate from "@/components/NavigationHeaderGate";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { SessionUserProvider } from "@/components/providers/SessionUserProvider";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: `Read, write, and discover stories on ${BRAND_NAME}.`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await GetUserSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <SessionUserProvider user={user}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthModalProvider>
              <NavigationHeaderGate>
                <NavigationHeader />
              </NavigationHeaderGate>
              {children}
              <Toaster />
            </AuthModalProvider>
          </ThemeProvider>
        </SessionUserProvider>
      </body>
    </html>
  );
}
