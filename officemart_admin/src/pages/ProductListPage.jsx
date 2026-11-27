import sampleProducts, { categoryNames } from '../data/sample';
import ProductTable from '../components/ProductTable';

export default function ProductListPage() {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Sản phẩm</h1>
                <button type="button" data-testid="add-button" className="btn-primary">
                    Thêm sản phẩm
                </button>
            </div>

            <ProductTable products={sampleProducts} categoryNames={categoryNames} />
        </div>
    );
}