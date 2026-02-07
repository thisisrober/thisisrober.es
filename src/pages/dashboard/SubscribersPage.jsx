import { useEffect, useState } from 'react';
import { FaTrash, FaEnvelope, FaDownload } from 'react-icons/fa';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';

export default function DashSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Dashboard | Suscriptores'; }, []);

  const load = () => {
    api.get('/admin/subscribers').then(r => { setSubscribers(r.data); setLoading(false); });
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este suscriptor?')) return;
    await api.delete(`/admin/subscribers/${id}`);
    load();
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const exportCSV = () => {
    const header = 'Nombre,Email';
    const rows = subscribers.map(s =>
      `${(s.name || '').replace(/,/g, '')},${s.email}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suscriptores_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <div>
          <h1>Suscriptores</h1>
          <p>Suscriptores de la newsletter</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="dash-badge-count"><FaEnvelope /> {subscribers.length} total</div>
          {subscribers.length > 0 && (
            <button className="dash-btn dash-btn-ghost" onClick={exportCSV}><FaDownload /> Exportar CSV</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="dash-center"><div className="dash-spinner" /></div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{formatDate(s.subscribed_at)}</td>
                  <td>
                    <button onClick={() => handleDelete(s.id)} className="dash-action-btn dash-action-danger"><FaTrash /></button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr><td colSpan={4} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Sin suscriptores</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
