import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import QueryProvider from "@/providers/QueryProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "KneeSense",
  description: "KneeSense Web Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${poppins.variable} font-sans`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <UserProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}