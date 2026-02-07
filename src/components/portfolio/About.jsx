import { useState, useEffect } from 'react';
import { Container, Row, Col, Dropdown } from 'react-bootstrap';
import { FaFileAlt, FaEnvelopeOpen } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

export default function About() {
  const { t, lang } = useTranslation();
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    api.get('/blog/settings/public').then(r => {
      if (r.data && typeof r.data === 'object') setSiteSettings(r.data);
    }).catch(() => {});
  }, []);

  const aboutText = siteSettings?.[`about_text_${lang}`] || t.about_p1;

  return (
    <section id="about" className="section">
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={5} className="text-center order-lg-2 reveal-right">
            <img src="/img/profile-picture.png" alt="Robert Lita" className="about-image img-fluid" />
          </Col>
          <Col lg={7} className="order-lg-1 reveal-left">
            <p className="section-label">{t.nav_about}</p>
            <div className="about-text">
              {aboutText.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="about-cta">
              <Dropdown>
                <Dropdown.Toggle className="btn-accent"><FaFileAlt size={14} className="me-1" /> {t.about_cta_cv}</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/cv-es.pdf" target="_blank">Español</Dropdown.Item>
                  <Dropdown.Item href="/cv-eng.pdf" target="_blank">English</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown>
                <Dropdown.Toggle className="btn-ghost"><FaEnvelopeOpen size={14} className="me-1" /> {t.about_cta_cover}</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/presentacion.pdf" target="_blank">Español</Dropdown.Item>
                  <Dropdown.Item href="/presentation.pdf" target="_blank">English</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
