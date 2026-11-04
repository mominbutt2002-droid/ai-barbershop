import { Manrope, Oswald } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const display = Oswald({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const themeBoot = `
(function () {
  try {
    var saved = localStorage.getItem("kromka-theme");
    var theme = saved === "light" || saved === "dark"
      ? saved
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export const metadata = {
  title: {
    default: "Кромка — барбершоп в Казани",
    template: "%s — Кромка",
  },
  description:
    "Запись на стрижку, фейд и бороду в барбершопе Кромка. Казань, ул. Баумана, 17.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <body>
        <Script id="kromka-theme" strategy="beforeInteractive">
          {themeBoot}
        </Script>
        {children}
      </body>
    </html>
  );
}
