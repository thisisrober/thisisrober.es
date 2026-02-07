import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  FaGithub, FaStar, FaCodeBranch, FaLock, FaGlobe, FaSearch,
  FaSync, FaRocket, FaLink, FaExternalLinkAlt, FaPlus, FaBox,
  FaArchive, FaKey, FaCheck, FaCalendarAlt, FaTimes, FaTrash,
  FaBriefcase, FaChevronDown, FaCheckCircle, FaUsers, FaUserPlus,
  FaEdit, FaEye, FaEyeSlash, FaCog, FaImage, FaExclamationTriangle,
} from 'react-icons/fa';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';

// =============================================
// Custom Dropdown Component
// =============================================
function CustomSelect({ value, onChange, options, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={`prov-dropdown ${className}`} ref={ref}>
      <button type="button" className="prov-dropdown-trigger dash-input" onClick={() => setOpen(!open)}>
        <span>{selected?.label || ''}</span>
        <FaChevronDown className={`prov-dropdown-arrow ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="prov-dropdown-menu">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`prov-dropdown-item ${opt.value === value ? 'active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
              {opt.value === value && <FaCheck className="prov-dropdown-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================
// CONTRIBUTION HEATMAP COMPONENT (GitHub GraphQL calendar)
// =============================================
function ContributionHeatmap({ calendar }) {
  const { weeks, months, maxCount, totalContribs } = useMemo(() => {
    if (!calendar || !calendar.weeks) return { weeks: [], months: [], maxCount: 0, totalContribs: 0 };

    const totalContribs = calendar.totalContributions || 0;

    // Map GraphQL weeks directly — each week has 7 contributionDays
    const weeks = calendar.weeks.map(w =>
      w.contributionDays.map(d => ({
        date: d.date,
        count: d.contributionCount,
      }))
    );

    // Build month labels from the first day of each week
    const months = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const firstDay = week[0];
      if (firstDay) {
        const m = new Date(firstDay.date + 'T00:00:00').getMonth();
        if (m !== lastMonth) {
          lastMonth = m;
          months.push({
            index: i,
            label: new Date(firstDay.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' }),
          });
        }
      }
    });

    let maxCount = 0;
    weeks.forEach(w => w.forEach(d => { if (d.count > maxCount) maxCount = d.count; }));

    return { weeks, months, maxCount, totalContribs };
  }, [calendar]);

  const getColor = (count) => {
    if (count < 0) return 'transparent';
    if (count === 0) return 'rgba(255,255,255,0.04)';
    const ratio = maxCount > 0 ? count / maxCount : 0;
    if (ratio <= 0.25) return 'rgba(99, 102, 241, 0.25)';
    if (ratio <= 0.5) return 'rgba(99, 102, 241, 0.45)';
    if (ratio <= 0.75) return 'rgba(129, 140, 248, 0.7)';
    return '#818cf8';
  };

  // Position month labels based on their week index
  const totalWeeks = weeks.length;

  return (
    <div className="prov-heatmap-wrapper">
      <div className="prov-heatmap-months" style={{ paddingLeft: 30 }}>
        {months.map((m, i) => {
          const nextIndex = i + 1 < months.length ? months[i + 1].index : totalWeeks;
          const span = nextIndex - m.index;
          return (
            <span key={i} style={{ width: `${(span / totalWeeks) * 100}%`, flexShrink: 0 }}>
              {m.label}
            </span>
          );
        })}
      </div>
      <div className="prov-heatmap">
        <div className="prov-heatmap-days">
          <span></span><span>Lun</span><span></span><span>Mié</span><span></span><span>Vie</span><span></span>
        </div>
        <div className="prov-heatmap-grid">
          {weeks.map((week, wi) => (
            <div key={wi} className="prov-heatmap-col">
              {week.map((day, di) => (
                <div
                  key={di}
                  className="prov-heatmap-cell"
                  style={{ backgroundColor: getColor(day.count) }}
                  title={day.count >= 0 ? `${day.date}: ${day.count} contribuciones` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="prov-heatmap-footer">
        <span>{totalContribs} contribuciones en el último año</span>
        <div className="prov-heatmap-legend">
          <span>Menos</span>
          {['rgba(255,255,255,0.04)', 'rgba(99, 102, 241, 0.25)', 'rgba(99, 102, 241, 0.45)', 'rgba(129, 140, 248, 0.7)', '#818cf8'].map((c, i) => (
            <div key={i} className="prov-heatmap-cell" style={{ backgroundColor: c }} />
          ))}
          <span>Más</span>
        </div>
      </div>
    </div>
  );
}

// =============================================
// GITHUB PROFILE CARD
// =============================================
function GitHubProfileCard() {
  const [profile, setProfile] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/provisioning/github-profile'),
      api.get('/admin/provisioning/github-contributions'),
    ]).then(([profileRes, calendarRes]) => {
      if (profileRes.status === 200) setProfile(profileRes.data);
      if (calendarRes.status === 200) setCalendar(calendarRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dash-center" style={{ padding: '2rem' }}><div className="dash-spinner" /></div>;
  if (!profile) return null;

  return (
    <div className="prov-profile-card">
      <div className="prov-profile-header">
        <img src={profile.avatar_url} alt={profile.login} className="prov-profile-avatar" />
        <div className="prov-profile-info">
          <h3>{profile.name || profile.login}</h3>
          <a href={profile.html_url} target="_blank" rel="noreferrer" className="prov-profile-login">
            @{profile.login} <FaExternalLinkAlt size={10} />
          </a>
          {profile.bio && <p className="prov-profile-bio">{profile.bio}</p>}
          <div className="prov-profile-stats">
            <span>{profile.public_repos} repos</span>
            <span>{profile.followers} seguidores</span>
            <span>{profile.following} siguiendo</span>
          </div>
        </div>
      </div>
      <ContributionHeatmap calendar={calendar} />
    </div>
  );
}

// =============================================
// CONFIRM DELETE MODAL
// =============================================
function ConfirmDeleteModal({ repo, onClose, onDeleted }) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmText !== repo.name) return;
    setDeleting(true);
    setError('');
    try {
      const { data } = await api.delete(`/admin/provisioning/repos/${repo.full_name}`);
      if (data.success) {
        onDeleted();
      } else {
        setError(data.error || 'Error al eliminar');
      }
    } catch (err) {
      setError(err.message);
    }
    setDeleting(false);
  };

  return (
    <div className="prov-modal-overlay" onClick={onClose}>
      <div className="prov-modal prov-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="prov-modal-header">
          <h3><FaExclamationTriangle style={{ color: '#f87171', marginRight: 8 }} />Eliminar repositorio</h3>
          <button className="prov-modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Esta acción <strong style={{ color: '#f87171' }}>no se puede deshacer</strong>. Se eliminará permanentemente el repositorio
          <strong> {repo.full_name}</strong>, junto con su despliegue local y entrada en portfolio.
        </p>
        <div className="dash-form-group">
          <label style={{ fontSize: '0.85rem' }}>
            Escribe <strong>{repo.name}</strong> para confirmar:
          </label>
          <input
            className="dash-input"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={repo.name}
            autoFocus
          />
        </div>
        {error && <div className="dash-alert dash-alert-error" style={{ marginTop: '0.75rem' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="dash-btn dash-btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className="dash-btn dash-btn-danger"
            disabled={confirmText !== repo.name || deleting}
            onClick={handleDelete}
          >
            {deleting ? <div className="dash-spinner-sm" /> : <FaTrash />} Eliminar repositorio
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// REPO DETAIL MODAL (General / Collaborators / Portfolio)
// =============================================
function RepoDetailModal({ repo, deployStatus, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState('general');
  const [showDelete, setShowDelete] = useState(false);

  // --- General tab state ---
  const [name, setName] = useState(repo.name);
  const [description, setDescription] = useState(repo.description || '');
  const [isPrivate, setIsPrivate] = useState(repo.private);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // --- Collaborator tab state ---
  const [collabs, setCollabs] = useState([]);
  const [collabLoading, setCollabLoading] = useState(false);
  const [newCollab, setNewCollab] = useState('');
  const [newCollabPerm, setNewCollabPerm] = useState('push');
  const [addingCollab, setAddingCollab] = useState(false);

  // --- Portfolio tab state ---
  const [portfolioProject, setPortfolioProject] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [pName_es, setPName_es] = useState('');
  const [pName_en, setPName_en] = useState('');
  const [pDesc_es, setPDesc_es] = useState('');
  const [pDesc_en, setPDesc_en] = useState('');
  const [pLiveLink, setPLiveLink] = useState('');
  const [pTechnologies, setPTechnologies] = useState('');
  const [pBadge, setPBadge] = useState('');
  const [pImage, setPImage] = useState(null);
  const [pSaving, setPSaving] = useState(false);
  const [pMsg, setPMsg] = useState('');

  // --- Deploy state ---
  const [showAttach, setShowAttach] = useState(false);

  const isInPortfolio = deployStatus?.attached;

  // Load collabs when tab opens
  useEffect(() => {
    if (activeTab === 'collaborators') {
      setCollabLoading(true);
      api.get(`/admin/provisioning/repos/${repo.full_name}/collaborators`)
        .then(({ data }) => setCollabs(data))
        .catch(() => {})
        .finally(() => setCollabLoading(false));
    }
  }, [activeTab, repo.full_name]);

  // Load portfolio project when tab opens
  useEffect(() => {
    if (activeTab === 'portfolio' && isInPortfolio) {
      setPortfolioLoading(true);
      api.get(`/admin/provisioning/portfolio-project/${repo.name}`)
        .then(({ data }) => {
          if (data.found) {
            setPortfolioProject(data.project);
            setPName_es(data.project.name_es || '');
            setPName_en(data.project.name_en || '');
            setPDesc_es(data.project.description_es || '');
            setPDesc_en(data.project.description_en || '');
            setPLiveLink(data.project.live_link || '');
            setPTechnologies(data.project.technologies || '');
            setPBadge(data.project.badge || '');
          }
        })
        .catch(() => {})
        .finally(() => setPortfolioLoading(false));
    }
  }, [activeTab, isInPortfolio, repo.name]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const updates = {};
      if (name !== repo.name) updates.name = name;
      if (description !== (repo.description || '')) updates.description = description;
      if (isPrivate !== repo.private) updates.private = isPrivate;
      if (Object.keys(updates).length === 0) {
        setSaveMsg('Sin cambios');
        setSaving(false);
        return;
      }
      const { data } = await api.patch(`/admin/provisioning/repos/${repo.full_name}`, updates);
      if (data.success) {
        setSaveMsg('✅ Guardado correctamente');
        onUpdated();
      } else {
        setSaveMsg('❌ ' + (data.error || 'Error'));
      }
    } catch (err) {
      setSaveMsg('❌ ' + err.message);
    }
    setSaving(false);
  };

  const handleAddCollab = async () => {
    if (!newCollab.trim()) return;
    setAddingCollab(true);
    try {
      await api.put(`/admin/provisioning/repos/${repo.full_name}/collaborators/${newCollab.trim()}`, { permission: newCollabPerm });
      setNewCollab('');
      // Reload
      const { data } = await api.get(`/admin/provisioning/repos/${repo.full_name}/collaborators`);
      setCollabs(data);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setAddingCollab(false);
  };

  const handleRemoveCollab = async (username) => {
    if (!confirm(`¿Eliminar a ${username} como colaborador?`)) return;
    try {
      await api.delete(`/admin/provisioning/repos/${repo.full_name}/collaborators/${username}`);
      setCollabs(prev => prev.filter(c => c.login !== username));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleSavePortfolio = async () => {
    if (!portfolioProject) return;
    setPSaving(true);
    setPMsg('');
    try {
      const formData = new FormData();
      formData.append('name_es', pName_es);
      formData.append('name_en', pName_en);
      formData.append('description_es', pDesc_es);
      formData.append('description_en', pDesc_en);
      formData.append('live_link', pLiveLink);
      formData.append('technologies', pTechnologies);
      formData.append('badge', pBadge);
      if (pImage) formData.append('preview_image', pImage);

      const { data } = await api.put(`/admin/provisioning/portfolio-project/${portfolioProject.id}`, formData, true);
      if (data.success) {
        setPMsg('✅ Proyecto actualizado');
      } else {
        setPMsg('❌ ' + (data.error || 'Error'));
      }
    } catch (err) {
      setPMsg('❌ ' + err.message);
    }
    setPSaving(false);
  };

  const handleDeploy = () => {
    setShowAttach(true);
  };

  const permOptions = [
    { value: 'pull', label: 'Read' },
    { value: 'push', label: 'Write' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <>
      <div className="prov-modal-overlay" onClick={onClose}>
        <div className="prov-modal prov-modal-lg" onClick={e => e.stopPropagation()}>
          <div className="prov-modal-header">
            <h3>
              {repo.private ? <FaLock className="prov-icon-vis" /> : <FaGlobe className="prov-icon-vis" />}
              {repo.name}
            </h3>
            <button className="prov-modal-close" onClick={onClose}><FaTimes /></button>
          </div>

          {/* Modal tabs */}
          <div className="prov-modal-tabs">
            <button className={`prov-modal-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
              <FaCog /> General
            </button>
            <button className={`prov-modal-tab ${activeTab === 'collaborators' ? 'active' : ''}`} onClick={() => setActiveTab('collaborators')}>
              <FaUsers /> Colaboradores
            </button>
            {isInPortfolio && (
              <button className={`prov-modal-tab ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>
                <FaBriefcase /> Portfolio
              </button>
            )}
          </div>

          {/* === GENERAL TAB === */}
          {activeTab === 'general' && (
            <div className="prov-modal-body">
              <div className="dash-form-group">
                <label>Nombre del repositorio</label>
                <input className="dash-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="dash-form-group">
                <label>Descripción</label>
                <textarea className="dash-input" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="dash-form-group">
                <label>Visibilidad</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <label className="prov-radio-label">
                    <input type="radio" name="vis" checked={!isPrivate} onChange={() => setIsPrivate(false)} />
                    <FaGlobe /> Público
                  </label>
                  <label className="prov-radio-label">
                    <input type="radio" name="vis" checked={isPrivate} onChange={() => setIsPrivate(true)} />
                    <FaLock /> Privado
                  </label>
                </div>
              </div>
              {saveMsg && <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{saveMsg}</p>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button className="dash-btn dash-btn-primary" onClick={handleSaveGeneral} disabled={saving}>
                  {saving ? <div className="dash-spinner-sm" /> : <FaCheck />} Guardar cambios
                </button>
                {!isInPortfolio && (
                  <button className="dash-btn dash-btn-accent" onClick={handleDeploy}>
                    <FaRocket /> Desplegar al portfolio
                  </button>
                )}
                <button className="dash-btn dash-btn-danger-outline" onClick={() => setShowDelete(true)}>
                  <FaTrash /> Eliminar repositorio
                </button>
              </div>
            </div>
          )}

          {/* === COLLABORATORS TAB === */}
          {activeTab === 'collaborators' && (
            <div className="prov-modal-body">
              <div className="prov-collab-add">
                <input
                  className="dash-input"
                  placeholder="Username de GitHub..."
                  value={newCollab}
                  onChange={e => setNewCollab(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCollab()}
                />
                <CustomSelect value={newCollabPerm} onChange={setNewCollabPerm} options={permOptions} className="prov-collab-perm-select" />
                <button className="dash-btn dash-btn-primary" onClick={handleAddCollab} disabled={addingCollab || !newCollab.trim()}>
                  {addingCollab ? <div className="dash-spinner-sm" /> : <FaUserPlus />} Añadir
                </button>
              </div>
              {collabLoading ? (
                <div className="dash-center" style={{ padding: '2rem' }}><div className="dash-spinner" /></div>
              ) : collabs.length === 0 ? (
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                  No hay colaboradores
                </p>
              ) : (
                <div className="prov-collab-list">
                  {collabs.map(c => (
                    <div key={c.login} className="prov-collab-item">
                      <img src={c.avatar_url} alt={c.login} className="prov-collab-avatar" />
                      <div className="prov-collab-info">
                        <strong>{c.login}</strong>
                        <span className="prov-collab-role">{c.role_name || 'collaborator'}</span>
                      </div>
                      <button className="dash-btn dash-btn-sm dash-btn-danger-outline" onClick={() => handleRemoveCollab(c.login)} title="Eliminar colaborador">
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === PORTFOLIO TAB === */}
          {activeTab === 'portfolio' && isInPortfolio && (
            <div className="prov-modal-body">
              {portfolioLoading ? (
                <div className="dash-center" style={{ padding: '2rem' }}><div className="dash-spinner" /></div>
              ) : !portfolioProject ? (
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>No se encontró el proyecto en portfolio.</p>
              ) : (
                <>
                  <div className="dash-form-row">
                    <div className="dash-form-group">
                      <label>Nombre (ES)</label>
                      <input className="dash-input" value={pName_es} onChange={e => setPName_es(e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>Nombre (EN)</label>
                      <input className="dash-input" value={pName_en} onChange={e => setPName_en(e.target.value)} />
                    </div>
                  </div>
                  <div className="dash-form-row">
                    <div className="dash-form-group">
                      <label>Descripción (ES)</label>
                      <textarea className="dash-input" rows={3} value={pDesc_es} onChange={e => setPDesc_es(e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>Descripción (EN)</label>
                      <textarea className="dash-input" rows={3} value={pDesc_en} onChange={e => setPDesc_en(e.target.value)} />
                    </div>
                  </div>
                  <div className="dash-form-group">
                    <label><FaGithub style={{ marginRight: 4 }} /> GitHub Link (bloqueado)</label>
                    <input className="dash-input" value={portfolioProject.github_link || ''} disabled style={{ opacity: 0.5 }} />
                  </div>
                  <div className="dash-form-group">
                    <label>Live Link</label>
                    <input className="dash-input" value={pLiveLink} onChange={e => setPLiveLink(e.target.value)} placeholder="/projects/repo-name" />
                  </div>
                  <div className="dash-form-group">
                    <label>Tecnologías (separadas por coma)</label>
                    <input className="dash-input" value={pTechnologies} onChange={e => setPTechnologies(e.target.value)} placeholder="React, Node.js, Express" />
                  </div>
                  <div className="dash-form-group">
                    <label><FaImage style={{ marginRight: 4 }} /> Imagen de vista previa</label>
                    <input type="file" accept="image/*" onChange={e => setPImage(e.target.files[0])} className="dash-input" />
                    {portfolioProject.preview_image && !pImage && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-dim)', marginTop: 4 }}>
                        Actual: {portfolioProject.preview_image}
                      </span>
                    )}
                  </div>
                  {pMsg && <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{pMsg}</p>}
                  <button className="dash-btn dash-btn-primary" onClick={handleSavePortfolio} disabled={pSaving} style={{ marginTop: '1rem' }}>
                    {pSaving ? <div className="dash-spinner-sm" /> : <FaCheck />} Guardar cambios del portfolio
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attach modal — deploy to portfolio */}
      {showAttach && (
        <AttachModal
          repo={repo}
          deployStatus={deployStatus}
          onClose={() => setShowAttach(false)}
          onAttached={() => {
            setShowAttach(false);
            onUpdated();
          }}
        />
      )}

      {/* Delete confirmation modal */}
      {showDelete && (
        <ConfirmDeleteModal
          repo={repo}
          onClose={() => setShowDelete(false)}
          onDeleted={() => { setShowDelete(false); onClose(); onUpdated(); }}
        />
      )}
    </>
  );
}

// =============================================
// ATTACH MODAL (quick portfolio attach)
// =============================================
function AttachModal({ repo, deployStatus, onClose, onAttached }) {
  const [nameEs, setNameEs] = useState(repo.name);
  const [nameEn, setNameEn] = useState(repo.name);
  const [descEs, setDescEs] = useState(repo.description || '');
  const [descEn, setDescEn] = useState(repo.description || '');
  const [technologies, setTechnologies] = useState('');
  const [badge, setBadge] = useState('');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const alreadyDeployed = deployStatus?.deployed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('repo_name', repo.name);
      formData.append('repo_full_name', repo.full_name);
      formData.append('name_es', nameEs);
      formData.append('name_en', nameEn);
      formData.append('description_es', descEs);
      formData.append('description_en', descEn);
      formData.append('github_link', repo.html_url);
      formData.append('technologies', technologies);
      formData.append('badge', badge);
      // Always deploy to /projects/
      formData.append('deploy', 'true');
      if (image) formData.append('preview_image', image);

      const { data } = await api.post('/admin/provisioning/attach', formData, true);
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

  return (
    <div className="prov-modal-overlay" onClick={onClose}>
      <div className="prov-modal" onClick={e => e.stopPropagation()}>
        <div className="prov-modal-header">
          <h3><FaRocket style={{ marginRight: 8 }} />Desplegar al portfolio</h3>
          <button className="prov-modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="prov-modal-repo-info">
          <FaGithub /> <a href={repo.html_url} target="_blank" rel="noreferrer">{repo.full_name}</a>
        </div>
        {error && <div className="dash-alert dash-alert-error">{error}</div>}

        <div className="prov-modal-deploy-info" style={{ marginBottom: '0.75rem' }}>
          <FaRocket /> {alreadyDeployed
            ? <>Ya desplegado en <code>/projects/{repo.name}</code> — se actualizará</>
            : <>Se clonará a <code>/projects/{repo.name}</code> y estará accesible en <code>thisisrober.es/projects/{repo.name}</code></>
          }
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dash-form-row">
            <div className="dash-form-group"><label>Nombre (ES)</label><input className="dash-input" value={nameEs} onChange={e => setNameEs(e.target.value)} required /></div>
            <div className="dash-form-group"><label>Nombre (EN)</label><input className="dash-input" value={nameEn} onChange={e => setNameEn(e.target.value)} required /></div>
          </div>
          <div className="dash-form-row">
            <div className="dash-form-group"><label>Descripción (ES)</label><textarea className="dash-input" rows={2} value={descEs} onChange={e => setDescEs(e.target.value)} /></div>
            <div className="dash-form-group"><label>Descripción (EN)</label><textarea className="dash-input" rows={2} value={descEn} onChange={e => setDescEn(e.target.value)} /></div>
          </div>
          <div className="dash-form-row">
            <div className="dash-form-group"><label>Tecnologías</label><input className="dash-input" value={technologies} onChange={e => setTechnologies(e.target.value)} placeholder="React, Node.js, Express" /></div>
            <div className="dash-form-group"><label>Badge</label><input className="dash-input" value={badge} onChange={e => setBadge(e.target.value)} placeholder="Nuevo, Destacado..." /></div>
          </div>
          <div className="dash-form-group"><label>Imagen de vista previa</label><input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="dash-input" /></div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="dash-btn dash-btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>
              {saving ? <><div className="dash-spinner-sm" /> Desplegando...</> : <><FaRocket /> Desplegar al portfolio</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================
// Tab: REPOSITORIOS (list all GitHub repos)
// =============================================
function ReposTab() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [visFilter, setVisFilter] = useState('all');
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [detailRepo, setDetailRepo] = useState(null);
  const [deployStatuses, setDeployStatuses] = useState({});

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, status } = await api.get('/admin/provisioning/repos');
      if (status !== 200) throw new Error(data.error || 'Error loading repos');
      setRepos(data);
      const statuses = {};
      for (const repo of data) {
        try {
          const s = await api.get(`/admin/provisioning/deploy-status/${repo.name}`);
          statuses[repo.name] = s.data;
        } catch { /* ignore */ }
      }
      setDeployStatuses(statuses);
    } catch (err) {
      setError(err.message || 'Error al conectar con GitHub');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadRepos(); }, [loadRepos]);

  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
  const inPortfolioCount = repos.filter(r => deployStatuses[r.name]?.attached).length;
  const notInPortfolioCount = repos.length - inPortfolioCount;

  // Filter: hide repos with "thisisrober" in name + apply user filters
  const filtered = repos
    .filter(r => {
      // Always hide repos containing "thisisrober"
      if (r.name.toLowerCase().includes('thisisrober')) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
          !(r.description || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (langFilter && r.language !== langFilter) return false;
      if (visFilter === 'public' && r.private) return false;
      if (visFilter === 'private' && !r.private) return false;
      if (visFilter === 'archived' && !r.archived) return false;
      const st = deployStatuses[r.name];
      if (portfolioFilter === 'in-portfolio' && !st?.attached) return false;
      if (portfolioFilter === 'not-in-portfolio' && st?.attached) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Split into portfolio / not-portfolio groups
  const inPortfolioRepos = filtered.filter(r => deployStatuses[r.name]?.attached);
  const notInPortfolioRepos = filtered.filter(r => !deployStatuses[r.name]?.attached);

  const langOptions = [{ value: '', label: 'Todos los lenguajes' }, ...languages.map(l => ({ value: l, label: l }))];
  const visOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'public', label: 'Públicos' },
    { value: 'private', label: 'Privados' },
    { value: 'archived', label: 'Archivados' },
  ];
  const portfolioOptions = [
    { value: 'all', label: `Portfolio: Todos` },
    { value: 'in-portfolio', label: `En portfolio (${inPortfolioCount})` },
    { value: 'not-in-portfolio', label: `No están en el portfolio (${notInPortfolioCount})` },
  ];

  if (loading) return <div className="dash-center"><div className="dash-spinner" /></div>;
  if (error) return <div className="dash-alert dash-alert-error">{error}</div>;

  const renderRepoCard = (repo) => {
    const status = deployStatuses[repo.name];
    const isInPortfolio = status?.attached;
    return (
      <div
        key={repo.id}
        className={`prov-repo-card prov-repo-card-clickable ${repo.archived ? 'archived' : ''} ${isInPortfolio ? 'in-portfolio' : ''}`}
        onClick={() => setDetailRepo(repo)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setDetailRepo(repo)}
      >
        <div className="prov-repo-header">
          <div className="prov-repo-name">
            {repo.private ? <FaLock className="prov-icon-vis" /> : <FaGlobe className="prov-icon-vis" />}
            <span title={repo.name}>{repo.name}</span>
            {repo.archived && <span className="prov-badge prov-badge-archived"><FaArchive /> Archivado</span>}
          </div>
          <div className="prov-repo-meta">
            {repo.language && <span className="prov-lang">{repo.language}</span>}
            {repo.stargazers_count > 0 && <span className="prov-stat"><FaStar /> {repo.stargazers_count}</span>}
            {repo.forks_count > 0 && <span className="prov-stat"><FaCodeBranch /> {repo.forks_count}</span>}
          </div>
        </div>
        {repo.description && <p className="prov-repo-desc">{repo.description}</p>}
        {repo.topics?.length > 0 && (
          <div className="prov-topics">
            {repo.topics.map(t => <span key={t} className="prov-topic">{t}</span>)}
          </div>
        )}
        <div className="prov-repo-footer">
          <span className="prov-date">
            <FaCalendarAlt style={{ marginRight: 4 }} />
            Creado: {new Date(repo.created_at).toLocaleDateString('es-ES')}
          </span>
          <div className="prov-repo-actions" onClick={e => e.stopPropagation()}>
            {isInPortfolio && (
              <span className="prov-badge prov-badge-attached"><FaCheckCircle /> En portfolio</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Filters */}
      <div className="prov-filters">
        <div className="prov-search">
          <FaSearch className="prov-search-icon" />
          <input
            type="text"
            placeholder="Buscar repositorios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="dash-input"
          />
        </div>
        <CustomSelect value={langFilter} onChange={setLangFilter} options={langOptions} className="prov-select" />
        <CustomSelect value={visFilter} onChange={setVisFilter} options={visOptions} className="prov-select" />
        <CustomSelect value={portfolioFilter} onChange={setPortfolioFilter} options={portfolioOptions} className="prov-select" />
        <button className="dash-btn dash-btn-ghost" onClick={loadRepos} title="Refrescar">
          <FaSync />
        </button>
      </div>

      {/* Stats */}
      <div className="prov-stats">
        <span>{filtered.length} de {repos.length} repos</span>
        <span><FaStar style={{ marginRight: 4 }} />{repos.reduce((s, r) => s + r.stargazers_count, 0)} stars totales</span>
        <span><FaBriefcase style={{ marginRight: 4 }} />{inPortfolioCount} en portfolio</span>
      </div>

      {/* Grouped repo grid */}
      {portfolioFilter === 'all' && inPortfolioRepos.length > 0 && notInPortfolioRepos.length > 0 ? (
        <>
          <div className="prov-group-header">
            <FaBriefcase /> En portfolio <span className="prov-group-count">{inPortfolioRepos.length}</span>
          </div>
          <div className="prov-grid">{inPortfolioRepos.map(renderRepoCard)}</div>

          <div className="prov-group-header prov-group-header-secondary">
            <FaGithub /> No están en el portfolio <span className="prov-group-count">{notInPortfolioRepos.length}</span>
          </div>
          <div className="prov-grid">{notInPortfolioRepos.map(renderRepoCard)}</div>
        </>
      ) : (
        <div className="prov-grid">
          {filtered.map(renderRepoCard)}
          {filtered.length === 0 && (
            <div className="prov-empty">No se encontraron repositorios</div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailRepo && (
        <RepoDetailModal
          repo={detailRepo}
          deployStatus={deployStatuses[detailRepo.name] || {}}
          onClose={() => setDetailRepo(null)}
          onUpdated={() => {
            setDetailRepo(null);
            loadRepos();
          }}
        />
      )}
    </>
  );
}

// =============================================
// Tab: NUEVO REPOSITORIO (create from template)
// =============================================
function NewRepoTab() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/provisioning/templates').then(r => setTemplates(r.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('El nombre es obligatorio');
    if (!selected) return setError('Selecciona una plantilla');

    setCreating(true);
    setError('');
    setResult(null);

    try {
      const { data, status } = await api.post('/admin/provisioning/repos', {
        name: name.trim(),
        description: description.trim(),
        templateId: selected,
        isPrivate,
      });

      if (status !== 200 || data.error) {
        throw new Error(data.error || 'Error creating repository');
      }

      setResult(data.repo);
      setName('');
      setDescription('');
      setSelected(null);
    } catch (err) {
      setError(err.message);
    }
    setCreating(false);
  };

  return (
    <div className="prov-new-repo">
      {result && (
        <div className="dash-alert dash-alert-success">
          ✅ Repositorio <strong>{result.name}</strong> creado correctamente.{' '}
          <a href={result.html_url} target="_blank" rel="noreferrer">Ver en GitHub <FaExternalLinkAlt /></a>
        </div>
      )}
      {error && <div className="dash-alert dash-alert-error">{error}</div>}

      <h3 className="prov-section-title">1. Elige una plantilla</h3>
      <div className="prov-templates">
        {templates.map(t => (
          <div
            key={t.id}
            className={`prov-template-card ${selected === t.id ? 'selected' : ''}`}
            onClick={() => setSelected(t.id)}
          >
            <span className="prov-template-icon">{t.icon}</span>
            <div>
              <strong>{t.name}</strong>
              <p>{t.description}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="prov-section-title">2. Detalles del repositorio</h3>
      <form onSubmit={handleCreate} className="dash-form prov-create-form">
        <div className="dash-form-group">
          <label>Nombre del repositorio *</label>
          <input
            className="dash-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="my-awesome-project"
          />
        </div>
        <div className="dash-form-group">
          <label>Descripción</label>
          <input
            className="dash-input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Breve descripción del proyecto..."
          />
        </div>
        <div className="dash-form-group">
          <label className="prov-checkbox-label">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
            />
            Repositorio privado
          </label>
        </div>
        <button
          type="submit"
          className="dash-btn dash-btn-primary"
          disabled={creating}
        >
          {creating ? <><div className="dash-spinner-sm" /> Creando...</> : <><FaPlus /> Crear repositorio</>}
        </button>
      </form>
    </div>
  );
}

// =============================================
// MAIN PAGE WITH TABS
// =============================================
export default function ProvisioningPage() {
  const [tab, setTab] = useState('repos');
  const [hasDbToken, setHasDbToken] = useState(null); // null = loading
  const [dbUser, setDbUser] = useState(null); // { login, avatar, name } from DB token
  const [pat, setPat] = useState('');
  const [patError, setPatError] = useState('');
  const [validating, setValidating] = useState(false);

  // Page title
  useEffect(() => { document.title = 'Dashboard | Provisioning Stack'; }, []);

  // On mount: check if DB token exists and is valid
  useEffect(() => {
    api.get('/admin/provisioning/auth-status').then(({ data }) => {
      setHasDbToken(data.hasToken);
      if (data.hasToken) {
        setDbUser({ login: data.login, avatar: data.avatar, name: data.name });
      }
    }).catch(() => setHasDbToken(false));
  }, []);

  const handleSaveToken = async () => {
    if (!pat.trim()) return;
    setValidating(true);
    setPatError('');
    try {
      const { data } = await api.post('/admin/provisioning/save-token', { token: pat.trim() });
      if (data.valid) {
        setHasDbToken(true);
        setDbUser({ login: data.login, avatar: data.avatar, name: data.name });
        setPat('');
      } else {
        setPatError(data.message || 'Token inválido. Verifica que tenga permisos de repo.');
      }
    } catch {
      setPatError('Error al validar el token');
    }
    setValidating(false);
  };

  const authLoading = hasDbToken === null;
  const showPatBanner = !authLoading && !hasDbToken;

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <div>
          <h1><FaBox style={{ marginRight: 10 }} />Provisioning Stack</h1>
          <p>Gestiona tus repositorios de GitHub, crea nuevos desde plantillas y adjúntalos al portfolio</p>
        </div>
      </div>

      {/* PAT Banner — only when no valid token in DB */}
      {showPatBanner && (
        <div className="prov-pat-banner">
          <div className="prov-pat-banner-header">
            <FaKey className="prov-pat-icon" />
            <div>
              <strong>Token de GitHub no configurado</strong>
              <p>Introduce un Personal Access Token (PAT) para conectar con GitHub. Se guardará en la configuración del sitio.</p>
            </div>
          </div>
          <div className="prov-pat-input-row">
            <input
              type="password"
              className="dash-input prov-pat-input"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={pat}
              onChange={e => { setPat(e.target.value); setPatError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSaveToken()}
            />
            <button
              className="dash-btn dash-btn-primary"
              onClick={handleSaveToken}
              disabled={validating || !pat.trim()}
            >
              {validating ? <div className="dash-spinner-sm" /> : <FaCheck />}
              Guardar
            </button>
          </div>
          {patError && (
            <div className="prov-pat-error">{patError}</div>
          )}
        </div>
      )}

      {/* GitHub Profile + Heatmap */}
      {!authLoading && hasDbToken && (
        <GitHubProfileCard />
      )}

      {/* Tabs */}
      <div className="prov-tabs">
        <button
          className={`prov-tab ${tab === 'repos' ? 'active' : ''}`}
          onClick={() => setTab('repos')}
        >
          <FaGithub /> Repositorios
        </button>
        <button
          className={`prov-tab ${tab === 'new' ? 'active' : ''}`}
          onClick={() => setTab('new')}
        >
          <FaPlus /> Nuevo repositorio
        </button>
      </div>

      {/* Tab content */}
      <div className="prov-tab-content">
        {authLoading ? (
          <div className="dash-center"><div className="dash-spinner" /></div>
        ) : !hasDbToken ? (
          <div className="prov-empty">Introduce y guarda un PAT de GitHub para continuar</div>
        ) : (
          <>
            {tab === 'repos' && <ReposTab />}
            {tab === 'new' && <NewRepoTab />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
