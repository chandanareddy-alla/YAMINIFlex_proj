import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaImages, FaChartLine } from 'react-icons/fa';
import { api } from '../../api/client';
import './AdminDesigns.css';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
const resolveImage = (src) => (src?.startsWith('http') ? src : `${API_ORIGIN}${src || ''}`);

const AdminDesigns = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  const loadCategories = () => {
    api.get('/admin/categories').then((res) => setCategories(res.data || [])).catch(() => setCategories([]));
  };

  const loadDesigns = () => {
    setLoading(true);
    api
      .get('/admin/designs', {
        page,
        limit: 8,
        category,
        status,
        search,
      })
      .then((res) => {
        setDesigns(res.data || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
        if ((res.data || []).length > 0) {
          setSelectedDesign(res.data[0]);
        } else {
          setSelectedDesign(null);
        }
      })
      .catch(() => {
        setDesigns([]);
        setPagination({ page: 1, totalPages: 1, total: 0 });
        setSelectedDesign(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadDesigns();
  }, [page, category, status, search]);

  const stats = useMemo(() => {
    return {
      total: pagination.total || designs.length,
      active: designs.filter((d) => d.isActive !== false).length,
      featured: designs.filter((d) => d.isFeatured).length,
      categories: categories.length || 0,
    };
  }, [designs, categories, pagination]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this design?')) return;
    try {
      await api.del(`/admin/designs/${id}`);
      loadDesigns();
    } catch (err) {
      alert(err.message || 'Failed to delete design');
    }
  };

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) params.delete(key);
      else params.set(key, value);
    });
    setSearchParams(params);
  };

  return (
    <div className="admin-design-page">
      <section className="admin-design-page-top">
        <div>
          <span className="admin-dashboard-kicker">ADMIN CONSOLE</span>
          <h1>Design Management</h1>
          <span className="admin-page-subtitle">Manage all designs available in the customer catalog. Search, filter, batch publish, and upload high-resolution print files.</span>
        </div>
        <div className="admin-design-page-top-actions">
          <button className="btn btn-outline" onClick={() => updateParams({ page: 1, category: '', status: '', search: '' })}><FaFilter /> Reset Actions</button>
          <button className="btn btn-gold"><FaPlus /> Add New Design</button>
          <Link className="btn btn-primary" to="/admin/designs/add"><FaPlus /> Add New Design</Link>
        </div>
      </section>

      <section className="admin-design-stat-strip">
        <article className="admin-design-stat">
          <span className="admin-design-stat-label">Total Templates</span>
          <span className="admin-design-stat-value">{stats.total}</span>
        </article>
        <article className="admin-design-stat">
          <span className="admin-design-stat-label">Published</span>
          <span className="admin-design-stat-value">{stats.active}</span>
        </article>
        <article className="admin-design-stat">
          <span className="admin-design-stat-label">Featured</span>
          <span className="admin-design-stat-value">{stats.featured}</span>
        </article>
        <article className="admin-design-stat">
          <span className="admin-design-stat-label">Categories</span>
          <span className="admin-design-stat-value">{stats.categories}</span>
        </article>
      </section>

      <section className="admin-design-workspace">
        <section className="admin-design-list-panel">
          <div className="admin-design-filterbar">
            <div className="admin-design-filterbar-left">
              <FaSearch />
              <input className="form-input admin-search" placeholder="Search design" value={search} onChange={(e) => updateParams({ search: e.target.value, page: 1 })} />
              <select className="form-select" value={category} onChange={(e) => updateParams({ category: e.target.value, page: 1 })}>
                <option value="">All Categories</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
              <select className="form-select" value={status} onChange={(e) => updateParams({ status: e.target.value, page: 1 })}>
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            <Link className="btn btn-primary" to="/admin/designs/add"><FaPlus /> Add Design</Link>
          </div>

          {loading ? (
            <div className="dashboard-loader">Loading designs...</div>
          ) : (
            <>
              <div className="admin-design-table-wrap">
                <table className="admin-design-table">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Design</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {designs.map((design) => (
                      <tr key={design._id}>
                        <td><img className="admin-design-thumb" src={resolveImage(design.thumbnail)} alt={design.title} /></td>
                        <td>
                          <span className="admin-design-title">{design.title}</span>
                          <div className="small-text">#{design._id.slice(-6).toUpperCase()}</div>
                        </td>
                        <td><span className="admin-design-category">{design.category?.name || 'General'}</span></td>
                        <td><span className="admin-design-price">₹{Number(design.price || 0).toLocaleString('en-IN')}</span></td>
                        <td><span className={`admin-design-status ${design.isActive === false ? 'hidden' : 'published'}`}>{design.isActive === false ? 'Hidden' : 'Published'}</span></td>
                        <td>{design.createdAt ? new Date(design.createdAt).toLocaleDateString() : 'Today'}</td>
                        <td>
                          <div className="admin-design-actions">
                            <button title="Preview" onClick={() => setSelectedDesign(design)}><FaEye /></button>
                            <Link title="Edit" to={`/admin/designs/edit/${design._id}`}><FaEdit /></Link>
                            <button title="Delete" onClick={() => handleDelete(design._id)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-design-pagination">
                <button className={page <= 1 ? 'disabled' : ''} disabled={page <= 1} onClick={() => updateParams({ page: Math.max(1, page - 1) })}>Previous</button>
                <span className="page-number">{page}</span>
                <button className={page >= pagination.totalPages ? 'disabled' : ''} disabled={page >= pagination.totalPages} onClick={() => updateParams({ page: page + 1 })}>Next</button>
              </div>
            </>
          )}
        </section>

        <aside className="admin-design-preview">
          <div className="admin-design-preview-title">Design Details</div>
          {selectedDesign ? (
            <>
              <div className="admin-design-preview-image">
                <img src={resolveImage(selectedDesign.fullImage || selectedDesign.thumbnail)} alt={selectedDesign.title} />
              </div>
              <div className="admin-design-preview-details">
                <div className="row"><span>Design ID</span><span>#{selectedDesign._id?.slice(-6).toUpperCase()}</span></div>
                <div className="row"><span>Title</span><span>{selectedDesign.title}</span></div>
                <div className="row"><span>Category</span><span>{selectedDesign.category?.name || 'General'}</span></div>
                <div className="row"><span>Price</span><span>₹{Number(selectedDesign.price || 0).toLocaleString('en-IN')}</span></div>
                <div className="row"><span>Status</span><span>{selectedDesign.isActive === false ? 'Hidden' : 'Published'}</span></div>
                <div className="row"><span>Featured</span><span>{selectedDesign.isFeatured ? 'Yes' : 'No'}</span></div>
                <div className="row"><span>Tags</span><span>{(selectedDesign.tags || []).join(', ') || 'None'}</span></div>
              </div>
              <div className="admin-design-actions">
                <Link className="btn btn-primary" to={`/admin/designs/edit/${selectedDesign._id}`}><FaEdit /> Edit</Link>
                <button className="btn btn-gold" onClick={() => handleDelete(selectedDesign._id)}><FaTrash /> Delete</button>
              </div>
            </>
          ) : (
            <div className="empty-state">No design selected.</div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default AdminDesigns;
