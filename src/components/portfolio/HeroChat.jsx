import { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageSquare, FiX } from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

const SUGGESTIONS_EN = [
  'What technologies does Robert use?',
  'Tell me about his experience',
  'What projects has he built?',
];
const SUGGESTIONS_ES = [
  '¿Qué tecnologías usa Robert?',
  'Cuéntame sobre su experiencia',
  '¿Qué proyectos ha hecho?',
];

export function ChatTrigger({ onClick, lang }) {
  return (
    <div className="hero-chat-trigger-wrapper">
      <span className="hero-chat-new-badge">NEW</span>
      <button className="hero-chat-trigger" onClick={onClick}>
        <FiMessageSquare size={16} />
        <span>{lang === 'es' ? 'Pregúntale a NOVA sobre mí' : 'Ask NOVA about me'}</span>
      </button>
    </div>
  );
}

export default function HeroChat({ onClose }) {
  const { t, lang } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = lang === 'es' ? SUGGESTIONS_ES : SUGGESTIONS_EN;

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Reset chat when language changes
  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [lang]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/ai/chat', { message: msg, lang, history });

      if (res.data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      } else if (res.data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠ ${res.data.error}`, isError: true }]);
      }
    } catch {
      const errorMsg = lang === 'es'
        ? '⚠ No se pudo conectar con la IA. Inténtalo de nuevo.'
        : '⚠ Could not connect to AI. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const placeholder = lang === 'es'
    ? 'Pregúntame sobre Robert...'
    : 'Ask me about Robert...';

  const titleText = 'NOVA';
  const subtitleText = lang === 'es'
    ? 'Pregunta lo que quieras sobre mí'
    : 'Ask anything about me';

  const handleClose = () => {
    setClosing(true);
  };

  const handleAnimationEnd = (e) => {
    if (e.animationName === 'chatSlideOut') {
      setClosing(false);
      if (onClose) onClose();
    }
  };

  return (
    <div className={`hero-chat${closing ? ' hero-chat-closing' : ''}`} onAnimationEnd={handleAnimationEnd}>
      <div className="hero-chat-header">
        <div className="hero-chat-header-info">
          <div className="hero-chat-header-dot" />
          <div>
            <span className="hero-chat-header-title">{titleText}</span>
            <span className="hero-chat-header-sub">{subtitleText}</span>
          </div>
        </div>
        <button className="hero-chat-close" onClick={handleClose} aria-label="Close chat">
          <FiX size={16} />
        </button>
      </div>

      <div className="hero-chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 && (
          <div className="hero-chat-empty">
            <p className="hero-chat-empty-text">
              {lang === 'es'
                ? '¡Hola! Soy NOVA, el asistente de Robert. Puedo contarte sobre su experiencia, proyectos y habilidades.'
                : "Hi! I'm NOVA, Robert's assistant. I can tell you about his experience, projects, and skills."}
            </p>
            <div className="hero-chat-suggestions">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="hero-chat-suggestion"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`hero-chat-msg hero-chat-msg-${msg.role}${msg.isError ? ' hero-chat-msg-error' : ''}`}>
            {msg.role === 'assistant' && <div className="hero-chat-msg-avatar">N</div>}
            <div className="hero-chat-msg-bubble">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="hero-chat-msg hero-chat-msg-assistant">
            <div className="hero-chat-msg-avatar">N</div>
            <div className="hero-chat-msg-bubble hero-chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      <form className="hero-chat-input-row" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
        <input
          ref={inputRef}
          type="text"
          className="hero-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={500}
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          className="hero-chat-send"
          disabled={!input.trim() || loading}
          aria-label="Send"
        >
          <FiSend size={15} />
        </button>
      </form>
    </div>
  );
}
