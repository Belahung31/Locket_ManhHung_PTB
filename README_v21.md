# Mạnh Hùng FULL v21 BETA — tương thích cấu trúc Worker v17

Module Shadowrocket:
`https://raw.githubusercontent.com/Belahung31/Locket_ManhHung_PTB/main/modules/ManhHung_FULL_v21.sgmodule`

## Khác biệt chính so với v20.3

Bản Worker v17 đầy đủ có `GET /locket/patch` trả về:
- `camera_filter_config.picker_filters` + `pickerFilters`: 6 ID khung
- `camera_filter_config.sheet_filters` + `sheetFilters`: nhóm PTB Mạnh Hùng
- `camera_filter_config.filters` + `remoteFilters`: metadata của 6 khung R2
- `captions.overlay_items` (11 nhóm) và `captions.overlay_dynamic_captions` (19 mẫu động)

v20.3 **không đọc đúng cấu trúc này** nên có thể không nối được filter. v21 đọc chính xác payload `camera_filter_config` của Worker.

## Thay đổi kỹ thuật

- Tạo `entries.camera_filter_config` khi Firebase Remote Config chưa có trường này; giữ nguyên các trường gốc.
- Hỗ trợ `camera_filter_config` dạng JSON string hoặc object.
- Thêm `picker_filters`, `sheet_filters`, `remoteFilters`, `filters` và bản camelCase; tái sử dụng metadata Worker v17.
- Bật một số flag giao diện filter, KHÔNG sửa trạng thái Gold, RevenueCat, sản phẩm hoặc người dùng.
- Bổ sung các bộ lọc vào mảng `filters` nếu endpoint `getFilters` thực sự được gọi và trả JSON phù hợp.
- Giữ cơ chế tạo ảnh hiện có của v20 (chỉ route 6 ID Mạnh Hùng và bỏ Authorization/Cookie trước khi gọi Worker).
- Giữ công tắc `PTB`, `Caption`, `RevenueCat`, `Debug`; chỉ nhập khóa `PTB_KEY` ở Arguments.

## Cài đặt

1. Kiểm tra Worker v17 đã triển khai và `/ptb/check` trả `success:true`, `/ptb/catalog` có 6 filter, `/locket/patch` có dữ liệu.
2. Tắt module Locket v17–v20 và module bên thứ ba cùng can thiệp vào Locket để tránh xung đột.
3. Thêm link RAW trên vào Shadowrocket → Modules. Đặt `PTB_KEY` riêng trên iPhone.
4. Giữ `PTB=true`, `Caption=true`; để `Debug=true` khi cần xem log.
5. Bật VPN và HTTPS Decryption của Shadowrocket nếu bạn chấp nhận việc giải mã lưu lượng trên thiết bị cá nhân; chỉ tin cậy đúng chứng chỉ của mình.
6. Mở lại Locket, kiểm tra Filter. Tìm log `[MH21]` theo endpoint.

## Kiểm tra với JSON giả lập

- Remote Config thiếu hẳn `camera_filter_config`: v21 tự dựng từ Worker, đủ 6 ID, nhóm “PTB Mạnh Hùng 📸”, 6 metadata ảnh.
- Remote Config đã có JSON string chứa filter gốc: giữ lại filter gốc và thêm 6 filter mới.
- Chạy hai lần: không trùng khung hoặc caption.
- PTB=false, Caption=true: chỉ chèn caption; đảo lại chỉ chèn khung.
- PTB=false & Caption=false: không gọi Worker.
- `getFilters` nested `result.data.filters`: thêm sáu ID khi danh sách có dạng chuỗi.
- Phản hồi hồ sơ/thuê bao không liên quan: giữ nguyên.

## Giới hạn và cảnh báo

Đây là **bản BETA, chưa xác nhận có thể hiển thị Filter hoặc ghép ảnh trong Locket thực tế**. Tên các cấu hình lấy từ mẫu module bên thứ ba không bảo đảm app chính thức hỗ trợ. Nếu app không có nút Filter, việc thêm JSON có thể không tạo được nút; cần dùng log và response thực tế đã che dữ liệu nhạy cảm để chẩn đoán.

Worker v17 `/generateFilteredImage` yêu cầu dữ liệu ảnh hợp lệ và khóa bí mật; script không thể tạo ảnh nếu request thiếu nguồn ảnh. Không chép JS của bên thứ ba, không chuyển lưu lượng tới máy chủ HTTP không rõ tin cậy, không giả thuê bao Gold.
