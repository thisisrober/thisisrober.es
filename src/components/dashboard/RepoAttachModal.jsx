import { useState } from 'react';
import { FaTimes, FaSave, FaRocket, FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import api from '../../services/api';

/**
 * Modal to attach a GitHub repo to the portfolio.
 * Props: repo, deployStatus, onClose, onAttached
 */
export default function RepoAttachModal({ repo, deployStatus, onClose, onAttached }) {
  const [form, setForm] = useState({
    name_es: repo.name,
    name_en: repo.name,
    description_es: repo.description || '',
    description_en: repo.description || '',
    technologies: (repo.language || '') + (repo.topics?.length ? ', ' + repo.topics.join(', ') : ''),
    badge: '',
    live_link: repo.homepage || '',
    deploy: false,
  });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('repo_name', repo.name);
      fd.append('repo_full_name', repo.full_name);
      fd.append('name_es', form.name_es);
      fd.append('name_en', form.name_en);
      fd.append('description_es', form.description_es);
      fd.append('description_en', form.description_en);
      fd.append('github_link', repo.html_url);
      fd.append('live_link', form.live_link);
      fd.append('technologies', form.technologies);
      fd.append('badge', form.badge);
      fd.append('deploy', form.deploy ? 'true' : 'false');
      if (image) fd.append('preview_image', image);

      const { data } = await api.post('/admin/provisioning/attach', fd, true);

      if (data.success) {
        onAttached();
      } else {
        setError(data.error || 'Error al adjuntar');
      }
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const f = (key, label, placeholder = '') => (
    <div className="dash-form-group" key={key}>
      <label>{label}</label>
      <input
        className="dash-input"
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  );

  const fTextarea = (key, label) => (
    <div className="dash-form-group" key={key}>
      <label>{label}</label>
      <textarea
        className="dash-input"
        rows={3}
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="prov-modal-overlay" onClick={onClose}>
      <div className="prov-modal" onClick={e => e.stopPropagation()}>
        <div className="prov-modal-header">
          <h3>Adjuntar al portfolio</h3>
          <button className="prov-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="prov-modal-repo-info">
          <FaGithub />
          <a href={repo.html_url} target="_blank" rel="noreferrer">
            {repo.full_name} <FaExternalLinkAlt style={{ fontSize: '0.75em' }} />
          </a>
          {repo.language && <span className="prov-lang">{repo.language}</span>}
        </div>

        {error && <div className="dash-alert dash-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="dash-form">
          <div className="dash-form-row">
            {f('name_es', 'Nombre (ES) *', 'Nombre del proyecto en español')}
            {f('name_en', 'Nombre (EN) *', 'Project name in English')}
          </div>
          <div className="dash-form-row">
            {fTextarea('description_es', 'Descripción (ES)')}
            {fTextarea('description_en', 'Descripción (EN)')}
          </div>
          <div className="dash-form-row">
            {f('technologies', 'Tecnologías (separadas por coma)')}
            {f('badge', 'Badge')}
          </div>
          <div className="dash-form-row">
            {f('live_link', 'URL de vista previa', 'https://...')}
          </div>
          <div className="dash-form-group">
            <label>Imagen de previsualización</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files[0])}
              className="dash-input-file"
            />
          </div>

          {!deployStatus?.deployed && (
            <div className="dash-form-group">
              <label className="prov-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.deploy}
                  onChange={e => setForm(prev => ({ ...prev, deploy: e.target.checked }))}
                />
                <FaRocket /> Desplegar en projects/ (clonar repo para vista previa)
              </label>
            </div>
          )}

          {deployStatus?.deployed && (
            <div className="prov-modal-deploy-info">
              <FaRocket /> Ya desplegado en <code>{deployStatus.path}</code>
            </div>
          )}

          <div className="dash-form-actions">
            <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>
              {saving ? <><div className="dash-spinner-sm" /> Guardando...</> : <><FaSave /> Adjuntar al portfolio</>}
            </button>
            <button type="button" className="dash-btn dash-btn-ghost" onClick={onClose}>
              <FaTimes /> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
