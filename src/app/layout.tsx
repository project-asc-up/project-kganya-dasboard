import type { Metadata } from "next";
import "./globals.css";
import { deploymentConfig } from "@/lib/deployment-config";
import { ThemeProvider } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Academic Success Coaches Admin",
  description:
    "University of Pretoria Academic Success Coach content administration workspace",
};

// Validate deployment environment
deploymentConfig.validateDeployment();

// Pre-hydration dark mode script — avoids the flash of wrong theme.
const themeScript = `
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var theme = stored || (prefersDark ? "dark" : "light");
      if (theme === "dark") document.documentElement.classList.add("dark");
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-surface)] text-[var(--color-text)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
