import { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';

export default function DashCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name_es: '', name_en: '', description_es: '', description_en: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name_es: '', name_en: '', description_es: '', description_en: '' });
  const [error, setError] = useState('');

  const load = () => {
    api.get('/admin/categories').then(r => { setCategories(r.data); setLoading(false); });
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await api.post('/admin/categories', form);
    if (res.data.success) {
      setForm({ name_es: '', name_en: '', description_es: '', description_en: '' });
      load();
    } else {
      setError(res.data.error || 'Error');
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditForm({ name_es: c.name_es, name_en: c.name_en, description_es: c.description_es || '', description_en: c.description_en || '' });
  };

  const handleUpdate = async (id) => {
    const res = await api.put(`/admin/categories/${id}`, editForm);
    if (res.data.success) { setEditingId(null); load(); }
    else setError(res.data.error || 'Error');
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta categoría? Las publicaciones asociadas también se eliminarán.')) return;
    await api.delete(`/admin/categories/${id}`);
    load();
  };

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <h1>Categorías</h1>
        <p>Gestiona las categorías del blog</p>
      </div>

      <div className="dash-card">
        <h3 className="dash-card-title">Añadir categoría</h3>
        {error && <div className="dash-alert dash-alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="dash-form">
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label>Nombre (ES) *</label>
              <input className="dash-input" value={form.name_es} onChange={e => setForm({ ...form, name_es: e.target.value })} required />
            </div>
            <div className="dash-form-group">
              <label>Nombre (EN) *</label>
              <input className="dash-input" value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} required />
            </div>
          </div>
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label>Descripción (ES)</label>
              <input className="dash-input" value={form.description_es} onChange={e => setForm({ ...form, description_es: e.target.value })} />
            </div>
            <div className="dash-form-group">
              <label>Descripción (EN)</label>
              <input className="dash-input" value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="dash-btn dash-btn-primary"><FaPlus /> Añadir</button>
        </form>
      </div>

      {loading ? (
        <div className="dash-center"><div className="dash-spinner" /></div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nombre (ES)</th>
                <th>Nombre (EN)</th>
                <th>Slug</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                editingId === c.id ? (
                  <tr key={c.id}>
                    <td><input className="dash-input" value={editForm.name_es} onChange={e => setEditForm({ ...editForm, name_es: e.target.value })} /></td>
                    <td><input className="dash-input" value={editForm.name_en} onChange={e => setEditForm({ ...editForm, name_en: e.target.value })} /></td>
                    <td><code>{c.slug}</code></td>
                    <td>
                      <div className="dash-actions">
                        <button onClick={() => handleUpdate(c.id)} className="dash-action-btn" style={{ color: '#4ade80' }}><FaSave /></button>
                        <button onClick={() => setEditingId(null)} className="dash-action-btn"><FaTimes /></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id}>
                    <td>{c.name_es}</td>
                    <td>{c.name_en}</td>
                    <td><code>{c.slug}</code></td>
                    <td>
                      <div className="dash-actions">
                        <button onClick={() => startEdit(c)} className="dash-action-btn"><FaEdit /></button>
                        <button onClick={() => handleDelete(c.id)} className="dash-action-btn dash-action-danger"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={4} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Sin categorías</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
