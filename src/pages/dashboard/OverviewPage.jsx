import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaFolderOpen, FaUsers, FaProjectDiagram, FaBriefcase, FaCertificate, FaEye, FaChartLine, FaTrophy, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';

const GREETINGS = {
  morning: [
    '¡Buenos días! ☀️ Listo para crear algo increíble hoy.',
    '¡Buenos días! ☀️ Un nuevo día, nuevas oportunidades.',
    '¡Buenos días! ☀️ El café y el código te esperan.',
  ],
  afternoon: [
    '¡Buenas tardes! 🌤️ ¿Qué tal va el día?',
    '¡Buenas tardes! 🌤️ La productividad está en su punto.',
    '¡Buenas tardes! 🌤️ Sigue con el buen trabajo.',
  ],
  evening: [
    '¡Buenas noches! 🌙 Sesión nocturna de productividad.',
    '¡Buenas noches! 🌙 Los mejores bugs se corrigen de noche.',
    '¡Buenas noches! 🌙 Últimos retoques del día.',
  ],
};

function getGreeting() {
  const h = new Date().getHours();
  const period = h < 12 ? 'morning' : h < 20 ? 'afternoon' : 'evening';
  const options = GREETINGS[period];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return options[dayOfYear % options.length];
}

function fmtK(n) {
  if (n == null) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function TrendBadge({ value }) {
  if (value == null || value === 0) return null;
  const up = value > 0;
  return (
    <span className={`dash-trend ${up ? 'dash-trend-up' : 'dash-trend-down'}`}>
      {up ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
      {up ? '+' : ''}{value}
    </span>
  );
}

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [greeting] = useState(getGreeting);

  useEffect(() => { document.title = 'Dashboard | Resumen'; }, []);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data));
  }, []);

  if (!data) {
    return (
      <DashboardLayout>
        <div className="dash-center"><div className="dash-spinner" /></div>
      </DashboardLayout>
    );
  }

  const { stats, recentPosts, charts, trends } = data;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';

  const cards = [
    { label: 'Publicaciones', value: stats.totalPosts, icon: <FaFileAlt />, color: 'blue', trend: trends?.posts30d },
    { label: 'Categorías', value: stats.totalCategories, icon: <FaFolderOpen />, color: 'purple' },
    { label: 'Proyectos', value: stats.totalProjects, icon: <FaProjectDiagram />, color: 'green', trend: trends?.projects30d },
    { label: 'Visitas totales', value: fmtK(stats.totalViews), icon: <FaEye />, color: 'orange', trend: trends?.views30d },
    { label: 'Certificaciones', value: stats.totalCerts, icon: <FaCertificate />, color: 'pink' },
    { label: 'Suscriptores', value: stats.subscribers, icon: <FaUsers />, color: 'cyan', trend: trends?.subs30d },
  ];

  const maxPostsMonth = Math.max(1, ...((charts?.postsPerMonth || []).map(m => m.count)));
  const maxViews = Math.max(1, ...((charts?.topPosts || []).map(p => p.views)));

  // Line chart helpers
  const ppm = charts?.postsPerMonth || [];
  const chartW = 500, chartH = 140, padL = 0, padR = 0, padT = 10, padB = 0;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const points = ppm.map((m, i) => {
    const x = padL + (ppm.length > 1 ? (i / (ppm.length - 1)) * plotW : plotW / 2);
    const y = padT + plotH - (m.count / maxPostsMonth) * plotH;
    return { x, y, ...m };
  });
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L${points[points.length - 1].x},${chartH} L${points[0].x},${chartH} Z`
    : '';

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <div>
          <h1>Panel</h1>
          <p className="dash-greeting">{greeting}</p>
        </div>
      </div>

      <div className="dash-stats-grid">
        {cards.map(c => (
          <div key={c.label} className={`dash-stat-card dash-stat-${c.color}`}>
            <div className="dash-stat-icon">{c.icon}</div>
            <div className="dash-stat-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="dash-stat-value">{c.value}</span>
                <TrendBadge value={c.trend} />
              </div>
              <span className="dash-stat-label">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="dash-charts-row">
        {/* Posts per month */}
        <div className="dash-card dash-chart-card">
          <h3 className="dash-card-title"><FaChartLine className="me-2" /> Publicaciones por mes</h3>
          {ppm.length > 0 ? (
            <div className="dash-line-chart">
              <svg viewBox={`0 0 ${chartW} ${chartH + 24}`} preserveAspectRatio="none" className="dash-line-svg">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--dash-accent)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--dash-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {areaPath && <path d={areaPath} fill="url(#lineGrad)" />}
                <path d={linePath} fill="none" stroke="var(--dash-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--dash-bg-card)" stroke="var(--dash-accent)" strokeWidth="2" />
                ))}
                {/* Labels: show ~8 evenly spaced labels max */}
                {points.map((p, i) => {
                  const step = Math.max(1, Math.floor(points.length / 8));
                  if (i % step !== 0 && i !== points.length - 1) return null;
                  const [, month] = p.month.split('-');
                  return (
                    <text key={`l${i}`} x={p.x} y={chartH + 16} textAnchor="middle" className="dash-line-label">
                      {MONTH_NAMES[parseInt(month) - 1]}
                    </text>
                  );
                })}
                {/* Value labels above dots */}
                {points.map((p, i) => p.count > 0 ? (
                  <text key={`v${i}`} x={p.x} y={p.y - 8} textAnchor="middle" className="dash-line-value">
                    {p.count}
                  </text>
                ) : null)}
              </svg>
            </div>
          ) : (
            <p className="dash-chart-empty">Sin datos aún</p>
          )}
        </div>

        {/* Top posts */}
        <div className="dash-card dash-chart-card">
          <h3 className="dash-card-title"><FaTrophy className="me-2" /> Top publicaciones</h3>
          <div className="dash-hbar-chart">
            {(charts?.topPosts || []).map((p, i) => (
              <div key={i} className="dash-hbar-row">
                <span className="dash-hbar-label" title={p.title_es}>{p.title_es || p.title_en}</span>
                <div className="dash-hbar-track">
                  <div className="dash-hbar" style={{ width: `${(p.views / maxViews) * 100}%` }} />
                </div>
                <span className="dash-hbar-value"><FaEye size={10} /> {fmtK(p.views)}</span>
              </div>
            ))}
            {(!charts?.topPosts || charts.topPosts.length === 0) && (
              <p className="dash-chart-empty">Sin datos aún</p>
            )}
          </div>
        </div>
      </div>

      {/* Views by category */}
      {charts?.viewsByCategory && charts.viewsByCategory.length > 0 && (
        <div className="dash-card" style={{ marginBottom: '2rem' }}>
          <h3 className="dash-card-title"><FaEye className="me-2" /> Visitas por categoría</h3>
          <div className="dash-hbar-chart">
            {charts.viewsByCategory.map((c, i) => (
              <div key={i} className="dash-hbar-row">
                <span className="dash-hbar-label">{c.name_es}</span>
                <div className="dash-hbar-track">
                  <div className="dash-hbar" style={{ width: `${(c.views / Math.max(1, ...charts.viewsByCategory.map(x => x.views))) * 100}%` }} />
                </div>
                <span className="dash-hbar-value">{fmtK(c.views)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dash-section">
        <div className="dash-section-header">
          <h2>Publicaciones recientes</h2>
          <Link to="/dashboard/posts" className="dash-link">Ver todas</Link>
        </div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Visitas</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map(post => (
                <tr key={post.id}>
                  <td className="dash-table-title">{post.title_es || post.title_en}</td>
                  <td><span className="dash-badge">{post.category_name_es || post.category_name_en}</span></td>
                  <td>
                    <span className={`dash-status ${post.published ? 'dash-status-published' : 'dash-status-draft'}`}>
                      {post.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td><FaEye size={11} className="me-1" />{fmtK(post.views)}</td>
                  <td>{formatDate(post.created_at)}</td>
                  <td>
                    <Link to={`/dashboard/posts/edit/${post.id}`} className="dash-action-btn">Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
