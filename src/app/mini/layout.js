import Script from "next/script";

export const metadata = { title: "Запись" };

export default function MiniLayout({ children }) {
  return (
    <div className="tma-shell">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      {children}
    </div>
  );
}
