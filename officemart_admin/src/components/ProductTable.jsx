import ProductRow from './ProductRow';

export default function ProductTable({ products, categoryNames = {} }) {
    return (
        <table data-testid="product-table" className="product-table">
            <thead>
                <tr>
                    <th>Tên</th>
                    <th>SKU</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {products.map((product) => (
                    <ProductRow
                        key={product.id}
                        product={product}
                        categoryName={categoryNames[product.category] || product.category}
                    />
                ))}
            </tbody>
        </table>
    );
}