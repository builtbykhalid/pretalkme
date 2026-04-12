import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import FAQContact from "./pages/FAQContact";
import Blog from "./pages/Blog";
import CaseStudy from "./pages/CaseStudy";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/fonctionnalites" element={<Features/>}/>
          <Route path="/comment-ca-marche" element={<HowItWorks/>}/>
          <Route path="/tarifs" element={<Pricing/>}/>
          <Route path="/faq" element={<FAQContact/>}/>
          <Route path="/contact" element={<FAQContact/>}/>
          <Route path="/blog" element={<Blog/>}/>
          <Route path="/blog/:slug" element={<CaseStudy/>}/>
          <Route path="*" element={<Home/>}/>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
