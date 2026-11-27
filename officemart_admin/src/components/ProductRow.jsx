export default function ProductRow({ product, categoryName }) {
    const formattedPrice =
        new Intl.NumberFormat('vi-VN').format(product.price) + ' ₫';

    const isActive = product.status === 'active';

    return (
        <tr data-testid="product-row">
            <td data-label="Tên">{product.name}</td>
            <td data-label="SKU">{product.sku}</td>
            <td data-label="Danh mục">{categoryName}</td>
            <td data-label="Giá">{formattedPrice}</td>
            <td data-label="Tồn kho">
                {product.stock === 0 ? (
                    <span className="stock-empty">Hết hàng</span>
                ) : (
                    product.stock
                )}
            </td>
            <td data-label="Trạng thái">
                <span
                    data-testid="product-status"
                    className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}
                >
                    {isActive ? 'Đang bán' : 'Ngừng bán'}
                </span>
            </td>
            <td data-label="Thao tác">
                <div className="action-group">
                    <button type="button" data-testid="edit-button" className="btn-edit">
                        Sửa
                    </button>
                    <button type="button" data-testid="delete-button" className="btn-delete">
                        Xoá
                    </button>
                </div>
            </td>
        </tr>
    );
}