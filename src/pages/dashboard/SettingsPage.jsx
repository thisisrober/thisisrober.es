import { useEffect, useState, useRef } from 'react';
import { FaSave, FaGlobe, FaEnvelope, FaMapMarkerAlt, FaImage, FaFilePdf, FaUpload, FaLink, FaPlus, FaTrash, FaChevronDown, FaUser, FaCode, FaInfoCircle, FaKey, FaCheck, FaEyeSlash, FaEye } from 'react-icons/fa';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible', color: '#22c55e' },
  { value: 'busy', label: 'Ocupado', color: '#f59e0b' },
  { value: 'not_available', label: 'No disponible', color: '#6b7280' },
];

function StatusSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const current = STATUS_OPTIONS.find(o => o.value === value) || STATUS_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="status-select" ref={ref}>
      <button type="button" className="status-select-btn" onClick={() => setOpen(!open)}>
        <span className="status-select-dot" style={{ background: current.color }} />
        <span>{current.label}</span>
        <FaChevronDown size={10} className={`status-select-chevron ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="status-select-dropdown">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`status-select-option ${opt.value === value ? 'active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span className="status-select-dot" style={{ background: opt.color }} />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FileUploadField({ label, icon, accept, target, endpoint = '/admin/upload-site-asset', previewPath }) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState(previewPath || null);
  const inputRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target', target);
    try {
      const res = await api.post(endpoint, formData, true);
      if (res.data.success) {
        setMsg(`Subido: ${res.data.filename}`);
        if (file.type.startsWith('image/')) {
          setPreviewUrl(URL.createObjectURL(file));
        }
      } else setMsg('Error al subir');
    } catch { setMsg('Error de subida'); }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="dash-form-group">
      <label>{icon} {label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleUpload}
          className="dash-input"
          style={{ flex: 1 }}
        />
        {uploading && <span className="dash-spinner-sm" />}
      </div>
      {msg && <small style={{ color: 'var(--dash-accent)', marginTop: '0.25rem', display: 'block' }}>{msg}</small>}
      {previewUrl && accept?.includes('image') && (
        <div className="file-upload-preview">
          <img src={previewUrl} alt={label} />
        </div>
      )}
    </div>
  );
}

const DEFAULT_ABOUT_EN = `Full-stack developer at BASF, with previous experience in systems and networks.\n\nI currently develop web applications, focusing on creating efficient and scalable technical solutions.\n\nMy interest lies in full-stack development with a data-driven approach: code that not only works well but also leverages data to make better decisions. I am currently training in data analytics to strengthen this perspective.`;

const DEFAULT_ABOUT_ES = `Full-stack developer en BASF, con experiencia previa en sistemas y redes.\n\nActualmente desarrollo aplicaciones web, enfocado en crear soluciones técnicas eficientes y escalables.\n\nMi interés está en el desarrollo full-stack con una visión data-driven: código que no solo funcione bien, sino que también aproveche los datos para tomar mejores decisiones. Formándome en análisis de datos para reforzar esta perspectiva.`;

const DEFAULT_TECH_ITEMS = [
  { name: 'Adobe Photoshop', logo: 'adobe-photoshop-logo-1.png' },
  { name: 'AWS', logo: 'Amazon_Web_Services_Logo.svg.webp' },
  { name: 'Azure', logo: 'Microsoft_Azure_Logo.svg.png' },
  { name: 'Bash', logo: 'Bash_Logo_Colored.svg.png' },
  { name: 'Bootstrap', logo: 'Bootstrap_logo.svg.png' },
  { name: 'Cisco', logo: 'Cisco_logo.svg.png' },
  { name: 'Git', logo: 'Git_icon.svg.png' },
  { name: 'GitHub', logo: 'GitHub-Logo.png' },
  { name: 'Jupyter', logo: 'Jupyter_logo.svg.png' },
  { name: 'MySQL', logo: 'Mysql_logo.png' },
  { name: 'Oracle', logo: 'Oracle-Logo.png' },
  { name: 'PowerShell', logo: 'PowerShell_5.0_icon.png' },
  { name: 'Raspberry Pi', logo: 'Raspberry_Pi-Logo.wine.png' },
  { name: 'Terraform', logo: 'terraform-icon.png' },
  { name: 'Ubuntu', logo: 'UbuntuCoF.svg.png' },
];

