import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaLock, FaArrowRight } from 'react-icons/fa';

export default function DashLoginPage() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (admin) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(form.username, form.password, remember);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="dash-login-page">
      <div className="dash-login-bg">
        <div className="dash-login-orb dash-login-orb-1" />
        <div className="dash-login-orb dash-login-orb-2" />
      </div>
      <div className="dash-login-card">
        <div className="dash-login-header">
          <Link to="/" className="dash-login-brand">thisisrober<span>.es</span></Link>
          <h1>Bienvenido</h1>
          <p>Inicia sesión en el panel</p>
        </div>

        {error && <div className="dash-login-alert dash-login-alert-error">{error}</div>}

        <form onSubmit={handleLogin} autoComplete="on">
          <div className="dash-login-field">
            <FaUser className="dash-login-field-icon" />
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              value={form.username}
              onChange={handleChange}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="dash-login-field">
            <FaLock className="dash-login-field-icon" />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <label className="dash-login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Mantener sesión iniciada</span>
          </label>

          <button type="submit" className="dash-login-btn" disabled={loading}>
            {loading ? (
              <span className="dash-spinner-sm" />
            ) : (
              <>
                Iniciar sesión
                <FaArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
