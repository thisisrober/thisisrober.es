import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { FaEnvelope, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import BlogNav from '../../components/blog/BlogNav';
import BlogFooter from '../../components/blog/BlogFooter';

export default function UnsubscribePage() {
  const { t, lang } = useTranslation();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/blog/unsubscribe', { email, lang });
      setResult(res.data);
      if (res.data.success) setEmail('');
    } catch {
      setResult({ success: false, message: lang === 'es' ? 'Error al procesar la solicitud' : 'Error processing request' });
    }
    setLoading(false);
  };

  return (
    <>
      <BlogNav />
      <div className="blog-unsubscribe-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <Container style={{ maxWidth: 480 }}>
          <div style={{
            background: 'var(--blog-card-bg, #fff)',
            borderRadius: 16,
            padding: '2.5rem 2rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}>
            <FaEnvelope size={32} style={{ color: '#6366f1', marginBottom: '1rem' }} />
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
              {lang === 'es' ? 'Darse de baja' : 'Unsubscribe'}
            </h2>
            <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {lang === 'es'
                ? 'Introduce tu email para cancelar la suscripción a la newsletter.'
                : 'Enter your email to unsubscribe from the newsletter.'}
            </p>

            {result && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 8,
                marginBottom: '1rem',
                background: result.success ? '#f0fdf4' : '#fef2f2',
                color: result.success ? '#16a34a' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center',
                fontSize: '0.9rem',
              }}>
                {result.success ? <FaCheckCircle /> : <FaTimesCircle />}
                {result.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  border: 'none',
                  background: '#6366f1',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? (lang === 'es' ? 'Procesando...' : 'Processing...')
                  : (lang === 'es' ? 'Darme de baja' : 'Unsubscribe')}
              </button>
            </form>
          </div>
        </Container>
      </div>
      <BlogFooter />
    </>
  );
}
