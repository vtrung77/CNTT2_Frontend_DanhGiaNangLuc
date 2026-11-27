// Tự kiểm tra nhanh Mục 4.1 (không sửa). Chạy: npm run tu-kiem-tra
// Chỉ kiểm tra vài trường hợp cơ bản. Đạt hết ở đây chưa chắc được đủ điểm.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import sampleProducts from '../src/data/sample.js';

const components = import.meta.glob('../src/components/*.jsx', { eager: true });
const ProductTable = components['../src/components/ProductTable.jsx']?.default;

describe('Mục 4.1 – tự kiểm tra', () => {
  it('Có component ProductTable trong src/components/ProductTable.jsx', () => {
    expect(ProductTable, 'Chưa có src/components/ProductTable.jsx (export default)').toBeTypeOf('function');
  });

  it('ProductTable hiển thị đủ 8 sản phẩm mẫu (data-testid="product-row")', () => {
    if (!ProductTable) return expect.fail('Chưa có ProductTable');
    render(
      <MemoryRouter>
        <ProductTable products={sampleProducts} />
      </MemoryRouter>,
    );
    expect(screen.getAllByTestId('product-row')).toHaveLength(8);
  });

  it('Có nhãn trạng thái (data-testid="product-status")', () => {
    if (!ProductTable) return expect.fail('Chưa có ProductTable');
    render(
      <MemoryRouter>
        <ProductTable products={sampleProducts} />
      </MemoryRouter>,
    );
    expect(screen.getAllByTestId('product-status').length).toBeGreaterThan(0);
  });
});
