# Locket PTB Mạnh Hùng v18 — Filter và Caption thử nghiệm

Phiên bản mới chạy song song với v17, không ghi đè các script v17 hay Cloudflare Worker đang hoạt động.

## Kiến trúc

- Cloudflare Worker hiện tại `locket-ptb-manhhung` (v17.0): `/ptb/catalog`, `/locket/patch`, `/generateFilteredImage`, `/assets/frames/frame_N.png`.
- R2 `FRAMES`: sáu PNG trong suốt `frame_1.png` ... `frame_6.png`.
- Shadowrocket module: `modules/ManhHung_PTB_v18.sgmodule`.
- `scripts/ptb/v18/remote-config.js`: nối tiếp filter và caption trong những trường Remote Config tương thích, KHÔNG thay đổi Gold hay RevenueCat.
- `scripts/ptb/v18/api-response.js`: bổ sung filter trong phản hồi API Locket có cấu trúc phù hợp; giữ nguyên response không khớp.
- `scripts/ptb/v18/clear-cache.js`: bỏ If-None-Match/If-Modified-Since có điều kiện.
- `scripts/ptb/v18/generate-request.js`: chỉ chuyển yêu cầu ảnh của 6 filter Mạnh Hùng; giữ nguyên các yêu cầu Locket khác.

## Cài đặt an toàn

1. GIỮ NGUYÊN code Cloudflare Worker v17 nếu `/ptb/check` và `/ptb/catalog` đang hoạt động; kiểm tra thêm `/locket/patch`.
2. Tắt module **Mạnh Hùng v17** trong Shadowrocket để tránh hai bộ script viết cùng response.
3. Sao chép Raw URL v18 này vào Shadowrocket → Modules → +:
   `https://raw.githubusercontent.com/Belahung31/Locket_ManhHung_PTB/main/modules/ManhHung_PTB_v18.sgmodule`
4. Trong Arguments, nhập giá trị secret `PTB_API_KEY` dưới tên `PTB_KEY`. KHÔNG sửa trực tiếp mã nguồn module trên GitHub để chèn khóa. Nếu khóa từng lộ trong ảnh, đổi khóa ở Cloudflare trước.
5. Bật HTTPS Decryption, chứng chỉ tin cậy, module mới và VPN. Đóng hẳn Locket, mở lại để kiểm tra.

## Chẩn đoán

Sau khi mở Locket, tìm console logs bắt đầu bằng `MH18-`:
- `[MH18-RC] filter/caption data added`: script đã chèn vào cấu hình; KHÔNG bảo đảm app dùng dữ liệu.
- `[MH18-API] ... added PTB`: script đã chèn vào phản hồi API có kiểu tương thích.
- `schema`, `compatible fields ...`: app có thể dùng endpoint hoặc format khác.
- Không có `MH18-`: có thể rule chưa khớp request, module chưa bật hoặc HTTPS Decryption chưa áp dụng.

Chỉ chia sẻ log đã **che token đăng nhập, Cookie, Authorization và PTB_API_KEY**.

## Giới hạn kỹ thuật

Chưa kiểm thử trong Locket trên iPhone. Một số bản Locket không hiển thị Filter bằng các field Remote Config; thêm ID/URL PNG không làm xuất hiện UI nếu app không hỗ trợ. Luồng `generateFilteredImage` phụ thuộc request JSON và nguồn ảnh thực tế mà Locket gửi. Chức năng tạo ảnh trong Worker chưa được kiểm thử thực tế trên Cloudflare. **Không cam kết dùng được trong Locket chỉ bằng việc cài module.**

Không giả mạo gói Gold hoặc kích hoạt thuê bao. Không dùng module MinhHiep08 và Mạnh Hùng cùng lúc để tránh xung đột.
