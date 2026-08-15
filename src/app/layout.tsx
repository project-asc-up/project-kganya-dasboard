import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { deploymentConfig } from "@/lib/deployment-config";
import { ChatwootWidget } from "@/components/chatwoot-widget";
import { ThemeProvider } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Academic Success Coaches Admin",
  description:
    "University of Pretoria Academic Success Coach content administration workspace",
};

// Validate deployment environment
deploymentConfig.validateDeployment();

// Pre-hydration theme script — strictly forces light mode always.
const themeScript = `
  (function () {
    try {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
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
        <ClerkProvider
          localization={{
            signIn: {
              start: {
                title: "Sign in to our admin workspace",
              },
            },
          }}
        >
          <ThemeProvider>
            {children}
            <ChatwootWidget />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
