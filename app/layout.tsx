import type { Metadata } from "next";
import "./globals.css";
// import Providers from "./providers";
import ReduxProvider from "@/providers/ReduxProvider";
export const metadata: Metadata = {
  title: "My App",
  description: "Ecommerce app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
        {children}
        </ReduxProvider>
      </body>
    </html>
  );
}