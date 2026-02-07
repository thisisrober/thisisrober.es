import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import BlogHeader from '../../components/blog/BlogHeader';
import BlogFooter from '../../components/blog/BlogFooter';
import PostCard from '../../components/blog/PostCard';
import BlogSidebar from '../../components/blog/BlogSidebar';

export default function BlogCategory() {
  const { slug } = useParams();
  const { t, lang } = useTranslation();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'thisisrober - Blog'; }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/blog/categories/${slug}`),
      api.get(`/blog/posts?limit=50`),
    ]).then(([catRes, postsRes]) => {
      setCategory(catRes.data);
      if (catRes.data?.id) {
        const filtered = postsRes.data.posts.filter(p => p.category_id === catRes.data.id);
        setPosts(filtered);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="blog-page">
      <BlogHeader />
      <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>
    </div>
  );

  const catName = category ? (lang === 'es' ? category.name_es : category.name_en) : '';
  const catDesc = category ? (lang === 'es' ? category.description_es : category.description_en) : '';

  return (
    <div className="blog-page">
      <BlogHeader />
      <div className="blog-hero">
        <div className="container">
          <h1>{catName}</h1>
          {catDesc && <p>{catDesc}</p>}
        </div>
      </div>
      <div className="container">
        <nav className="breadcrumb-nav mb-3 mt-3">
          <Link to="/blog">Blog</Link>
          <span className="mx-2">›</span>
          <span style={{ color: 'var(--text-muted)' }}>{catName}</span>
        </nav>
        <div className="blog-layout">
          <main className="blog-content">
            {posts.length > 0 ? (
              <div className="posts-list">
                {posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>
            ) : (
              <p className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                {lang === 'es' ? 'No hay posts en esta categoría aún.' : 'No posts in this category yet.'}
              </p>
            )}
          </main>
          <BlogSidebar />
        </div>
      </div>
      <BlogFooter />
    </div>
  );
}
