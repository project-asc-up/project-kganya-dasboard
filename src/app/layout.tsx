import type { Metadata } from "next";
import "./globals.css";
import { deploymentConfig } from "@/lib/deployment-config";

export const metadata: Metadata = {
  title: "Project ASC Admin",
  description: "University of Pretoria Academic Success Coach content administration workspace",
};

// Validate deployment environment
deploymentConfig.validateDeployment();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

