import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';

export default function DashPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/admin/posts').then(r => { setPosts(r.data); setLoading(false); });
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta publicación?')) return;
    await api.delete(`/admin/posts/${id}`);
    load();
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <div>
          <h1>Publicaciones</h1>
          <p>Gestiona las publicaciones del blog</p>
        </div>
        <Link to="/dashboard/posts/new" className="dash-btn dash-btn-primary">
          <FaPlus /> Nueva publicación
        </Link>
      </div>

      {loading ? (
        <div className="dash-center"><div className="dash-spinner" /></div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Título (ES)</th>
                <th>Título (EN)</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Visitas</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td className="dash-table-title">{p.title_es}</td>
                  <td className="dash-table-title">{p.title_en}</td>
                  <td><span className="dash-badge">{p.category_name_es}</span></td>
                  <td>
                    <span className={`dash-status ${p.published ? 'dash-status-published' : 'dash-status-draft'}`}>
                      {p.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td><FaEye size={11} className="me-1" />{p.views}</td>
                  <td>{formatDate(p.created_at)}</td>
                  <td>
                    <div className="dash-actions">
                      <Link to={`/dashboard/posts/edit/${p.id}`} className="dash-action-btn"><FaEdit /></Link>
                      <button onClick={() => handleDelete(p.id)} className="dash-action-btn dash-action-danger"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={7} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Sin publicaciones</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
