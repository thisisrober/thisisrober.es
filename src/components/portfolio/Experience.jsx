import { useEffect, useState, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

const INITIAL_SHOW = 3;

function AnimatedList({ items, show, renderItem }) {
  const innerRef = useRef(null);
  const [height, setHeight] = useState('auto');
  const prevShow = useRef(show);

  useEffect(() => {
    if (!innerRef.current) return;
    // Measure height of shown items
    const children = Array.from(innerRef.current.children);
    let h = 0;
    const count = show ? items.length : Math.min(INITIAL_SHOW, items.length);
    for (let i = 0; i < count && i < children.length; i++) {
      h += children[i].offsetHeight + (i < count - 1 ? 0 : 0);
      // Include margin
      const style = window.getComputedStyle(children[i]);
      h += parseFloat(style.marginBottom) || 0;
    }
    setHeight(h + 'px');
    prevShow.current = show;
  }, [show, items]);

  return (
    <div style={{ overflow: 'hidden', transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)', height }}>
      <div ref={innerRef}>
        {items.map((item, i) => renderItem(item, i))}
      </div>
    </div>
  );
}

export default function Experience() {
  const { t, lang } = useTranslation();
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [showAllExp, setShowAllExp] = useState(false);
  const [showAllCerts, setShowAllCerts] = useState(false);

  useEffect(() => {
    api.get('/portfolio/experience').then(r => setExperience(r.data));
    api.get('/portfolio/certifications').then(r => setCertifications(r.data));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return t.present;
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <section id="experience" className="section">
      <Container>
        <div className="text-center mb-5 reveal">
          <p className="section-label mx-auto">{t.nav_experience}</p>
        </div>
        <Row className="g-5">
          <Col lg={6} className="reveal-left">
            <h3 className="subsection-title">{t.work_experience_title}</h3>
            <div className="timeline">
              <AnimatedList items={experience} show={showAllExp} renderItem={(item) => (
                <div className="timeline-item" key={item.id}>
                  <div className="d-flex justify-content-between flex-wrap gap-2 mb-1">
                    <div>
                      <h4 className="timeline-title">{lang === 'es' ? item.position_es : item.position_en}</h4>
                      <p className="timeline-company">{lang === 'es' ? item.company_es : item.company_en}</p>
                    </div>
                    <span className="timeline-date">
                      {formatDate(item.start_date)} – {formatDate(item.end_date)}
                    </span>
                  </div>
                  {(item.description_es || item.description_en) && (
                    <p className="timeline-description">
                      {lang === 'es' ? item.description_es : item.description_en}
                    </p>
                  )}
                </div>
              )} />
            </div>
            {experience.length > INITIAL_SHOW && (
              <button className="show-more-btn" onClick={() => setShowAllExp(!showAllExp)}>
                {showAllExp ? (
                  <>{t.show_less || 'Ver menos'} <FaChevronUp size={12} /></>
                ) : (
                  <>{t.show_more || 'Ver más'} ({experience.length - INITIAL_SHOW}) <FaChevronDown size={12} /></>
                )}
              </button>
            )}
          </Col>
          <Col lg={6} className="reveal-right">
            <h3 className="subsection-title">{t.certs_title}</h3>
            <div className="timeline">
              <AnimatedList items={certifications} show={showAllCerts} renderItem={(item) => (
                <div className="timeline-item" key={item.id}>
                  <div className="d-flex justify-content-between flex-wrap gap-2 mb-1">
                    <div>
                      <h4 className="timeline-title">
                        <a href={item.credential_url} target="_blank" rel="noreferrer">
                          {lang === 'es' ? item.title_es : item.title_en}
                        </a>
                      </h4>
                      <p className="timeline-company">{lang === 'es' ? item.provider_es : item.provider_en}</p>
                    </div>
                    <span className="timeline-date">{formatDate(item.issue_date)}</span>
                  </div>
                </div>
              )} />
            </div>
            {certifications.length > INITIAL_SHOW && (
              <button className="show-more-btn" onClick={() => setShowAllCerts(!showAllCerts)}>
                {showAllCerts ? (
                  <>{t.show_less || 'Ver menos'} <FaChevronUp size={12} /></>
                ) : (
                  <>{t.show_more || 'Ver más'} ({certifications.length - INITIAL_SHOW}) <FaChevronDown size={12} /></>
                )}
              </button>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
}
