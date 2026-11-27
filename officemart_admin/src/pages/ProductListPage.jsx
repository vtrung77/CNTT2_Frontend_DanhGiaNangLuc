import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosClient';
import ProductTable from '../components/ProductTable';

export default function ProductListPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [categoryNames, setCategoryNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(location.state?.toast || '');

    // Tự động ẩn toast sau 3 giây và xóa state lịch sử để F5 không hiện lại
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(''), 3000);
        if (location.state?.toast) {
            navigate(location.pathname, { replace: true, state: {} });
        }
        return () => clearTimeout(timer);
    }, [toast, location, navigate]);

    async function fetchData() {
        setLoading(true);
        setError('');
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products', { params: { page: 1, limit: 10 } }),
                api.get('/categories'),
            ]);

            setProducts(prodRes.data.data || []);

            // Chuyển mảng [{ id, name }] thành object { id: name }
            const map = {};
            (catRes.data || []).forEach((c) => {
                map[c.id] = c.name;
            });
            setCategoryNames(map);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function handleConfirmDelete() {
        if (!deleteTarget || deleting) return;
        setDeleting(true);
        try {
            await api.delete(`/products/${deleteTarget.id}`);
            setProducts((prev) => prev.filter((item) => item.id !== deleteTarget.id));
            setDeleteTarget(null);
            setToast('Đã xoá sản phẩm');
        } catch (err) {
            setError(err.response?.data?.message || 'Xoá sản phẩm thất bại');
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="page-container">
            {toast && (
                <div data-testid="toast" className="toast-banner">
                    {toast}
                </div>
            )}

            <div className="page-header">
                <h1>Sản phẩm</h1>
                <button
                    type="button"
                    data-testid="add-button"
                    className="btn-primary"
                    onClick={() => navigate('/products/new')}
                >
                    Thêm sản phẩm
                </button>
            </div>

            {loading && <div data-testid="loading">Đang tải...</div>}

            {!loading && error && (
                <div className="error-box">
                    <div data-testid="error-message">{error}</div>
                    <button
                        type="button"
                        data-testid="retrybutton"
                        className="btn-primary"
                        onClick={fetchData}
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div data-testid="empty-state" className="empty-box">
                    Không có sản phẩm nào.
                </div>
            )}

            {!loading && !error && products.length > 0 && (
                <ProductTable
                    products={products}
                    categoryNames={categoryNames}
                    onEdit={(id) => navigate(`/products/${id}/edit`)}
                    onDelete={(product) => setDeleteTarget(product)}
                />
            )}

            {/* Hộp thoại xác nhận xoá tự làm */}
            {deleteTarget && (
                <div className="modal-backdrop">
                    <div data-testid="confirm-dialog" className="confirm-dialog">
                        <h3>Xác nhận xoá</h3>
                        <p>
                            Bạn có chắc chắn muốn xoá sản phẩm <strong>{deleteTarget.name}</strong>?
                        </p>
                        <div className="form-actions">
                            <button
                                type="button"
                                data-testid="confirm-no"
                                className="btn-edit"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                Huỷ
                            </button>
                            <button
                                type="button"
                                data-testid="confirm-yes"
                                className="btn-delete"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Đang xoá...' : 'Đồng ý'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}