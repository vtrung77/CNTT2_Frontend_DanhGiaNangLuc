import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';

export default function ProductFormPage() {
    const { id } = useParams(); // Nếu có id => chế độ Sửa; không có => Thêm mới
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        stock: '',
        status: 'active',
    });
    const [errors, setErrors] = useState({});
    const [loadingData, setLoadingData] = useState(isEdit);
    const [notFound, setNotFound] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Luôn lấy danh sách danh mục từ API
        api
            .get('/categories')
            .then((res) => setCategories(res.data))
            .catch(() => { });

        // Nếu là trang Sửa thì lấy thông tin chi tiết sản phẩm
        if (isEdit) {
            setLoadingData(true);
            api
                .get(`/products/${id}`)
                .then((res) => {
                    const p = res.data;
                    setForm({
                        name: p.name ?? '',
                        sku: p.sku ?? '',
                        category: p.category ?? '',
                        price: p.price ?? '',
                        stock: p.stock ?? '',
                        status: p.status ?? 'active',
                    });
                })
                .catch((err) => {
                    if (err.response?.status === 404) {
                        setNotFound(true);
                    }
                })
                .finally(() => setLoadingData(false));
        }
    }, [id, isEdit]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Xóa thông báo lỗi của trường đang sửa
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    }

    function validate() {
        const errs = {};
        const trimmedName = form.name.trim();
        if (trimmedName.length < 3 || trimmedName.length > 100) {
            errs.name = 'Tên sản phẩm phải từ 3 đến 100 ký tự';
        }

        if (!/^[A-Z]{3}-\d{4}$/.test(form.sku.trim())) {
            errs.sku = 'SKU phải đúng định dạng ABC-1234 (3 chữ in hoa, gạch ngang, 4 số)';
        }

        if (!form.category) {
            errs.category = 'Vui lòng chọn danh mục';
        }

        const priceNum = Number(form.price);
        if (form.price === '' || Number.isNaN(priceNum) || priceNum <= 0) {
            errs.price = 'Giá bán phải là số lớn hơn 0';
        }

        const stockNum = Number(form.stock);
        if (
            form.stock === '' ||
            Number.isNaN(stockNum) ||
            !Number.isInteger(stockNum) ||
            stockNum < 0
        ) {
            errs.stock = 'Tồn kho phải là số nguyên không âm';
        }

        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (saving) return;

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSaving(true);
        const payload = {
            name: form.name.trim(),
            sku: form.sku.trim(),
            category: form.category,
            price: Number(form.price),
            stock: Number(form.stock),
            status: form.status,
        };

        try {
            if (isEdit) {
                await api.put(`/products/${id}`, payload);
                navigate('/products', { state: { toast: 'Đã cập nhật sản phẩm' } });
            } else {
                await api.post('/products', payload);
                navigate('/products', { state: { toast: 'Đã thêm sản phẩm' } });
            }
        } catch (err) {
            if (err.response?.status === 409) {
                setErrors((prev) => ({
                    ...prev,
                    sku: err.response.data?.message || 'Mã SKU đã tồn tại',
                }));
            } else if (err.response?.status === 404) {
                setNotFound(true);
            } else if (err.response?.status === 400 && err.response.data?.field) {
                setErrors((prev) => ({
                    ...prev,
                    [err.response.data.field]: err.response.data.message,
                }));
            }
        } finally {
            setSaving(false);
        }
    }

    if (loadingData) {
        return <div data-testid="loading">Đang tải dữ liệu...</div>;
    }

    if (notFound) {
        return (
            <div className="page-container">
                <div data-testid="error-message" className="error-box">
                    Không tìm thấy sản phẩm
                </div>
                <button type="button" className="btn-edit" onClick={() => navigate('/products')}>
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
            </div>

            <form data-testid="product-form" className="product-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="field-name">Tên sản phẩm</label>
                    <input
                        id="field-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                    />
                    {errors.name && (
                        <span data-testid="field-error-name" className="field-error">
                            {errors.name}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="field-sku">Mã SKU</label>
                    <input
                        id="field-sku"
                        name="sku"
                        type="text"
                        placeholder="VD: KEY-0001"
                        value={form.sku}
                        onChange={handleChange}
                    />
                    {errors.sku && (
                        <span data-testid="field-error-sku" className="field-error">
                            {errors.sku}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="field-category">Danh mục</label>
                    <select
                        id="field-category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                    >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <span data-testid="field-error-category" className="field-error">
                            {errors.category}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="field-price">Giá bán (VNĐ)</label>
                    <input
                        id="field-price"
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                    />
                    {errors.price && (
                        <span data-testid="field-error-price" className="field-error">
                            {errors.price}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="field-stock">Tồn kho</label>
                    <input
                        id="field-stock"
                        name="stock"
                        type="number"
                        value={form.stock}
                        onChange={handleChange}
                    />
                    {errors.stock && (
                        <span data-testid="field-error-stock" className="field-error">
                            {errors.stock}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="field-status">Trạng thái</label>
                    <select
                        id="field-status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                    >
                        <option value="active">Đang bán</option>
                        <option value="inactive">Ngừng bán</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-edit"
                        onClick={() => navigate('/products')}
                    >
                        Huỷ
                    </button>
                    <button
                        type="submit"
                        data-testid="submit-button"
                        className="btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </form>
        </div>
    );
}