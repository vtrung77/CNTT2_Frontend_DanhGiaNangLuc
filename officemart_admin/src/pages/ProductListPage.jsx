import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient';
import useProductSearch from '../hooks/useProductSearch';
import ProductTable from '../components/ProductTable';

export default function ProductListPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const qParam = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || '';
    const statusParam = searchParams.get('status') || '';
    const rawPage = searchParams.get('page');
    const parsedPage = rawPage === null || rawPage === '' ? 1 : Number.parseInt(rawPage, 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    const [searchInput, setSearchInput] = useState(qParam);
    const [categories, setCategories] = useState([]);
    const [categoryNames, setCategoryNames] = useState({});
    const [deleteError, setDeleteError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [pageDataReady, setPageDataReady] = useState(false);
    const [toast, setToast] = useState(location.state?.toast || '');

    const { data: products, total, loading, error: searchError } = useProductSearch({
        q: qParam,
        category: categoryParam,
        status: statusParam,
        page,
        limit: 10,
        reloadTrigger,
    });

    const totalPages = Math.max(1, Math.ceil(total / 10));

    useEffect(() => {
        setSearchInput(qParam);
    }, [qParam]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const nextValue = searchInput.trim();
            if (nextValue !== qParam) {
                const next = new URLSearchParams(searchParams);
                if (nextValue) next.set('q', nextValue);
                else next.delete('q');
                next.set('page', '1');
                setSearchParams(next);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput, qParam, searchParams, setSearchParams]);

    useEffect(() => {
        let cancelled = false;
        api.get('/categories')
            .then((res) => {
                if (cancelled) return;
                const list = res.data || [];
                setCategories(list);
                const map = {};
                list.forEach((category) => {
                    map[category.id] = category.name;
                });
                setCategoryNames(map);
            })
            .catch(() => {
                if (!cancelled) {
                    setCategories([]);
                    setCategoryNames({});
                }
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(''), 3000);
        if (location.state?.toast) {
            navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
        }
        return () => clearTimeout(timer);
    }, [toast, location, navigate]);

    useEffect(() => {
        setPageDataReady(false);
    }, [qParam, categoryParam, statusParam, page, reloadTrigger]);

    useEffect(() => {
        if (!loading) setPageDataReady(true);
    }, [loading]);

    useEffect(() => {
        if (rawPage === null || rawPage === '' || !Number.isInteger(parsedPage) || parsedPage < 1) {
            const next = new URLSearchParams(searchParams);
            next.set('page', '1');
            setSearchParams(next, { replace: true });
            return;
        }

        if (pageDataReady && page > totalPages) {
            const next = new URLSearchParams(searchParams);
            next.set('page', String(totalPages));
            setSearchParams(next, { replace: true });
        }
    }, [rawPage, parsedPage, page, pageDataReady, totalPages, searchParams, setSearchParams]);

    function updateFilter(name, value) {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(name, value);
        else next.delete(name);
        next.set('page', '1');
        setSearchParams(next);
    }

    function changePage(nextPage) {
        const next = new URLSearchParams(searchParams);
        next.set('page', String(nextPage));
        setSearchParams(next);
    }

    async function handleConfirmDelete() {
        if (!deleteTarget || deleting) return;
        setDeleting(true);
        setDeleteError('');
        try {
            await api.delete(`/products/${deleteTarget.id}`);
            setDeleteTarget(null);
            setToast('Đã xoá sản phẩm');
            setReloadTrigger((value) => value + 1);
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Xoá sản phẩm thất bại');
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }

    const displayedError = deleteError || searchError;

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

            <div className="search-filter-bar">
                <input
                    type="search"
                    data-testid="search-input"
                    className="search-input"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                />
                <select
                    data-testid="category-filter"
                    className="filter-select"
                    value={categoryParam}
                    onChange={(event) => updateFilter('category', event.target.value)}
                >
                    <option value="">Tất cả</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                <select
                    data-testid="status-filter"
                    className="filter-select"
                    value={statusParam}
                    onChange={(event) => updateFilter('status', event.target.value)}
                >
                    <option value="">Tất cả</option>
                    <option value="active">Đang bán</option>
                    <option value="inactive">Ngừng bán</option>
                </select>
            </div>

            {loading && <div data-testid="loading">Đang tải...</div>}

            {!loading && displayedError && (
                <div className="error-box">
                    <div data-testid="error-message">{displayedError}</div>
                    <button
                        type="button"
                        data-testid="retrybutton"
                        className="btn-primary"
                        onClick={() => setReloadTrigger((value) => value + 1)}
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {!loading && !displayedError && products.length === 0 && (
                <div data-testid="empty-state" className="empty-box">
                    Không có sản phẩm nào.
                </div>
            )}

            {!loading && !displayedError && products.length > 0 && (
                <ProductTable
                    products={products}
                    categoryNames={categoryNames}
                    onEdit={(id) => navigate(`/products/${id}/edit`)}
                    onDelete={(product) => setDeleteTarget(product)}
                />
            )}

            {!loading && !displayedError && (
                <div data-testid="pagination" className="pagination">
                    <button
                        type="button"
                        data-testid="page-prev"
                        onClick={() => changePage(Math.max(1, page - 1))}
                        disabled={page <= 1}
                    >
                        Trước
                    </button>
                    <span data-testid="page-current">{page} / {totalPages}</span>
                    <button
                        type="button"
                        data-testid="page-next"
                        onClick={() => changePage(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                    >
                        Sau
                    </button>
                </div>
            )}

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