// Mục 4.3.4 – KHÔNG SỬA FILE NÀY.
// Mã do một trợ lý AI sinh theo yêu cầu:
// "Viết custom hook tải danh sách sản phẩm theo từ khoá, danh mục, trạng thái và trang."
import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function useProductSearch(params) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/products', { params });
        setData(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.q, params.category, params.status, params.page]);

  return { data, total, loading, error };
}
