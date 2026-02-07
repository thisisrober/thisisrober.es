import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Hero from '../components/portfolio/Hero';
import About from '../components/portfolio/About';
import TechStack from '../components/portfolio/TechStack';
import Experience from '../components/portfolio/Experience';
import Projects from '../components/portfolio/Projects';
import Contact from '../components/portfolio/Contact';
import Footer from '../components/common/Footer';
import { FaArrowUp } from 'react-icons/fa';

export default function PortfolioPage() {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => { document.title = 'thisisrober - Portfolio'; }, []);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-reveal observer — watches for new .reveal elements too
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
    const observeAll = () => document.querySelectorAll(selector).forEach(el => {
      if (!el.classList.contains('visible')) io.observe(el);
    });

    observeAll();

    // Re-observe when DOM changes (async data loads)
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <TechStack />
        <Experience />
        <About />
        <Contact />
      </main>
      <Footer />

      <button
        className={`scroll-top-btn ${showScroll ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </button>
    </>
  );
}
