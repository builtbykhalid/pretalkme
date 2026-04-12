import Header from "./components/Header";
import Hero from "./components/Hero";
import ProofBar from "./components/ProofBar";
import Personas from "./components/Personas";
import Features from "./components/Features";
import { Pipeline, Testimonials, Pricing, FAQ, CTA } from "./components/Sections";
import Footer from "./components/Footer";
import ScrollProgress from "./components/ScrollProgress";

export default function App() {
  return (
    <div className="font-['Inter',_-apple-system,_sans-serif] text-black bg-white">
      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* Fixed header */}
      <Header />

      {/* Page sections */}
      <main>
        <Hero />
        <ProofBar />
        <Personas />
        <Features />
        <Pipeline />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
