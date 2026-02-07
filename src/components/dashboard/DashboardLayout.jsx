import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaChartPie, FaFileAlt, FaPlusCircle, FaFolderOpen,
  FaProjectDiagram, FaBriefcase, FaCertificate, FaUsers,
  FaRobot, FaCog, FaSignOutAlt, FaExternalLinkAlt, FaBars, FaBox
} from 'react-icons/fa';
import { useState } from 'react';

const NAV_SECTIONS = [
  { heading: 'General' },
  { to: '/dashboard', label: 'Panel', icon: <FaChartPie />, exact: true },

  { heading: 'Blog' },
  { to: '/dashboard/posts', label: 'Publicaciones', icon: <FaFileAlt /> },
  { to: '/dashboard/posts/new', label: 'Nueva publicación', icon: <FaPlusCircle /> },
  { to: '/dashboard/categories', label: 'Categorías', icon: <FaFolderOpen /> },

  { heading: 'Portfolio' },
  { to: '/dashboard/projects', label: 'Proyectos', icon: <FaProjectDiagram /> },
  { to: '/dashboard/experience', label: 'Experiencia', icon: <FaBriefcase /> },
  { to: '/dashboard/certifications', label: 'Certificaciones', icon: <FaCertificate /> },

  { heading: 'DevOps' },
  { to: '/dashboard/provisioning', label: 'Provisioning Stack', icon: <FaBox /> },

  { heading: 'Otros' },
  { to: '/dashboard/subscribers', label: 'Suscriptores', icon: <FaUsers /> },
  { to: '/dashboard/prompts', label: 'Prompts IA', icon: <FaRobot /> },
  { to: '/dashboard/settings', label: 'Ajustes', icon: <FaCog /> },
];

export default function DashboardLayout({ children }) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    const hasMoreSpecific = NAV_SECTIONS.some(other =>
      !other.heading && other.to !== item.to &&
      other.to.startsWith(item.to + '/') &&
      location.pathname.startsWith(other.to)
    );
    if (hasMoreSpecific) return false;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="dash-wrapper">
      {sidebarOpen && <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <nav className="dash-sidebar-nav">
          {NAV_SECTIONS.map((item, i) =>
            item.heading ? (
              <div key={i} className="dash-nav-heading">{item.heading}</div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`dash-nav-item ${isActive(item) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="dash-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          )}
        </nav>
        <div className="dash-sidebar-footer">
          <a href="/" target="_blank" rel="noreferrer" className="dash-nav-item">
            <span className="dash-nav-icon"><FaExternalLinkAlt /></span>
            <span>Ver portfolio</span>
          </a>
          <a href="/blog" target="_blank" rel="noreferrer" className="dash-nav-item">
            <span className="dash-nav-icon"><FaExternalLinkAlt /></span>
            <span>Ver blog</span>
          </a>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <button className="dash-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          <Link to="/dashboard" className="dash-topbar-brand">
            thisisrober<span>.dashboard</span>
          </Link>
          <div className="dash-topbar-right">
            <button className="dash-logout-btn" onClick={logout}>
              <FaSignOutAlt /> Cerrar sesión
            </button>
          </div>
        </header>
        <main className="dash-content">
          {children}
        </main>
      </div>
    </div>
  );
}
