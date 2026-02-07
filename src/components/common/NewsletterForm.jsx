import { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useTranslation } from '../../hooks/useTranslation';
import NewsletterModal from './NewsletterModal';
import api from '../../services/api';

export default function NewsletterForm() {
  const { t, lang } = useTranslation();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [modal, setModal] = useState({ show: false, success: false, title: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await api.post('/blog/subscribe', { email, lang });
      setModal({
        show: true,
        success: res.data.success,
        title: res.data.message,
        text: res.data.success ? t.newsletter_success_sub : '',
      });
      if (res.data.success) setEmail('');
    } catch {
      setModal({ show: true, success: false, title: t.newsletter_error, text: '' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Form.Control
            type="email"
            placeholder={t.newsletter_placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="btn-accent" disabled={sending}>
            {sending ? t.newsletter_sending : t.newsletter_button}
          </Button>
        </InputGroup>
      </Form>
      <NewsletterModal {...modal} onClose={() => setModal({ ...modal, show: false })} />
    </>
  );
}
