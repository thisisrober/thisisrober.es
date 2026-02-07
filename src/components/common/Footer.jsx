import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import { useSocialLinks, getSocialIcon } from '../../hooks/useSocialLinks';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  const { t } = useTranslation();
  const socialLinks = useSocialLinks();

  const renderSocials = () => {
    if (socialLinks.length > 0) {
      return socialLinks.map((link, i) => {
        const Icon = getSocialIcon(link.platform);
        const href = link.platform === 'email' ? `mailto:${link.url}` : link.url;
        const isExternal = link.platform !== 'email';
        return (
          <a key={i} href={href} {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})} title={link.platform}>
            <Icon size={16} />
          </a>
        );
      });
    }
    return (
      <>
        <a href="https://github.com/thisisrober" target="_blank" rel="noreferrer" title="GitHub"><FaGithub size={16} /></a>
        <a href="https://linkedin.com/in/thisisrober" target="_blank" rel="noreferrer" title="LinkedIn"><FaLinkedin size={16} /></a>
        <a href="mailto:contacto@thisisrober.es" title="Email"><FaEnvelope size={16} /></a>
      </>
    );
  };

  return (
    <footer className="portfolio-footer">
      <Container>
        <div className="footer-content">
          <div className="footer-left">
            <h5>{t.newsletter_title}</h5>
            <NewsletterForm />
            <div className="footer-socials">
              {renderSocials()}
            </div>
          </div>
          <div className="footer-right">
            <div className="footer-links">
              <a href="#projects">{t.nav_projects}</a>
              <a href="#experience">{t.nav_experience}</a>
              <a href="#about">{t.nav_about}</a>
              <Link to="/blog">{t.nav_blog}</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">© {new Date().getFullYear()} made by thisisrober with ❤️</p>
        </div>
      </Container>
    </footer>
  );
}
