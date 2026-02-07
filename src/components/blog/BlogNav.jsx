import { Link } from 'react-router-dom';
import { Container, Nav as BsNav, Navbar as BsNavbar } from 'react-bootstrap';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../context/ThemeContext';

export default function BlogNav() {
  const { t, lang, setLang } = useTranslation();
  const { dark, toggleTheme } = useTheme();

  return (
    <BsNavbar sticky="top" className="portfolio-nav" expand="md">
      <Container>
        <BsNavbar.Brand as={Link} to="/blog">
          <img src="/img/logo.png" alt="thisisrober" height="22" />
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="blog-nav" />
        <BsNavbar.Collapse id="blog-nav">
          <BsNav className="mx-auto">
            <BsNav.Link as={Link} to="/">Portfolio</BsNav.Link>
            <BsNav.Link as={Link} to="/blog">{t.nav_blog}</BsNav.Link>
          </BsNav>
          <div className="nav-controls">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <FaSun size={14} /> : <FaMoon size={14} />}
            </button>
            <div className="lang-switcher">
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
              <button className={`lang-btn ${lang === 'es' ? 'active' : ''}`} onClick={() => setLang('es')}>ES</button>
            </div>
          </div>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
