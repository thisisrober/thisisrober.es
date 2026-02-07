import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import NewsletterForm from '../common/NewsletterForm';
import { useTranslation } from '../../hooks/useTranslation';
import { useSocialLinks, getSocialIcon } from '../../hooks/useSocialLinks';

export default function BlogFooter() {
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
    <footer className="blog-footer">
      <div className="container">
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
              <Link to="/blog">Blog</Link>
              <Link to="/">Portfolio</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">{t.footer_copyright}</p>
        </div>
      </div>
    </footer>
  );
}
