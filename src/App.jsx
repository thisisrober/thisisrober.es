import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop';
import PortfolioPage from './pages/PortfolioPage';
import BlogHome from './pages/blog/BlogHome';
import BlogPost from './pages/blog/BlogPost';
import BlogCategory from './pages/blog/BlogCategory';
import UnsubscribePage from './pages/blog/UnsubscribePage';

// Dashboard
import DashLoginPage from './pages/dashboard/LoginPage';
import OverviewPage from './pages/dashboard/OverviewPage';
import DashPostsPage from './pages/dashboard/PostsPage';
import DashNewPostPage from './pages/dashboard/NewPostPage';
import DashEditPostPage from './pages/dashboard/EditPostPage';
import DashCategoriesPage from './pages/dashboard/CategoriesPage';
import DashSubscribersPage from './pages/dashboard/SubscribersPage';
import DashProjectsPage from './pages/dashboard/ProjectsPage';
import DashExperiencePage from './pages/dashboard/ExperiencePage';
import DashCertificationsPage from './pages/dashboard/CertificationsPage';
import DashSettingsPage from './pages/dashboard/SettingsPage';
import DashPromptsPage from './pages/dashboard/PromptsPage';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

function AnimatedPage({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ width: '100%' }}>
      {children}
    </motion.div>
  );
}

/* Gate that protects dashboard routes:
   - While checking session → dark fullscreen (no layout dependency)
   - Not logged in → redirect to /dashboard/login
   - Logged in → render the page */
function RequireAuth({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{ background: '#0a0b10', minHeight: '100vh' }} />;
  if (!admin) return <Navigate to="/dashboard/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/dashboard/login" element={<DashLoginPage />} />
          <Route path="/dashboard" element={<RequireAuth><OverviewPage /></RequireAuth>} />
          <Route path="/dashboard/posts" element={<RequireAuth><DashPostsPage /></RequireAuth>} />
          <Route path="/dashboard/posts/new" element={<RequireAuth><DashNewPostPage /></RequireAuth>} />
          <Route path="/dashboard/posts/edit/:id" element={<RequireAuth><DashEditPostPage /></RequireAuth>} />
          <Route path="/dashboard/categories" element={<RequireAuth><DashCategoriesPage /></RequireAuth>} />
          <Route path="/dashboard/subscribers" element={<RequireAuth><DashSubscribersPage /></RequireAuth>} />
          <Route path="/dashboard/projects" element={<RequireAuth><DashProjectsPage /></RequireAuth>} />
          <Route path="/dashboard/experience" element={<RequireAuth><DashExperiencePage /></RequireAuth>} />
          <Route path="/dashboard/certifications" element={<RequireAuth><DashCertificationsPage /></RequireAuth>} />
          <Route path="/dashboard/settings" element={<RequireAuth><DashSettingsPage /></RequireAuth>} />
          <Route path="/dashboard/prompts" element={<RequireAuth><DashPromptsPage /></RequireAuth>} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><PortfolioPage /></AnimatedPage>} />
          <Route path="/blog" element={<AnimatedPage><BlogHome /></AnimatedPage>} />
          <Route path="/blog/post/:slug" element={<AnimatedPage><BlogPost /></AnimatedPage>} />
          <Route path="/blog/category/:slug" element={<AnimatedPage><BlogCategory /></AnimatedPage>} />
          <Route path="/blog/unsubscribe" element={<AnimatedPage><UnsubscribePage /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
