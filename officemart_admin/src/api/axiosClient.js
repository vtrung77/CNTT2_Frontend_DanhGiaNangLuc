// Đối tượng axios dùng chung (không sửa). Gọi API bằng đường dẫn tương đối, ví dụ api.get('/products').
// Khi API trả lỗi, axios ném lỗi: err.response.status là mã trạng thái,
// err.response.data là body lỗi dạng { message, field }.
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export default api;
