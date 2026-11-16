# Mạnh Hùng FULL v22.2 Hybrid — selective Worker routing

**Cài đặt:** `https://raw.githubusercontent.com/Belahung31/Locket_ManhHung_PTB/main/modules/ManhHung_FULL_v22_2_Hybrid.sgmodule`

Đây là bản mới, không ghi đè v22.1.

## Vì sao cần sửa

Trong module MinhHiep08, URL Rewrite `307` chuyển **mọi** yêu cầu `generateFilteredImage` sang backend của bên thứ ba có tham số token trong URL. Nhưng Worker Mạnh Hùng sử dụng header `X-PTB-Key` cho xác thực. Chỉ thay domain trong `307` không bổ sung được header này, và việc chuyển toàn bộ filter có thể làm hỏng filter mặc định.

## v22.2 thay đổi

- Giữ nguyên `[Rule]` (10 quy tắc) và `[Header Rewrite]` (19 quy tắc) theo bản do người dùng cung cấp.
- Trong `[URL Rewrite]`, comment lại quy tắc 307 và để script `MH21 Generate Own PTB` xử lý có điều kiện.
- Dùng script `render-with-options.js` để chỉ định tuyến sáu ID Mạnh Hùng sang Cloudflare Worker, thêm `X-PTB-Key` lấy từ Arguments trên máy.
- Xóa Authorization, Cookie, Host, token API ngoài trước khi gửi về Worker. Không đăng khóa `PTB_KEY` trên GitHub.
- Giữ nguyên PTB, Caption, RevenueCat đọc trạng thái/chống cache; không tạo thuê bao Gold.

## Hướng dẫn kiểm tra

1. Tắt các module Locket cũ, thêm module v22.2.
2. Chỉnh Arguments: `PTB=true`, `Caption=true`, `RevenueCat=true`, `Debug=true`; nhập `PTB_KEY` trên iPhone.
3. Mở Locket và kiểm tra log `[MH20.2-RENDER]` khi chọn khung Mạnh Hùng.
4. Kiểm tra riêng Worker và phản hồi render nếu vẫn chưa có ảnh.

## Kiểm thử

Các script và link RAW đã được xác minh trên GitHub. Dùng dữ liệu giả lập đã xác nhận:
- Khung Mạnh Hùng được chuyển URL và gắn `X-PTB-Key`.
- Filter mặc định không bị chuyển hướng.
- `PTB=false` hoặc khóa mặc định sẽ không chuyển yêu cầu.
- Bản mới không có URL OnRender/token bên thứ ba.

**Chưa kiểm thử end-to-end trên Locket/iPhone.** Chuyển đúng request không chứng minh Worker có thể xử lý payload ảnh của phiên bản Locket đang dùng. Đặc biệt, bản này **không làm Locket lên Gold** vì script RevenueCat giữ nguyên dữ liệu thuê bao.

**Lưu ý bảo mật:** Các quy tắc chặn UDP 443 toàn máy và chặn Sentry (được yêu cầu giữ nguyên) có thể ảnh hưởng ứng dụng khác và nhật ký lỗi. HTTPS Decryption chỉ nên bật khi bạn hiểu và tin cậy cấu hình của mình.
