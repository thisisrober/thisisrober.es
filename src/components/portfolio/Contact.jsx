import { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaGithub, FaLinkedin } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import { useSocialLinks, getSocialIcon } from '../../hooks/useSocialLinks';
import api from '../../services/api';

export default function Contact() {
  const { t, lang } = useTranslation();
  const socialLinks = useSocialLinks();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const honeypotRef = useRef(null);
  const timestampRef = useRef(Date.now());
  const recaptchaRef = useRef(null);
  const recaptchaWidgetId = useRef(null);

  // Render reCAPTCHA widget once the script is loaded
  useEffect(() => {
    const renderCaptcha = () => {
      if (recaptchaRef.current && window.grecaptcha && window.grecaptcha.render && recaptchaWidgetId.current === null) {
        recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: '6LeTK2QsAAAAAJliMrKL655o5t4HQNeC1S0aEXBK',
          theme: 'dark',
        });
      }
    };
    // If grecaptcha is already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
      renderCaptcha();
    } else {
      // Wait for the script to load
      const interval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          renderCaptcha();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    api.get('/blog/settings/public').then(r => {
      if (r.data && typeof r.data === 'object') setSiteSettings(r.data);
    }).catch(() => {});
  }, []);

  const contactEmail = siteSettings?.contact_email || 'contacto@thisisrober.es';
  const contactLocation = siteSettings?.[`contact_location_${lang}`] || t.contact_location;
  const availabilityText = siteSettings?.[`availability_text_${lang}`] || t.contact_status;
  const statusColorMap = { available: '#22c55e', busy: '#f59e0b', not_available: '#6b7280' };
  const statusColor = statusColorMap[siteSettings?.availability_status] || '#22c55e';

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Honeypot check
    if (honeypotRef.current && honeypotRef.current.value) return;
    // Time check — reject if submitted in less than 2 seconds
    if (Date.now() - timestampRef.current < 2000) return;

    // reCAPTCHA validation
    const recaptchaToken = window.grecaptcha ? window.grecaptcha.getResponse(recaptchaWidgetId.current) : '';
    if (!recaptchaToken) {
      setResult({ success: false, message: t.form_captcha_error });
      return;
    }

    setSending(true);
    setResult(null);
    try {
      const res = await api.post('/contact', {
        ...form,
        lang,
        _ts: timestampRef.current,
        recaptchaToken,
      });
      setResult(res.data);
      if (res.data.success) {
        setForm({ name: '', email: '', message: '' });
        timestampRef.current = Date.now();
        if (window.grecaptcha) window.grecaptcha.reset(recaptchaWidgetId.current);
      }
    } catch {
      setResult({ success: false, message: t.form_error });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="contact-glow contact-glow-1" />
      <div className="contact-glow contact-glow-2" />
      <Container>
        <div className="text-center mb-5">
          <p className="section-label mx-auto">{t.contact_title}</p>
        </div>

        <Row className="g-4 g-lg-5 align-items-stretch">
          <Col lg={5}>
            <div className="contact-info-card">
              <h3 className="contact-info-heading">{t.contact_lets_talk}</h3>
              <p className="contact-info-text">{t.contact_subtitle}</p>

              <div className="contact-info-items">
                <div className="contact-info-item">
                  <div className="contact-info-icon"><FaEnvelope size={16} /></div>
                  <div>
                    <span className="contact-info-label">{t.form_email}</span>
                    <a href={`mailto:${contactEmail}`} className="contact-info-value">{contactEmail}</a>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon"><FaMapMarkerAlt size={16} /></div>
                  <div>
                    <span className="contact-info-label">{t.contact_location_label}</span>
                    <span className="contact-info-value">{contactLocation}</span>
                  </div>
                </div>
              </div>

              <div className="contact-socials">
                {socialLinks.length > 0 ? socialLinks.map((link, i) => {
                  const Icon = getSocialIcon(link.platform);
                  const href = link.platform === 'email' ? `mailto:${link.url}` : link.url;
                  const isExternal = link.platform !== 'email';
                  return (
                    <a key={i} href={href} {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})} className="contact-social-link" title={link.platform}>
                      <Icon size={18} />
                    </a>
                  );
                }) : (
                  <>
                    <a href="https://github.com/thisisrober" target="_blank" rel="noreferrer" className="contact-social-link" title="GitHub"><FaGithub size={18} /></a>
                    <a href="https://linkedin.com/in/thisisrober" target="_blank" rel="noreferrer" className="contact-social-link" title="LinkedIn"><FaLinkedin size={18} /></a>
                    <a href={`mailto:${contactEmail}`} className="contact-social-link" title="Email"><FaEnvelope size={18} /></a>
                  </>
                )}
              </div>

              <div className="contact-status">
                <span className="status-dot" style={{ background: statusColor }} />
                <span>{availabilityText}</span>
              </div>
            </div>
          </Col>

          <Col lg={7}>
            {result && (
              <Alert variant={result.success ? 'success' : 'danger'} dismissible onClose={() => setResult(null)}>
                {result.message}
              </Alert>
            )}
            <div className="contact-form-box">
              <Form onSubmit={handleSubmit}>
                {/* Honeypot — invisible to humans */}
                <input
                  type="text"
                  name="website"
                  ref={honeypotRef}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0, overflow: 'hidden' }}
                />
                <Row className="g-3">
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label>{t.form_name}</Form.Label>
                      <Form.Control
                        type="text" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder={t.form_name_placeholder}
                        required maxLength={100}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label>{t.form_email}</Form.Label>
                      <Form.Control
                        type="email" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder={t.form_email_placeholder}
                        required maxLength={200}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mt-3">
                  <Form.Label>{t.form_message}</Form.Label>
                  <Form.Control
                    as="textarea" rows={5} value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder={t.form_message_placeholder}
                    style={{ resize: 'none' }}
                    required maxLength={5000}
                  />
                </Form.Group>
                <div className="form-captcha mt-3">
                  <div ref={recaptchaRef} />
                </div>
                <div className="mt-4">
                  <Button type="submit" className="btn-accent d-inline-flex align-items-center justify-content-center gap-2" disabled={sending}>
                    <FaPaperPlane size={14} />
                    {sending ? t.form_sending : t.form_button}
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
