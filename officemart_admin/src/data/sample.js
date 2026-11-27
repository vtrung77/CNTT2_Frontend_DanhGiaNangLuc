// 8 sản phẩm mẫu cho Mục 4.1 (không sửa). Trường category là id danh mục; tên hiển thị lấy trong categoryNames.
export const categoryNames = {
  keyboard: 'Bàn phím',
  mouse: 'Chuột',
  monitor: 'Màn hình',
  desk: 'Bàn làm việc',
  chair: 'Ghế văn phòng',
};

const sampleProducts = [
  { id: 1, name: 'Bàn phím cơ K87', sku: 'KEY-0001', category: 'keyboard', price: 1290000, stock: 35, status: 'active', createdAt: '2026-07-01T09:00:00.000Z' },
  { id: 2, name: 'Chuột không dây M220', sku: 'MOU-0002', category: 'mouse', price: 170000, stock: 12, status: 'active', createdAt: '2026-07-01T18:00:00.000Z' },
  { id: 3, name: 'Màn hình 24 inch FHD', sku: 'MON-0003', category: 'monitor', price: 2060000, stock: 0, status: 'active', createdAt: '2026-07-02T03:00:00.000Z' },
  { id: 4, name: 'Bàn làm việc gỗ 120cm', sku: 'DSK-0004', category: 'desk', price: 3180000, stock: 6, status: 'active', createdAt: '2026-07-02T12:00:00.000Z' },
  { id: 5, name: 'Ghế lưới văn phòng', sku: 'CHR-0005', category: 'chair', price: 1300000, stock: 18, status: 'inactive', createdAt: '2026-07-02T21:00:00.000Z' },
  { id: 6, name: 'Bàn phím cơ K104', sku: 'KEY-0006', category: 'keyboard', price: 790000, stock: 40, status: 'active', createdAt: '2026-07-03T06:00:00.000Z' },
  { id: 7, name: 'Chuột công thái học Vertical', sku: 'MOU-0007', category: 'mouse', price: 200000, stock: 9, status: 'inactive', createdAt: '2026-07-03T15:00:00.000Z' },
  { id: 8, name: 'Màn hình 27 inch 2K', sku: 'MON-0008', category: 'monitor', price: 3820000, stock: 3, status: 'active', createdAt: '2026-07-04T00:00:00.000Z' },
];

export default sampleProducts;
