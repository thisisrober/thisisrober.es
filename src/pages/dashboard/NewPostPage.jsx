import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';

export default function DashNewPostPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    category_id: '', title_es: '', title_en: '',
    excerpt_es: '', excerpt_en: '',
    content_es: '', content_en: '',
  });
  const [image, setImage] = useState(null);

  useEffect(() => { document.title = 'Dashboard | Nuevo Post'; }, []);

  useEffect(() => {
    api.get('/admin/categories').then(r => setCategories(r.data));
  }, []);

  const onContentEsChange = useCallback((v) => {
    setForm(prev => ({ ...prev, content_es: v }));
  }, []);

  const onContentEnChange = useCallback((v) => {
    setForm(prev => ({ ...prev, content_en: v }));
  }, []);

  const editorOptions = useMemo(() => ({
    spellChecker: false, status: false, minHeight: '200px',
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', 'table', '|', 'undo', 'redo'],
  }), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('published', 'true');
    if (image) fd.append('featured_image', image);
    const res = await api.post('/admin/posts', fd, true);
    if (res.data.success) navigate('/dashboard/posts');
    else setError(res.data.error || 'Error creating post');
  };

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <h1>Nueva publicación</h1>
        <p>Crear una nueva entrada del blog</p>
      </div>

      {error && <div className="dash-alert dash-alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="dash-form">
        <div className="dash-card">
          <h3 className="dash-card-title">Información básica</h3>
          <div className="dash-form-group">
            <label>Categoría *</label>
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required className="dash-input">
              <option value="">Seleccionar...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_es} / {c.name_en}</option>)}
            </select>
          </div>
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label>Título (ES) *</label>
              <input className="dash-input" value={form.title_es} onChange={e => setForm({ ...form, title_es: e.target.value })} required />
            </div>
            <div className="dash-form-group">
              <label>Título (EN) *</label>
              <input className="dash-input" value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} required />
            </div>
          </div>
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label>Extracto (ES)</label>
              <textarea className="dash-input" rows={2} value={form.excerpt_es} onChange={e => setForm({ ...form, excerpt_es: e.target.value })} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} />
            </div>
            <div className="dash-form-group">
              <label>Extracto (EN)</label>
              <textarea className="dash-input" rows={2} value={form.excerpt_en} onChange={e => setForm({ ...form, excerpt_en: e.target.value })} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} />
            </div>
          </div>
        </div>

        <div className="dash-card">
          <h3 className="dash-card-title">Contenido (ES) — Markdown</h3>
          <SimpleMDE value={form.content_es} onChange={onContentEsChange} options={editorOptions} />
        </div>

        <div className="dash-card">
          <h3 className="dash-card-title">Contenido (EN) — Markdown</h3>
          <SimpleMDE value={form.content_en} onChange={onContentEnChange} options={editorOptions} />
        </div>

        <div className="dash-card">
          <h3 className="dash-card-title">Imagen destacada</h3>
          <div className="dash-form-group">
            <label>Seleccionar imagen</label>
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="dash-input-file" />
          </div>
        </div>

        <div className="dash-form-actions">
          <button type="submit" className="dash-btn dash-btn-primary">Crear publicación</button>
          <button type="button" className="dash-btn dash-btn-ghost" onClick={() => navigate('/dashboard/posts')}>Cancelar</button>
        </div>
      </form>
    </DashboardLayout>
  );
}
