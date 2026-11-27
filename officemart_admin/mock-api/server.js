// API mock của OfficeMart (không sửa). Chạy: npm run api (thường), npm run api:loi, npm run api:cham.
// Mọi request có độ trễ ngẫu nhiên 200-1.500 ms.
//   --mode loi  : mọi request GET /api/products trả 500.
//   --mode cham : request GET /api/products có từ khoá q bắt đầu bằng "ban" trễ 2,5 giây; request khác trễ 0,1 giây.
import http from 'node:http';
import { categories, allProducts } from './data.js';

const args = process.argv.slice(2);
const arg = (ten, macDinh) => {
  const i = args.indexOf(ten);
  return i >= 0 ? args[i + 1] : macDinh;
};

const PORT = Number(process.env.API_PORT || arg('--port', 3001));
const ADMIN = process.env.API_ADMIN === '1';
let mode = arg('--mode', 'thuong');
let latencyFixed = null;
let products = [];
let requestLog = [];

function napDuLieu(boDuLieu) {
  const soLuong = { t1: 8, t2: 30, t3: 120, empty: 0 }[boDuLieu] ?? 120;
  products = allProducts.slice(0, soLuong).map((p) => ({ ...p }));
}
napDuLieu(arg('--data', 't3'));

const boDau = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const SKU_RE = /^[A-Z]{3}-\d{4}$/;

function kiemTra(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (name.length < 3 || name.length > 100) return { message: 'Tên sản phẩm từ 3 đến 100 ký tự', field: 'name' };
  if (typeof body.sku !== 'string' || !SKU_RE.test(body.sku)) return { message: 'SKU có dạng ABC-1234', field: 'sku' };
  if (!categories.some((c) => c.id === body.category)) return { message: 'Danh mục không hợp lệ', field: 'category' };
  const price = Number(body.price);
  if (body.price === '' || body.price === null || !(price > 0)) return { message: 'Giá phải lớn hơn 0', field: 'price' };
  const stock = Number(body.stock);
  if (body.stock === '' || body.stock === null || !Number.isInteger(stock) || stock < 0) return { message: 'Tồn kho là số nguyên không âm', field: 'stock' };
  if (!['active', 'inactive'].includes(body.status ?? 'active')) return { message: 'Trạng thái không hợp lệ', field: 'status' };
  return null;
}

function doTre(method, url) {
  if (latencyFixed !== null) return latencyFixed;
  if (mode === 'cham') {
    if (method === 'GET' && url.pathname === '/api/products') {
      return boDau(url.searchParams.get('q') || '').startsWith('ban') ? 2500 : 100;
    }
    return 100;
  }
  return 200 + Math.floor(Math.random() * 1300);
}

function docBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve(null); }
    });
  });
}

function xuLy(method, url, body) {
  const path = url.pathname;
  if (method === 'GET' && path === '/api/categories') return [200, categories];

  if (path === '/api/products') {
    if (method === 'GET') {
      if (mode === 'loi') return [500, { message: 'Lỗi máy chủ, vui lòng thử lại' }];
      const q = boDau((url.searchParams.get('q') || '').trim());
      const category = url.searchParams.get('category') || '';
      const status = url.searchParams.get('status') || '';
      let page = Number(url.searchParams.get('page') || 1);
      let limit = Number(url.searchParams.get('limit') || 10);
      if (!Number.isInteger(page) || page < 1) page = 1;
      if (!Number.isInteger(limit) || limit < 1) limit = 10;
      limit = Math.min(limit, 50);
      const loc = products
        .filter((p) => !q || boDau(p.name).includes(q) || boDau(p.sku).includes(q))
        .filter((p) => !category || p.category === category)
        .filter((p) => !status || p.status === status)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
      return [200, { data: loc.slice((page - 1) * limit, page * limit), total: loc.length }];
    }
    if (method === 'POST') {
      if (body === null) return [400, { message: 'Body không phải JSON hợp lệ' }];
      const loi = kiemTra(body);
      if (loi) return [400, loi];
      if (products.some((p) => p.sku === body.sku)) return [409, { message: 'SKU đã tồn tại', field: 'sku' }];
      const id = Math.max(0, ...allProducts.map((p) => p.id), ...products.map((p) => p.id)) + 1;
      const moi = {
        id, name: body.name.trim(), sku: body.sku, category: body.category,
        price: Number(body.price), stock: Number(body.stock), status: body.status ?? 'active',
        createdAt: new Date().toISOString(),
      };
      products.push(moi);
      return [201, moi];
    }
  }

  const m = path.match(/^\/api\/products\/(\d+)$/);
  if (m) {
    const id = Number(m[1]);
    const i = products.findIndex((p) => p.id === id);
    if (i < 0) return [404, { message: 'Không tìm thấy sản phẩm' }];
    if (method === 'GET') return [200, products[i]];
    if (method === 'PUT') {
      if (body === null) return [400, { message: 'Body không phải JSON hợp lệ' }];
      const loi = kiemTra(body);
      if (loi) return [400, loi];
      if (products.some((p) => p.sku === body.sku && p.id !== id)) return [409, { message: 'SKU đã tồn tại', field: 'sku' }];
      products[i] = {
        ...products[i], name: body.name.trim(), sku: body.sku, category: body.category,
        price: Number(body.price), stock: Number(body.stock), status: body.status ?? 'active',
      };
      return [200, products[i]];
    }
    if (method === 'DELETE') {
      products.splice(i, 1);
      return [204, null];
    }
  }
  return [404, { message: 'Không có đường dẫn này' }];
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (ADMIN && url.pathname.startsWith('/__admin/')) {
    if (url.pathname === '/__admin/reset') {
      const body = (await docBody(req)) || {};
      napDuLieu(body.data || 't3');
      mode = body.mode || 'thuong';
      latencyFixed = body.latency ?? null;
      requestLog = [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
      return;
    }
    if (url.pathname === '/__admin/log') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(requestLog));
      return;
    }
  }

  const body = ['POST', 'PUT'].includes(req.method) ? await docBody(req) : {};
  const muc = { method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams), at: Date.now(), aborted: false, body };
  requestLog.push(muc);
  let daTraLoi = false;
  res.on('close', () => { if (!daTraLoi) muc.aborted = true; });

  setTimeout(() => {
    if (muc.aborted || res.destroyed) { muc.aborted = true; return; }
    const [status, data] = xuLy(req.method, url, body);
    daTraLoi = true;
    if (data === null) { res.writeHead(status); res.end(); return; }
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  }, doTre(req.method, url));
});

server.listen(PORT, () => {
  console.log(`API mock OfficeMart chạy tại http://localhost:${PORT}/api (chế độ: ${mode})`);
});
