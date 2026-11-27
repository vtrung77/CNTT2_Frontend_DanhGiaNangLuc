// Dữ liệu mẫu của API mock (không sửa). Sinh cố định 120 sản phẩm, id 1 là cũ nhất.
export const categories = [
  { id: 'keyboard', name: 'Bàn phím' },
  { id: 'mouse', name: 'Chuột' },
  { id: 'monitor', name: 'Màn hình' },
  { id: 'desk', name: 'Bàn làm việc' },
  { id: 'chair', name: 'Ghế văn phòng' },
];

const NAMES = {
  keyboard: ['Bàn phím cơ K87', 'Bàn phím cơ K104', 'Bàn phím không dây Slim', 'Bàn phím công thái học Ergo', 'Bàn phím số Numpad', 'Bàn phím văn phòng Basic'],
  mouse: ['Chuột không dây M220', 'Chuột công thái học Vertical', 'Chuột gaming G502', 'Chuột văn phòng Silent', 'Chuột bluetooth Travel', 'Chuột trackball T50'],
  monitor: ['Màn hình 24 inch FHD', 'Màn hình 27 inch 2K', 'Màn hình 32 inch 4K', 'Màn hình cong 34 inch', 'Màn hình di động 15 inch', 'Màn hình 22 inch Eco'],
  desk: ['Bàn làm việc gỗ 120cm', 'Bàn làm việc nâng hạ điện', 'Bàn làm việc chữ L', 'Bàn làm việc gấp gọn', 'Bàn làm việc khung sắt', 'Bàn làm việc trẻ em'],
  chair: ['Ghế lưới văn phòng', 'Ghế công thái học Pro', 'Ghế xoay da', 'Ghế gaming Racer', 'Ghế chân quỳ', 'Ghế họp chân sắt'],
};
const VARIANTS = ['', ' Plus', ' Mini', ' Pro'];
const SKU_PREFIX = { keyboard: 'KEY', mouse: 'MOU', monitor: 'MON', desk: 'DSK', chair: 'CHR' };
const BASE_PRICE = { keyboard: 450000, mouse: 190000, monitor: 2390000, desk: 1590000, chair: 1190000 };

function taoDuLieu() {
  let seed = 20261126;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const cats = categories.map((c) => c.id);
  const dem = { keyboard: 0, mouse: 0, monitor: 0, desk: 0, chair: 0 };
  const ds = [];
  for (let id = 1; id <= 120; id += 1) {
    const category = cats[(id - 1) % cats.length];
    const k = dem[category]++;
    const name = NAMES[category][k % 6] + VARIANTS[Math.floor(k / 6) % 4];
    const price = Math.round((BASE_PRICE[category] * (0.6 + rand() * 1.8)) / 10000) * 10000;
    const stock = rand() < 0.12 ? 0 : Math.floor(rand() * 80) + 1;
    const status = rand() < 0.2 ? 'inactive' : 'active';
    const createdAt = new Date(Date.UTC(2026, 6, 1) + id * 9 * 3600 * 1000).toISOString();
    ds.push({ id, name, sku: `${SKU_PREFIX[category]}-${String(id).padStart(4, '0')}`, category, price, stock, status, createdAt });
  }
  // Cố định vài giá trị trong 8 sản phẩm đầu (dùng cho Mục 4.1).
  Object.assign(ds[0], { price: 1290000, stock: 35, status: 'active' });
  Object.assign(ds[1], { stock: 12, status: 'active' });
  Object.assign(ds[2], { stock: 0, status: 'active' });
  Object.assign(ds[3], { stock: 6, status: 'active' });
  Object.assign(ds[4], { stock: 18, status: 'inactive' });
  Object.assign(ds[5], { stock: 40, status: 'active' });
  Object.assign(ds[6], { stock: 9, status: 'inactive' });
  Object.assign(ds[7], { stock: 3, status: 'active' });
  return ds;
}

export const allProducts = taoDuLieu();
