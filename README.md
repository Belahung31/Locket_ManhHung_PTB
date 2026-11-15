# Locket PTB Mạnh Hùng

Mã nguồn thử nghiệm để tích hợp 6 khung Photobooth Mạnh Hùng với Shadowrocket và Cloudflare Worker.

## Cấu trúc
- `modules/ManhHung_PTB_GitHub.sgmodule` — module Shadowrocket.
- `scripts/ptb/` — ba script xử lý Remote Config, danh sách bộ lọc và yêu cầu render.
- Backend xử lý ảnh nằm trên Cloudflare Worker riêng; 6 PNG được lưu trên R2.

## Tình trạng
Đã kiểm tra cú pháp và logic giả lập. **Chưa xác minh trên Locket/iPhone thật**, chưa bảo đảm filter tùy chỉnh xuất hiện trong ứng dụng. Đăng script lên GitHub **không tự triển khai Worker**.

Không đăng `PTB_API_KEY`, token Locket hay hình ảnh riêng tư lên GitHub. Không mở khóa thuê bao Gold thật.
