// HOAN_THIEN: dựng bố cục trang và khai báo các route theo đề (Mục 4.1, 4.2, 4.3).
// Xoá đoạn return bên dưới khi bắt đầu làm bài.
import { Routes, Route, Navigate } from 'react-router-dom';
import ProductListPage from './pages/ProductListPage';
import './App.css';
export default function App() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-inner">OfficeMart Admin</div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
        </Routes>
      </main>
    </div>
  );
}
