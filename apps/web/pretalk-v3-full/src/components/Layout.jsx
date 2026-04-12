import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { ScrollProgress } from "./ui";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [pathname]);
  return null;
}

export default function Layout({ children }) {
  return (
    <>
      <ScrollProgress/>
      <ScrollTop/>
      <Header/>
      <main className="pt-[60px]">{children}</main>
      <Footer/>
    </>
  );
}
