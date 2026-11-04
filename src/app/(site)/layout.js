import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function SiteLayout({ children }) {
  return (
    <>
      <a className="skip" href="#content">
        К содержанию
      </a>
      <Header />
      <div id="content">{children}</div>
      <Footer />
    </>
  );
}
