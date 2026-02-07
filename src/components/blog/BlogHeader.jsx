import { Link } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../context/ThemeContext';

export default function BlogHeader() {
  const { lang, setLang } = useTranslation();
  const { dark, toggleTheme } = useTheme();

  return (
    <header className="blog-header">
      <div className="blog-header-pill blog-header-left">
        <Link to="/blog" className="blog-header-logo">
          thisisrober<span>.blog</span>
        </Link>
      </div>

      <div className="blog-header-pill blog-header-controls">
        <button className="blog-header-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? <FaSun size={13} /> : <FaMoon size={13} />}
        </button>
        <span className="blog-header-sep" />
        <button className={`blog-header-lang ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
        <button className={`blog-header-lang ${lang === 'es' ? 'active' : ''}`} onClick={() => setLang('es')}>ES</button>
      </div>
    </header>
  );
}