const SOCIAL_PLATFORMS = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'discord', label: 'Discord' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
];

const DEFAULT_SOCIAL_LINKS = [
  { platform: 'github', url: 'https://github.com/thisisrober' },
  { platform: 'linkedin', url: 'https://linkedin.com/in/thisisrober' },
  { platform: 'email', url: 'contacto@thisisrober.es' },
];

export default function DashSettingsPage() {
  useEffect(() => { document.title = 'Dashboard | Ajustes'; }, []);

  const [settings, setSettings] = useState({
    availability_status: 'available',
    availability_text_en: 'Available for new opportunities',
    availability_text_es: 'Disponible para nuevas oportunidades',
    contact_email: 'contacto@thisisrober.es',
    contact_location_en: 'Spain',
    contact_location_es: 'España',
    hero_name: 'Robert Lita',
    hero_greeting_en: 'Hello, I am thisisrober.',
    hero_greeting_es: 'Hola, soy thisisrober.',
    about_text_en: '',
    about_text_es: '',
    tech_items: '',
    github_token: '',
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/admin/settings').then(r => {
      if (r.data && typeof r.data === 'object') {
        const { site_title, maintenance_mode, social_links, ...rest } = r.data;
        setSettings(prev => {
          const merged = { ...prev, ...rest };
          if (!merged.about_text_en) merged.about_text_en = DEFAULT_ABOUT_EN;
          if (!merged.about_text_es) merged.about_text_es = DEFAULT_ABOUT_ES;
          if (!merged.tech_items) merged.tech_items = JSON.stringify(DEFAULT_TECH_ITEMS, null, 2);
          return merged;
        });
        if (social_links) {
          try {
            const parsed = JSON.parse(social_links);
            setSocialLinks(parsed.length > 0 ? parsed : DEFAULT_SOCIAL_LINKS);
          } catch { setSocialLinks(DEFAULT_SOCIAL_LINKS); }
        } else {
          setSocialLinks(DEFAULT_SOCIAL_LINKS);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      // Exclude UI-only keys from settings payload
      const { _showToken, ...cleanSettings } = settings;
      const res = await api.put('/admin/settings', {
        ...cleanSettings,
        social_links: JSON.stringify(socialLinks),
      });
      if (res.data?.success) {
        setSuccess('Ajustes guardados');
      } else {
        setSuccess('Error: ' + (res.data?.error || 'No se pudieron guardar los ajustes'));
      }
    } catch (err) {
      setSuccess('Error de conexión al guardar');
    }
    setSaving(false);
    setTimeout(() => setSuccess(''), 4000);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'github', url: '' }]);
  };
  const updateSocialLink = (i, field, value) => {
    const copy = [...socialLinks];
    copy[i] = { ...copy[i], [field]: value };
    setSocialLinks(copy);
  };
  const removeSocialLink = (i) => {
    setSocialLinks(socialLinks.filter((_, idx) => idx !== i));
  };

  if (loading) {
    return <DashboardLayout><div className="dash-center"><div className="dash-spinner" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <div>
          <h1>Ajustes</h1>
          <p>Configuración del sitio y archivos</p>
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="dash-card">
        <h3 className="dash-card-title"><FaGlobe className="me-2" /> Estado de disponibilidad</h3>
        <div className="dash-form">
          <div className="dash-form-group">
            <label>Estado</label>
            <StatusSelect
              value={settings.availability_status}
              onChange={v => setSettings({ ...settings, availability_status: v })}
            />
          </div>
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label>Texto de estado (EN)</label>
              <input className="dash-input" value={settings.availability_text_en} onChange={e => setSettings({ ...settings, availability_text_en: e.target.value })} />
            </div>
            <div className="dash-form-group">
              <label>Texto de estado (ES)</label>
              <input className="dash-input" value={settings.availability_text_es} onChange={e => setSettings({ ...settings, availability_text_es: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="dash-card">
        <h3 className="dash-card-title"><FaEnvelope className="me-2" /> Información de contacto</h3>
        <div className="dash-form">
          <div className="dash-form-group">
            <label>Email de contacto</label>
            <input className="dash-input" type="email" value={settings.contact_email} onChange={e => setSettings({ ...settings, contact_email: e.target.value })} />
          </div>
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label>Ubicación (EN)</label>
              <input className="dash-input" value={settings.contact_location_en} onChange={e => setSettings({ ...settings, contact_location_en: e.target.value })} />
            </div>
            <div className="dash-form-group">
              <label>Ubicación (ES)</label>
              <input className="dash-input" value={settings.contact_location_es} onChange={e => setSettings({ ...settings, contact_location_es: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      {/* Redes sociales */}
      <div className="dash-card">
        <h3 className="dash-card-title"><FaLink className="me-2" /> Redes sociales</h3>
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Se mostrarán automáticamente en el portfolio, blog y sección de contacto.
        </p>
        <div className="social-links-list">
          {socialLinks.map((link, i) => (
            <div key={i} className="social-link-row">
              <select
                className="dash-input"
                value={link.platform}
                onChange={e => updateSocialLink(i, 'platform', e.target.value)}
              >
                {SOCIAL_PLATFORMS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <input
                className="dash-input"
                placeholder="https://..."
                value={link.url}
                onChange={e => updateSocialLink(i, 'url', e.target.value)}
              />
              <button type="button" className="social-link-delete" onClick={() => removeSocialLink(i)}>
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="social-link-add" onClick={addSocialLink}>
          <FaPlus size={10} /> Añadir red social
        </button>
      </div>

      {/* Hero / Portada */}
      <div className="dash-card">
        <h3 className="dash-card-title"><FaUser className="me-2" /> Portada (Hero)</h3>
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          El saludo es el texto completo que aparece encima del nombre (p. ej. "&gt; Hello, I am thisisrober.").
        </p>
        <div className="dash-form">
          <div className="dash-form-group">
            <label>Nombre visible</label>
            <input className="dash-input" value={settings.hero_name} onChange={e => setSettings({ ...settings, hero_name: e.target.value })} placeholder="Robert Lita" />
          </div>
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label>Saludo (EN)</label>
              <input className="dash-input" value={settings.hero_greeting_en} onChange={e => setSettings({ ...settings, hero_greeting_en: e.target.value })} placeholder="Hello, I am thisisrober." />
            </div>
            <div className="dash-form-group">
              <label>Saludo (ES)</label>
              <input className="dash-input" value={settings.hero_greeting_es} onChange={e => setSettings({ ...settings, hero_greeting_es: e.target.value })} placeholder="Hola, soy thisisrober." />
            </div>
          </div>
        </div>
      </div>

      {/* About / Sobre mí */}
      <div className="dash-card">
        <h3 className="dash-card-title"><FaInfoCircle className="me-2" /> Sobre mí</h3>
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Texto que aparece en la sección "Sobre mí" del portfolio. Separa párrafos con doble salto de línea.
        </p>
        <div className="dash-form">
          <div className="dash-form-group">
            <label>Texto (ES)</label>
            <textarea className="dash-input" rows={5} value={settings.about_text_es} onChange={e => setSettings({ ...settings, about_text_es: e.target.value })} placeholder="Escribe tu bio en español..." style={{ resize: 'vertical', minHeight: '100px' }} />
          </div>
          <div className="dash-form-group">
            <label>Texto (EN)</label>
            <textarea className="dash-input" rows={5} value={settings.about_text_en} onChange={e => setSettings({ ...settings, about_text_en: e.target.value })} placeholder="Write your bio in English..." style={{ resize: 'vertical', minHeight: '100px' }} />
          </div>
        </div>
      </div>

      {/* Tecnologías */}
      <div className="dash-card">
        <h3 className="dash-card-title"><FaCode className="me-2" /> Tecnologías del portfolio</h3>
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Lista de tecnologías en formato JSON. Cada una tiene <code style={{ color: 'var(--dash-accent)' }}>name</code> y <code style={{ color: 'var(--dash-accent)' }}>logo</code> (nombre del archivo en /img/tech/).
        </p>
        <div className="dash-form-group">
          <label>Items (JSON)</label>
          <textarea
            className="dash-input"
            rows={8}
            value={settings.tech_items}
            onChange={e => setSettings({ ...settings, tech_items: e.target.value })}
            placeholder='[{"name": "React", "logo": "react.png"}, ...]'
            style={{ resize: 'vertical', minHeight: '120px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Imágenes del sitio */}
      <div className="dash-card">
        <h3 className="dash-card-title"><FaImage className="me-2" /> Imágenes del sitio</h3>
        <div className="dash-form">
          <FileUploadField label="Logo del navbar" icon={<FaImage />} accept="image/*" target="img/logo.png" previewPath="/img/logo.png" />
          <FileUploadField label="Foto de perfil / About" icon={<FaImage />} accept="image/*" target="img/profile-picture.png" previewPath="/img/profile-picture.png" />
          <FileUploadField label="Imagen del blog (header)" icon={<FaImage />} accept="image/*" target="img/blog-header.png" previewPath="/img/blog-header.png" />
        </div>
      </div>

      {/* Documentos */}
      <div className="dash-card">
        <h3 className="dash-card-title"><FaFilePdf className="me-2" /> Documentos</h3>
        <div className="dash-form">
          <div className="dash-form-row">
            <FileUploadField label="CV (Español)" icon={<FaUpload />} accept=".pdf" target="cv-es.pdf" endpoint="/admin/upload-document" />
            <FileUploadField label="CV (English)" icon={<FaUpload />} accept=".pdf" target="cv-eng.pdf" endpoint="/admin/upload-document" />
          </div>
          <div className="dash-form-row">
            <FileUploadField label="Carta de presentación (ES)" icon={<FaUpload />} accept=".pdf" target="presentacion.pdf" endpoint="/admin/upload-document" />
            <FileUploadField label="Cover Letter (EN)" icon={<FaUpload />} accept=".pdf" target="presentation.pdf" endpoint="/admin/upload-document" />
          </div>
        </div>
      </div>

      {/* GitHub Token */}
      <div className="dash-card">
        <h3 className="dash-card-title"><FaKey className="me-2" /> Token de GitHub</h3>
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Personal Access Token (PAT) para el Provisioning Stack. Se guarda en la base de datos. Necesita permisos <code style={{ color: 'var(--dash-accent)' }}>repo</code>.
        </p>
        <div className="dash-form">
          <div className="dash-form-group">
            <label>GitHub PAT</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                className="dash-input"
                type={settings._showToken ? 'text' : 'password'}
                value={settings.github_token}
                onChange={e => setSettings({ ...settings, github_token: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                style={{ flex: 1, fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }}
              />
              <button
                type="button"
                className="dash-btn dash-btn-ghost"
                onClick={() => setSettings(prev => ({ ...prev, _showToken: !prev._showToken }))}
                title={settings._showToken ? 'Ocultar' : 'Mostrar'}
              >
                {settings._showToken ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {settings.github_token && (
              <small style={{ color: 'var(--dash-text-dim)', marginTop: '0.25rem', display: 'block' }}>
                El token se guardará al pulsar "Guardar ajustes".
              </small>
            )}
          </div>
        </div>
      </div>

      {success && <div className="dash-alert dash-alert-success">{success}</div>}

      <div className="dash-form-actions">
        <button className="dash-btn dash-btn-primary" onClick={handleSave} disabled={saving}>
          <FaSave /> {saving ? 'Guardando...' : 'Guardar ajustes'}
        </button>
      </div>
    </DashboardLayout>
  );
}
