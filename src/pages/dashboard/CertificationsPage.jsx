import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';

const EMPTY = {
  title_es: '', title_en: '', provider_es: '', provider_en: '',
  issue_date: '', credential_url: '',
};

export default function DashCertificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState('');

  const load = () => {
    api.get('/admin/certifications').then(r => { setItems(r.data); setLoading(false); });
  };
  useEffect(load, []);

  const startNew = () => { setEditing('new'); setForm({ ...EMPTY }); setError(''); };
  const startEdit = (item) => {
    setEditing(item.id);
    setForm({
      title_es: item.title_es, title_en: item.title_en,
      provider_es: item.provider_es, provider_en: item.provider_en,
      issue_date: item.issue_date || '', credential_url: item.credential_url || '',
    });
    setError('');
  };
  const cancel = () => { setEditing(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = editing === 'new'
      ? await api.post('/admin/certifications', form)
      : await api.put(`/admin/certifications/${editing}`, form);
    if (res.data.success) { setEditing(null); load(); }
    else setError(res.data.error || 'Error');
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta certificación?')) return;
    await api.delete(`/admin/certifications/${id}`);
    load();
  };

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <div>
          <h1>Certificaciones</h1>
          <p>Gestiona tus certificaciones</p>
        </div>
        {editing === null && (
          <button className="dash-btn dash-btn-primary" onClick={startNew}><FaPlus /> Añadir certificación</button>
        )}
      </div>

      {editing !== null && (
        <div className="dash-card">
          <h3 className="dash-card-title">{editing === 'new' ? 'Nueva certificación' : 'Editar certificación'}</h3>
          {error && <div className="dash-alert dash-alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="dash-form">
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
                <label>Proveedor (ES) *</label>
                <input className="dash-input" value={form.provider_es} onChange={e => setForm({ ...form, provider_es: e.target.value })} required />
              </div>
              <div className="dash-form-group">
                <label>Proveedor (EN) *</label>
                <input className="dash-input" value={form.provider_en} onChange={e => setForm({ ...form, provider_en: e.target.value })} required />
              </div>
            </div>
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label>Fecha de emisión *</label>
                <input className="dash-input" type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} required />
              </div>
              <div className="dash-form-group">
                <label>URL de la credencial</label>
                <input className="dash-input" type="url" value={form.credential_url} onChange={e => setForm({ ...form, credential_url: e.target.value })} />
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
                <th>Título (ES)</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>URL</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="dash-table-title">{item.title_es}</td>
                  <td>{item.provider_es}</td>
                  <td>{item.issue_date}</td>
                  <td>
                    {item.credential_url ? (
                      <a href={item.credential_url} target="_blank" rel="noreferrer" className="dash-action-btn"><FaExternalLinkAlt /></a>
                    ) : '—'}
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
                <tr><td colSpan={5} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Sin certificaciones</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
