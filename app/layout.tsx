import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastContainer } from "@/components/ui/ToastContainer";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LLM Arena — Benchmark Every Model, Side by Side",
  description:
    "Fire the same prompt at multiple LLMs simultaneously. Compare speed, quality, and tool-calling in real time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`dark ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-flash: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = localStorage.getItem("ia-store");
                var t = s ? JSON.parse(s)?.state?.theme : null;
                if (!t) t = "dark";
                document.documentElement.setAttribute("data-theme", t);
                if (t === "dark") {
                  document.documentElement.classList.add("dark");
                  document.documentElement.classList.remove("light");
                } else {
                  document.documentElement.classList.add("light");
                  document.documentElement.classList.remove("dark");
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}