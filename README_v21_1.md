# Mạnh Hùng FULL v21.1 — RevenueCat compatibility fix (BETA)

**Module cài Shadowrocket:**
`https://raw.githubusercontent.com/Belahung31/Locket_ManhHung_PTB/main/modules/ManhHung_FULL_v21_1.sgmodule`

## Thay đổi so với v21

- RevenueCat request/response hỗ trợ 2 tên miền `api.revenuecat.com`, `rc-backup.revenuecat.com` trên API `/v1/receipts` và `/v1/subscribers/{id}`.
- Không khớp những đường dẫn không liên quan như `/v1/subscribers/{id}/offerings` hoặc API `/v2`.
- Xóa các header xác thực cache không phân biệt chữ hoa/chữ thường: `X-RevenueCat-ETag`, `If-None-Match`, `If-Modified-Since`.
- Giữ nguyên header Authorization, Cookie và dữ liệu xác thực.
- Response script **chỉ quan sát** số lượng subscription và entitlement trong chế độ Debug, không ghi ID tài khoản, giá trị token hoặc nội dung receipt.
- Bắt phản hồi rỗng `304` và JSON hỏng an toàn; không tự chế JSON 200.
- Giữ nguyên 6 PTB, caption, Arguments và phần tạo ảnh của v21.

## Cài đặt

1. Tắt các module Locket khác trong Shadowrocket để không trùng quy tắc.
2. Thêm link Raw ở trên; chỉ nhập `PTB_KEY` trong Arguments trên iPhone.
3. `RevenueCat=true` bật chống cache. `Debug=true` bật nhật ký `[MH21.1-RC]`; tắt sau khi thử.
4. Mở lại Locket sau khi bật module và HTTPS Decryption nếu bạn có quyền kiểm tra lưu lượng trên thiết bị đó.

## Kiểm thử mã (đã thực hiện)

- Regex nhận cả domain API và backup ở các đường dẫn `/v1` mục tiêu.
- Xóa đủ 3 cache validators và giữ Authorization.
- `RevenueCat=false`: không thay request hoặc response.
- JSON bình thường, phản hồi rỗng 304: trả về nguyên trạng và ghi log không nhạy cảm.
- Đã xác nhận đầy đủ 5 script liên kết trong module trên GitHub.

## Giới hạn

**Không có cơ chế tạo thuê bao Gold thật hoặc giả.** Module không chèn giao dịch mua hàng, không viết vào entitlement. Không có kiểm thử đầu-cuối trong app Locket trên iPhone và không có cam kết chức năng Gold/PTB.
