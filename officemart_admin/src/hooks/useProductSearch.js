import axios from 'axios';
import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function useProductSearch({
  q,
  category,
  status,
  page,
  limit = 10,
  reloadTrigger,
}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const params = {};

      if (typeof q === 'string') {
        const trimmedQ = q.trim();
        if (trimmedQ) params.q = trimmedQ;
      }

      if (category !== undefined && category !== null && category !== '') {
        params.category = category;
      }
      if (status !== undefined && status !== null && status !== '') {
        params.status = status;
      }
      if (page !== undefined && page !== null && page !== '') {
        params.page = page;
      }
      if (limit !== undefined && limit !== null && limit !== '') {
        params.limit = limit;
      }

      try {
        const res = await api.get('/products', {
          params,
          signal: controller.signal,
        });

        if (!cancelled) {
          setData(res.data.data);
          setTotal(res.data.total);
        }
      } catch (err) {
        if (!axios.isCancel(err) && !cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [q, category, status, page, limit, reloadTrigger]);

  return { data, total, loading, error };
}
