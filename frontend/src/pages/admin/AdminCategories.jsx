import { useEffect, useMemo, useState } from 'react';
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaSearch,
  FaTimes,
  FaImage,
  FaFolder,
  FaBoxes,
  FaClipboardList,
} from 'react-icons/fa';
import { api } from '../../api/client';
import Loader from '../../components/Loader';
import './AdminTable.css';
import './AdminCategories.css';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  image: '',
  isActive: true,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCategories = () => {
    setLoading(true);
    setError('');
    api
      .get('/admin/categories')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setCategories(data);
      })
      .catch((err) => setError(err.message || 'Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((cat) => {
      return [cat.name, cat.slug, cat.description, cat.image]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [categories, searchTerm]);

  const totalDesigns = categories.reduce((sum, cat) => sum + Number(cat.designCount || 0), 0);
  const visible = categories.filter((cat) => cat.isActive !== false).length;
  const hidden = categories.length - visible;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCategory(null);
    setError('');
  };

  const openCreate = () => {
    resetForm();
    setSelectedCategory(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/categories', {
        name: form.name,
        slug: form.slug,
        description: form.description,
        isActive: form.isActive,
      });
      resetForm();
      loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive !== false,
    });
    setSelectedCategory(cat);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory?._id) return;
    setError('');
    try {
      await api.put(`/admin/categories/${editingCategory._id}`, {
        name: form.name,
        slug: form.slug,
        description: form.description,
        isActive: form.isActive,
      });
      resetForm();
      loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.del(`/admin/categories/${id}`);
      setSelectedCategory(null);
      resetForm();
      loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="admin-categories-page">
      <section className="admin-category-shell">
        <div className="admin-category-breadcrumb">
          <span>Admin Console</span>
          <span className="crumb-sep">›</span>
          <span>Catalog</span>
          <span className="crumb-sep">›</span>
          <span className="crumb-current">Category Management</span>
        </div>

        <section className="admin-category-title-zone">
          <div>
            <h1 className="admin-category-title">Category Management</h1>
            <p className="admin-category-subtitle">
              Organize and structure 5,420+ flex templates into curated catalog categories. Control visibility,
              default substrate presets, and browse priority for online &amp; studio desk ordering in Cherukupalli.
            </p>
          </div>
          <button className="admin-category-create" onClick={openCreate}><FaPlus /> Add Category</button>
        </section>

        <section className="admin-category-summary">
          <article className="summary-card summary-card-total">
            <span className="summary-icon"><FaFolder /></span>
            <div>
              <span className="summary-label">Total Categories</span>
              <span className="summary-value">{categories.length}</span>
              <span className="summary-help">{visible} Active / {hidden} Hidden</span>
            </div>
          </article>

          <article className="summary-card summary-card-designs">
            <span className="summary-icon"><FaImage /></span>
            <div>
              <span className="summary-label">Catalog Flex Items</span>
              <span className="summary-value">{totalDesigns.toLocaleString('en-IN')}</span>
              <span className="summary-help">Templates</span>
            </div>
          </article>

          <article className="summary-card summary-card-share">
            <span className="summary-icon"><FaClipboardList /></span>
            <div>
              <span className="summary-label">Top Volume Share</span>
              <span className="summary-value">{categories[0]?.name || 'Marriage / Kalyanam'}</span>
              <span className="summary-help">{categories[0]?.designCount || 0} designs</span>
            </div>
          </article>

          <article className="summary-card summary-card-linked">
            <span className="summary-icon"><FaBoxes /></span>
            <div>
              <span className="summary-label">Category Health</span>
              <span className="summary-value">{Math.round((visible / Math.max(categories.length, 1)) * 100)}%</span>
              <span className="summary-help">Asset-linked</span>
            </div>
          </article>
        </section>

        <section className="admin-category-manage">
          <div className="admin-category-list-top">
            <div className="admin-category-tabs">
              <button className="filter-chip active">All Categories ({categories.length})</button>
              <button className="filter-chip">Active ({visible})</button>
              <button className="filter-chip">Hidden ({hidden})</button>
            </div>

            <div className="admin-category-search">
              <FaSearch />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by English/Telugu..." />
            </div>
          </div>

          <div className="category-grid-wrap">
            <table className="admin-category-table">
              <thead>
                <tr>
                  <th><input type="checkbox" aria-label="Select all" /></th>
                  <th>Category Artwork &amp; Name</th>
                  <th>Slug / Path</th>
                  <th>Linked Designs</th>
                  <th>Default Substrate</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8"><Loader /></td></tr>
                ) : filteredCategories.length === 0 ? (
                  <tr><td colSpan="8" className="no-results">No categories found</td></tr>
                ) : (
                  filteredCategories.map((cat, idx) => (
                    <tr key={cat._id} className={selectedCategory?._id === cat._id ? 'selected-category-row' : ''}>
                      <td><input type="checkbox" aria-label={`Select ${cat.name}`} /></td>
                      <td className="category-art-cell">
                        <div className="category-art">
                          <span className="category-art-thumb">
                            {cat.image ? <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`.replace('/api', '') + cat.image} alt="" /> : <FaImage />}
                          </span>
                          <span className="category-name">
                            <span className="category-title">{cat.name}</span>
                            <span className="category-slug">/{cat.slug}</span>
                          </span>
                        </div>
                      </td>
                      <td className="slug-cell"><span className="slug-line">/{cat.slug}</span></td>
                      <td className="design-count-cell">
                        <span className="design-count">{cat.designCount || 0}</span>
                        <span className="design-label">designs</span>
                      </td>
                      <td className="substate-cell">
                        <span className="substate-label">{cat.description || 'Flex / Premium'}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${cat.isActive === false ? 'hidden' : 'active'}`}>{cat.isActive === false ? 'Hidden' : 'Active'}</span>
                      </td>
                      <td className="order-no">#{idx + 1}</td>
                      <td className="category-action-cell">
                        <button className="icon-action" title="Review" onClick={() => { setSelectedCategory(cat); }}><FaEye /></button>
                        <button className="icon-action" title="Edit" onClick={() => handleEdit(cat)}><FaEdit /></button>
                        <button className="icon-action danger" title="Delete" onClick={() => handleDelete(cat._id)}><FaTrash /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-category-pagination">
            <span>Showing {filteredCategories.length} of {categories.length} categories</span>
            <span className="page-buttons">
              <button className="mini-btn">Previous</button>
              <span className="page-number">1</span>
              <button className="mini-btn">Next</button>
            </span>
          </div>
        </section>
      </section>

      {(selectedCategory || editingCategory) && (
        <section className="admin-category-modal-wrap">
          <div className="admin-category-modal">
            <div className="admin-category-modal-head">
              <span className="modal-title"><FaImage /> {editingCategory ? 'Edit Category' : 'Review Category'} - {selectedCategory?.name || editingCategory?.name}</span>
              <button className="modal-close" onClick={() => { setSelectedCategory(null); setEditingCategory(null); resetForm(); }}><FaTimes /></button>
            </div>

            <div className="admin-category-modal-body">
              {error && <div className="category-error">{error}</div>}

              <form className="admin-category-form" onSubmit={editingCategory ? handleUpdate : handleCreate}>
                <label className="form-group">
                  <span>Category Title</span>
                  <input name="name" value={form.name} onChange={handleChange} required />
                </label>

                <label className="form-group">
                  <span>Slug / URL</span>
                  <input name="slug" value={form.slug} onChange={handleChange} required />
                </label>

                <label className="form-group full">
                  <span>Description</span>
                  <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
                </label>

                <label className="form-group">
                  <span>Image Url</span>
                  <input name="image" value={form.image} onChange={handleChange} />
                </label>

                <label className="form-group">
                  <span>Status</span>
                  <select name="isActive" value={form.isActive ? 'active' : 'hidden'} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === 'active' }))}>
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </label>

                <div className="modal-action-bar">
                  <button type="button" className="cancel-btn" onClick={() => { setSelectedCategory(null); setEditingCategory(null); resetForm(); }}>Cancel</button>
                  <button type="submit" className="save-btn">{editingCategory ? 'Save Category' : 'Create Category'}</button>
                </div>
              </form>

              <div className="category-review-card">
                <div className="category-review-head">
                  <span><FaEye /> Review</span>
                </div>
                <div className="category-review-content">
                  <div className="category-review-image">
                    {selectedCategory?.image ? <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`.replace('/api', '') + selectedCategory.image} alt="" /> : <FaImage />}
                  </div>
                  <div>
                    <div className="category-review-title">{selectedCategory?.name || form.name}</div>
                    <div className="category-review-slug">/{selectedCategory?.slug || form.slug}</div>
                    <div className="category-review-meta">{selectedCategory?.description || form.description || 'No description available'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminCategories;
