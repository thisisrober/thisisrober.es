import { useEffect, useState, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';

const EMPTY = {
  name_es: '', name_en: '', description_es: '', description_en: '',
  github_link: '', live_link: '', technologies: '', badge: '',
};

const autoResize = (e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; };

export default function DashProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Dashboard | Proyectos'; }, []);

  const load = () => {
    api.get('/admin/projects').then(r => { setProjects(r.data); setLoading(false); });
  };
  useEffect(load, []);

  const startNew = () => { setEditing('new'); setForm({ ...EMPTY }); setImage(null); setError(''); };
  const startEdit = (p) => {
    setEditing(p.id);
    setForm({
      name_es: p.name_es, name_en: p.name_en,
      description_es: p.description_es, description_en: p.description_en,
      github_link: p.github_link || '', live_link: p.live_link || '',
      technologies: p.technologies || '', badge: p.badge || '',
    });
    setImage(null);
    setError('');
  };
  const cancel = () => { setEditing(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('preview_image', image);

    const res = editing === 'new'
      ? await api.post('/admin/projects', fd, true)
      : await api.put(`/admin/projects/${editing}`, fd, true);

    if (res.data.success) { setEditing(null); load(); }
    else setError(res.data.error || 'Error');
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    await api.delete(`/admin/projects/${id}`);
    load();
  };

  const f = (key, label, type = 'text') => (
    <div className="dash-form-group" key={key}>
      <label>{label}</label>
      {type === 'textarea' ? (
        <textarea className="dash-input" rows={2} value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          onInput={autoResize} />
      ) : (
        <input className="dash-input" type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <div>
          <h1>Proyectos</h1>
          <p>Gestiona los proyectos del portfolio</p>
        </div>
        {editing === null && (
          <button className="dash-btn dash-btn-primary" onClick={startNew}><FaPlus /> Nuevo proyecto</button>
        )}
      </div>

      {editing !== null && (
        <div className="dash-card">
          <h3 className="dash-card-title">{editing === 'new' ? 'Nuevo proyecto' : 'Editar proyecto'}</h3>
          {error && <div className="dash-alert dash-alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="dash-form">
            <div className="dash-form-row">
              {f('name_es', 'Nombre (ES) *')}
              {f('name_en', 'Nombre (EN) *')}
            </div>
            <div className="dash-form-row">
              {f('description_es', 'Descripción (ES)', 'textarea')}
              {f('description_en', 'Descripción (EN)', 'textarea')}
            </div>
            <div className="dash-form-row">
              {f('github_link', 'URL GitHub')}
              {f('live_link', 'URL Live')}
            </div>
            <div className="dash-form-row">
              {f('technologies', 'Tecnologías (separadas por coma)')}
              {f('badge', 'Badge')}
            </div>
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label>Imagen de previsualización</label>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="dash-input-file" />
              </div>
            </div>
            <div className="dash-form-actions">
              <button type="submit" className="dash-btn dash-btn-primary"><FaSave /> Guardar</button>
              <button type="button" className="dash-btn dash-btn-ghost" onClick={cancel}><FaTimes /> Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="dash-center"><div className="dash-spinner" /></div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nombre (ES)</th>
                <th>Nombre (EN)</th>
                <th>Tecnologías</th>
                <th>Enlaces</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td className="dash-table-title">{p.name_es}</td>
                  <td>{p.name_en}</td>
                  <td className="dash-table-small">{p.technologies}</td>
                  <td>
                    <div className="dash-actions">
                      {p.github_link && <a href={p.github_link} target="_blank" rel="noreferrer" className="dash-action-btn"><FaGithub /></a>}
                      {p.live_link && <a href={p.live_link} target="_blank" rel="noreferrer" className="dash-action-btn"><FaExternalLinkAlt /></a>}
                    </div>
                  </td>
                  <td>
                    <div className="dash-actions">
                      <button onClick={() => startEdit(p)} className="dash-action-btn"><FaEdit /></button>
                      <button onClick={() => handleDelete(p.id)} className="dash-action-btn dash-action-danger"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr><td colSpan={5} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Sin proyectos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
