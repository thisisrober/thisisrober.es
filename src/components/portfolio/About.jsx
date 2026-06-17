import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

export default function About() {
  const { t, lang } = useTranslation();
  const [siteSettings, setSiteSettings] = useState(null);
  const [imageSrc, setImageSrc] = useState('/img/profile-picture.png');

  useEffect(() => {
    api.get('/blog/settings/public').then(r => {
      if (r.data && typeof r.data === 'object') setSiteSettings(r.data);
    }).catch(() => {});
  }, []);

  // Force reload profile image when it changes by using a cache-busting query param
  useEffect(() => {
    let cancelled = false;
    const updateImage = async () => {
      try {
        const res = await fetch('/img/profile-picture.png', { method: 'HEAD', cache: 'no-store' });
        if (cancelled) return;
        const lm = res.headers.get('last-modified');
        const v = lm ? new Date(lm).getTime() : Date.now();
        setImageSrc(`/img/profile-picture.png?v=${v}`);
      } catch (err) {
        // ignore — keep default
      }
    };
    updateImage();
    return () => { cancelled = true; };
  }, [siteSettings]);

  const aboutText = siteSettings?.[`about_text_${lang}`] || t.about_p1;

  return (
    <section id="about" className="section">
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={5} className="text-center order-lg-2 reveal-right">
            <img src={imageSrc} alt="Robert Lita" className="about-image img-fluid" />
          </Col>
          <Col lg={7} className="order-lg-1 reveal-left">
            <p className="section-label">{t.nav_about}</p>
            <div className="about-text">
              {aboutText.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
