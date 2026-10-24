# HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG - CÔNG TY A
**(Smart HRM & Payroll Dashboard)**

Hệ thống Quản trị Nhân sự & Tiền lương Thông minh dành cho Ban Giám đốc và Phòng Hành chính - Nhân sự **Công ty A**, giúp tự động hóa đối soát dữ liệu từ bộ 10 file Excel chuẩn (Quý 3/2026), cảnh báo sớm rủi ro nhân sự (Đỏ - Vàng - Xanh), quản lý Hồ sơ 360° và phân tích quỹ lương thông minh bằng **Google Gemini AI**.

---

## Tính năng nổi bật

- **Giao diện Bento Grid & Glassmorphism**: Bảng màu doanh nghiệp sang trọng (Xanh Rừng Sâu `#0F291E`, Trắng Sứ `#F8FAFC`, Vàng Đồng `#D97706`), hỗ trợ chuyển đổi chế độ **Light / Dark Mode**.
- **Hiệu ứng chuyển động mượt mà (Framer Motion)**: Fade-in Up, Count-up KPI Numbers, 3D Hover Scale & Subtle Glow, Skeleton Shimmer.
- **Hệ thống 3 Biểu đồ Động (Recharts)**:
  1. Nhân sự thực tế vs Định biên theo 6 phòng ban (Horizontal Bar Chart).
  2. Biến động Tổng thu nhập (Gross) và Thực lĩnh (Net) Quý 3/2026: T07, T08, T09/2026 (Composed Bar & Line Chart).
  3. Cơ cấu tỷ trọng quỹ lương theo 6 phòng ban (Donut Chart).
- **8 Phân hệ Chuyên sâu**:
  1. `Bảng điều hành` (Executive Dashboard)
  2. `Việc cần xử lý` (Cảnh báo Đỏ - Vàng - Xanh & Duyệt nhanh)
  3. `Danh sách nhân viên & Hồ sơ 360°` (Slide-over Drawer 5 chiều thông tin)
  4. `Hợp đồng lao động`
  5. `Chấm công` (T07, T08, T09/2026)
  6. `Nghỉ phép`
  7. `Bảng lương` (T07, T08, T09/2026 kèm Phiếu lương A4/A5 Preview)
  8. `Nhập thêm dữ liệu` (Kéo thả `.xlsx` & Validation Checklist 10 file nguồn)
- **Trợ lý AI Nhân sự (Gemini API & Fallback)**:
  - Hỗ trợ nhập văn bản hoặc thu âm giọng nói tiếng Việt (Web Speech API).
  - Kết nối `gemini-3-flash` với cơ chế tự động Fallback (`gemini-3.1-flash-lite` / `gemini-2.0-flash`) và Exponential Backoff.
  - Bảo mật tuyệt đối API Key thông qua `localStorage` trên trình duyệt người dùng.
- **Kết nối & Xuất báo cáo thực tế**:
  - Xuất **Phiếu lương cá nhân** & **Tờ trình đánh giá hết thử việc** ra file Word (`.docx`) hoặc In PDF.
  - Xuất bảng tổng hợp lương/công đã lọc ra file Excel (`.xlsx`).
  - Tạo lịch nhắc tái ký Hợp đồng trên **Google Calendar** và gửi Phiếu lương qua **Gmail**.

---

## Cài đặt & Khởi chạy

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy môi trường phát triển (Development)
npm run dev

# 3. Đóng gói bản Production
npm run build
npm run preview
```
