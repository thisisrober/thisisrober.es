import { useState, useEffect, useRef } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import { useSocialLinks, getSocialIcon } from '../../hooks/useSocialLinks';
import api from '../../services/api';

export default function Hero() {
  const { t, lang } = useTranslation();
  const socialLinks = useSocialLinks();
  const [typedText, setTypedText] = useState('');
  const [siteSettings, setSiteSettings] = useState(null);
  const textIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const timerRef = useRef(null);
  const heroRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    api.get('/blog/settings/public').then(r => {
      if (r.data && typeof r.data === 'object') setSiteSettings(r.data);
    }).catch(() => {});
  }, []);

  const heroName = siteSettings?.hero_name || 'Robert Lita';
  const heroGreeting = siteSettings?.[`hero_greeting_${lang}`] || t.hero_greeting;

  // Reset typing state when language changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    textIndex.current = 0;
    charIndex.current = 0;
    isDeleting.current = false;
    setTypedText('');
  }, [lang]);

  useEffect(() => {
    const texts = t.animated_texts;
    if (!texts || texts.length === 0) return;

    const tick = () => {
      const current = texts[textIndex.current % texts.length];
      if (!current) return;

      if (isDeleting.current) {
        charIndex.current--;
        setTypedText(current.substring(0, charIndex.current));
        if (charIndex.current === 0) {
          isDeleting.current = false;
          textIndex.current = (textIndex.current + 1) % texts.length;
          timerRef.current = setTimeout(tick, 400);
          return;
        }
        timerRef.current = setTimeout(tick, 40);
      } else {
        charIndex.current++;
        setTypedText(current.substring(0, charIndex.current));
        if (charIndex.current === current.length) {
          isDeleting.current = true;
          timerRef.current = setTimeout(tick, 2000);
          return;
        }
        timerRef.current = setTimeout(tick, 80);
      }
    };

    timerRef.current = setTimeout(tick, 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [t.animated_texts, lang]);

  // Stranger Things scroll-driven zoom effect
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current || !nameRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.5)));
      const scale = 1 + progress * 4;
      const nameOpacity = Math.max(0, 1 - progress * 1.5);
      const restOpacity = Math.max(0, 1 - progress * 2.5);
      nameRef.current.style.transform = `scale(${scale})`;
      nameRef.current.style.opacity = nameOpacity;
      // Fade out all other hero elements
      const content = heroRef.current.querySelector('.hero-content');
      if (content) {
        content.querySelectorAll('.hero-label, .hero-typed, .hero-socials').forEach(el => {
          el.style.opacity = restOpacity;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="home" className="hero-section" ref={heroRef}>
      <div className="hero-content text-center">
        <p className="hero-label">&gt; {heroGreeting}</p>
        <h1 className="hero-name" ref={nameRef}>{heroName}</h1>
        <p className="hero-typed">
          <span className="typed-text">{typedText}</span>
          <span className="typed-cursor">|</span>
        </p>
        <div className="hero-socials justify-content-center">
          {socialLinks.length > 0 ? socialLinks.map((link, i) => {
            const Icon = getSocialIcon(link.platform);
            const href = link.platform === 'email' ? `mailto:${link.url}` : link.url;
            const isExternal = link.platform !== 'email';
            return (
              <a key={i} href={href} {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})} className="social-link" title={link.platform}>
                <Icon size={18} />
              </a>
            );
          }) : (
            <>
              <a href="https://github.com/thisisrober" target="_blank" rel="noreferrer" className="social-link" title="GitHub"><FaGithub size={18} /></a>
              <a href="https://linkedin.com/in/thisisrober" target="_blank" rel="noreferrer" className="social-link" title="LinkedIn"><FaLinkedin size={18} /></a>
              <a href="mailto:contacto@thisisrober.es" className="social-link" title="Email"><FaEnvelope size={18} /></a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
