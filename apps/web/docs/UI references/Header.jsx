import { useState, useEffect } from "react";
import LogoComponent from "../../src/components/ReactApp/components/ui/Logo";

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-sm font-medium text-gray-500 px-3 py-1.5 rounded-lg hover:text-black hover:bg-gray-100 transition-all duration-150"
  >
    {children}
  </a>
);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center border-b border-black/[0.06] bg-white/90 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.07)]" : ""
      }`}
    >
      <div className="max-w-[1160px] mx-auto px-8 w-full flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <LogoComponent size="md" textColor="text-black" showText={true} />
        </a>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          <NavLink href="#features">Fonctionnalités</NavLink>
          <NavLink href="#pipeline">Comment ça marche</NavLink>
          <NavLink href="#pricing">Tarifs</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a href="#" className="text-[13.5px] font-medium text-gray-800 px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-150">
            Se connecter
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white bg-black px-4 py-2 rounded-xl hover:bg-gray-800 hover:-translate-y-px hover:shadow-md transition-all duration-200"
          >
            Essai gratuit
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
