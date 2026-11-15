# Mạnh Hùng FULL v20 — Locket PTB + Caption

**Bản thử nghiệm, chưa xác minh có hiển thị bộ lọc bên trong Locket trên iPhone.**

## Cài

Module:
`https://raw.githubusercontent.com/Belahung31/Locket_ManhHung_PTB/main/modules/ManhHung_FULL_v20.sgmodule`

1. Trên Cloudflare giữ nguyên Worker v17.0 đang hoạt động (không cần thay code nếu `/ptb/check`, `/ptb/catalog`, `/locket/patch` hoạt động).
2. R2 `FRAMES` cần 6 ảnh `frame_1.png` tới `frame_6.png`.
3. Trong Shadowrocket tắt v17/v18/v19 và module MinhHiep08 nếu cùng chỉnh Locket để tránh tranh chấp response.
4. Cài URL Raw v20 ở trên. Trong **Arguments** điền secret Worker vào `PTB_KEY`; không chèn khóa vào GitHub.
5. Bật VPN, HTTPS Decryption và tin cậy đúng chứng chỉ Shadowrocket. Đóng hẳn Locket, mở lại.
6. Kiểm tra Camera/Filter và Caption. Tìm `[MH20]`, `[MH20-RENDER]`, `[MH19-CACHE]`, `[MH19-RC]` trong log script.

## Kỹ thuật

- `scripts/ptb/v20/enrich-response.js` chèn filter và caption vào JSON có cấu trúc tương thích (object/JSON-string) và kiểm tra khóa giao diện có sẵn. Giữ nguyên dữ liệu hiện có, không chèn trùng lặp.
- `scripts/ptb/v20/generate-request.js` chỉ đổi đích cho 6 filter riêng Mạnh Hùng; loại bỏ header đăng nhập/cookie trước khi gửi cho Worker.
- Module dùng `scripts/ptb/v19/clear-cache.js` để xóa ETag / conditional cache, và `scripts/ptb/v19/revenuecat-response.js` để quan sát trạng thái RevenueCat **không sửa quyền thuê bao**.
- **Không sao chép quy tắc 307 của MinhHiep08**: Worker Mạnh Hùng yêu cầu header secret `X-PTB-Key`, URL rewrite 307 thuần không thể tự sinh header này. Vì vậy module dùng request script cục bộ.
- Worker / API chứa khung và caption; **không thể tự tạo nút Filter trong Locket nếu app không hỗ trợ schema**.
- Script khác của MinhHiep08 đã làm rối (obfuscated); đây là bản viết độc lập, không tuyên bố đã giải mã logic bên đó.
- Không kích hoạt Gold thật, Spotify Premium hay YouTube Premium.

## Tự kiểm tra tại repo

Đã test giả lập script v20:
- JSON `entries.camera_filter_config` kiểu object: thêm filter, nhóm và caption, giữ nguyên filter gốc.
- JSON string encoded `camera_filter_config`: thêm filter và caption đúng, không trùng khi chạy lại.
- Locket `getFilters` trả về array: bổ sung filter.
- Response không liên quan: giữ nguyên thuê bao.
- Render request không thuộc 6 filter: giữ nguyên request. Request thuộc 6 filter: đổi sang Worker và xóa Authorization/Cookie.
- Đã xác minh file GitHub hiện diện. **Chưa kiểm thử trong ứng dụng Locket và Cloudflare Images live.**

## Chẩn đoán

- Log `[MH20] response /... modified-records=0`: script chạy nhưng response không khớp hoặc đã có sẵn dữ liệu.
- Không có log `[MH20]`: module chưa khớp endpoint, chưa bật hoặc decryption chưa áp dụng.
- Có log thêm dữ liệu nhưng không có nút Filter: cần xác định schema hoặc khả năng hỗ trợ của phiên bản Locket.
- Lỗi 401 khi tạo ảnh: kiểm tra `PTB_KEY` riêng trong Shadowrocket; tuyệt đối không gửi token vào chat.
