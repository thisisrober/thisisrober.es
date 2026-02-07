import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';

const EMPTY = {
  position_es: '', position_en: '', company_es: '', company_en: '',
  description_es: '', description_en: '', start_date: '', end_date: '',
};

export default function DashExperiencePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState('');

  const load = () => {
    api.get('/admin/experience').then(r => { setItems(r.data); setLoading(false); });
  };
  useEffect(load, []);

  const startNew = () => { setEditing('new'); setForm({ ...EMPTY }); setError(''); };
  const startEdit = (item) => {
    setEditing(item.id);
    setForm({
      position_es: item.position_es, position_en: item.position_en,
      company_es: item.company_es, company_en: item.company_en,
      description_es: item.description_es || '', description_en: item.description_en || '',
      start_date: item.start_date || '', end_date: item.end_date || '',
    });
    setError('');
  };
  const cancel = () => { setEditing(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, end_date: form.end_date || null };
    const res = editing === 'new'
      ? await api.post('/admin/experience', payload)
      : await api.put(`/admin/experience/${editing}`, payload);
    if (res.data.success) { setEditing(null); load(); }
    else setError(res.data.error || 'Error');
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta experiencia?')) return;
    await api.delete(`/admin/experience/${id}`);
    load();
  };

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <div>
          <h1>Experiencia</h1>
          <p>Gestiona tu historial profesional</p>
        </div>
        {editing === null && (
          <button className="dash-btn dash-btn-primary" onClick={startNew}><FaPlus /> Añadir experiencia</button>
        )}
      </div>

      {editing !== null && (
        <div className="dash-card">
          <h3 className="dash-card-title">{editing === 'new' ? 'Nueva experiencia' : 'Editar experiencia'}</h3>
          {error && <div className="dash-alert dash-alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="dash-form">
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label>Puesto (ES) *</label>
                <input className="dash-input" value={form.position_es} onChange={e => setForm({ ...form, position_es: e.target.value })} required />
              </div>
              <div className="dash-form-group">
                <label>Puesto (EN) *</label>
                <input className="dash-input" value={form.position_en} onChange={e => setForm({ ...form, position_en: e.target.value })} required />
              </div>
            </div>
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label>Empresa (ES) *</label>
                <input className="dash-input" value={form.company_es} onChange={e => setForm({ ...form, company_es: e.target.value })} required />
              </div>
              <div className="dash-form-group">
                <label>Empresa (EN) *</label>
                <input className="dash-input" value={form.company_en} onChange={e => setForm({ ...form, company_en: e.target.value })} required />
              </div>
            </div>
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label>Descripción (ES)</label>
                <textarea className="dash-input" rows={3} value={form.description_es} onChange={e => setForm({ ...form, description_es: e.target.value })} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} />
              </div>
              <div className="dash-form-group">
                <label>Descripción (EN)</label>
                <textarea className="dash-input" rows={3} value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} />
              </div>
            </div>
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label>Fecha inicio *</label>
                <input className="dash-input" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
              </div>
              <div className="dash-form-group">
                <label>Fecha fin (vacío = Actual)</label>
                <input className="dash-input" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
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
                <th>Puesto (ES)</th>
                <th>Empresa</th>
                <th>Periodo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="dash-table-title">{item.position_es}</td>
                  <td>{item.company_es}</td>
                  <td className="dash-table-small">
                    {item.start_date} — {item.end_date || 'Actual'}
                  </td>
                  <td>
                    <div className="dash-actions">
                      <button onClick={() => startEdit(item)} className="dash-action-btn"><FaEdit /></button>
                      <button onClick={() => handleDelete(item.id)} className="dash-action-btn dash-action-danger"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Sin experiencia</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
