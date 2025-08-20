import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { AuthButtons } from "@/components/auth/AuthButtons";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance Tracker - Gestión Financiera Personal",
  description: "Aplicación completa para el seguimiento de finanzas personales, deudas y presupuestos",
  keywords: ["finanzas", "presupuesto", "deudas", "gastos", "ingresos"],
  authors: [{ name: "Finance Tracker Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <header className="fixed top-0 right-0 z-50 p-4">
            {/* <SignedOut>
              <AuthButtons />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn> */}
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}