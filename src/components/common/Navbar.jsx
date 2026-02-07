import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Nav as BsNav, Navbar as BsNavbar } from 'react-bootstrap';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../context/ThemeContext';

const SECTIONS = ['projects', 'tech', 'experience', 'about', 'contact'];

export default function Navbar() {
  const { t, lang, setLang } = useTranslation();
  const { dark, toggleTheme } = useTheme();
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const offset = 120;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i]);
        if (el && el.getBoundingClientRect().top <= offset) {
          setActive(SECTIONS[i]);
          return;
        }
      }
      setActive('');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!expanded) return;
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [expanded]);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    setExpanded(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'projects', label: t.nav_projects },
    { id: 'experience', label: t.nav_experience },
    { id: 'about', label: t.nav_about },
    { id: 'contact', label: t.nav_contact || 'Get in Touch' },
  ];

  return (
    <BsNavbar
      ref={navRef}
      fixed="top"
      className={`portfolio-nav ${scrolled ? 'nav-scrolled' : ''}`}
      expand="md"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <BsNavbar.Brand href="#" onClick={scrollTo('home')}>
          <img src="/img/logo.png" alt="thisisrober" className="nav-logo-img" />
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <BsNav className="mx-auto">
            {navItems.map(item => (
              <BsNav.Link
                key={item.id}
                onClick={scrollTo(item.id)}
                className={active === item.id ? 'nav-active' : ''}
              >
                {item.label}
              </BsNav.Link>
            ))}
            <BsNav.Link href="/blog" onClick={() => setExpanded(false)}>{t.nav_blog}</BsNav.Link>
          </BsNav>
          <div className="nav-controls-pill">
            <button className="nav-pill-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <FaSun size={13} /> : <FaMoon size={13} />}
            </button>
            <span className="nav-pill-sep" />
            <button className={`nav-pill-lang ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`nav-pill-lang ${lang === 'es' ? 'active' : ''}`} onClick={() => setLang('es')}>ES</button>
          </div>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
