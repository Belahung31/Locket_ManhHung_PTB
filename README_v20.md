# Mạnh Hùng FULL v20.2 — Module Shadowrocket có Arguments

Cài module:
`https://raw.githubusercontent.com/Belahung31/Locket_ManhHung_PTB/main/modules/ManhHung_FULL_v20.sgmodule`

## Chỉnh tham số giống MinhHiep08

Trong Shadowrocket: **Cấu hình / Config → Module → chọn Mạnh Hùng FULL v20.2 → Chỉnh tham số / Edit Arguments**.

```ini
#!arguments=PTB_KEY:SET_YOUR_KEY,PTB:true,Caption:true,RevenueCat:true,Debug:false
#!arguments-desc=- PTB_KEY: Khoa Worker, chi nhap tren iPhone\n- PTB: Bat/tat 6 khung PTB [true, false]\n- Caption: Bat/tat 239 caption [true, false]\n- RevenueCat: Bat/tat chong cache va kiem tra response [true, false]\n- Debug: Bat/tat nhat ky script [true, false]
```

- **PTB** = false: không chèn 6 filter Mạnh Hùng, không chuyển generateFilteredImage về Worker.
- **Caption** = false: không chèn caption mới từ Worker.
- **RevenueCat** = false: không xóa ETag hoặc chạy phân tích phản hồi thuê bao qua script RevenueCat.
- **Debug** = true: bật log [MH20.2], không ghi thông tin tài khoản hoặc token.
- **PTB_KEY**: chỉ nhập khóa trong Arguments trên điện thoại; không commit secret lên GitHub.

Để bật: sửa biến tương ứng từ `false` sang `true`; không cần sửa mã JavaScript.

Các script được tham chiếu trong module:
- `scripts/ptb/v20/response-with-options.js`
- `scripts/ptb/v20/render-with-options.js`
- `scripts/ptb/v20/cache-with-options.js`
- `scripts/ptb/v20/revenuecat-request-with-options.js`
- `scripts/ptb/v20/revenuecat-response-with-options.js`

## Cài đặt

1. Tắt module Mạnh Hùng cũ và module khác cũng can thiệp Locket để tránh ghi đè response.
2. Thêm link Raw module v20.2 (ở đầu file), bật module và HTTPS Decryption trên thiết bị được phép kiểm thử.
3. Chỉnh Arguments; nhập PTB_KEY hợp lệ, giữ bí mật.
4. Đóng hẳn Locket rồi mở lại; nếu không thấy PTB, bật Debug=true và xem log [MH20.2].

## Đã kiểm tra

Kiểm tra script với dữ liệu giả lập:
- Bật cả PTB và Caption: thêm đúng dữ liệu, giữ nguyên dữ liệu cũ.
- PTB=false: không thêm filter, caption vẫn hoạt động.
- Caption=false: không thêm caption, filter vẫn hoạt động.
- PTB=false & Caption=false: không gọi Worker.
- Debug=false: không in nhật ký; Debug=true: có nhật ký.
- RevenueCat=false: không sửa header; RevenueCat=true: xóa cache validators nhưng giữ Authorization.
- Render khi PTB=false: không chuyển request, PTB=true: chuyển 6 ID riêng và xóa Authorization/Cookie.

**Giới hạn**: Các thử nghiệm trên dùng JSON giả lập, KHÔNG chứng minh rằng Locket trên iPhone có hỗ trợ giao diện Filter/Caption hoặc Worker ghép ảnh đã hoạt động end-to-end. Đây không phải kích hoạt Gold hoặc giả lập thuê bao. RevenueCat chỉ được dùng để quan sát thông tin thuê bao sẵn có và tránh cache.
