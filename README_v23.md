# Locket Mạnh Hùng FULL v23 Extras — bổ sung chức năng an toàn từ đối chiếu MinhHiep08

**Module Shadowrocket:** `https://raw.githubusercontent.com/Belahung31/Locket_ManhHung_PTB/main/modules/ManhHung_FULL_v23_Extras.sgmodule`

Giữ lại v22.2 làm dự phòng. Bản v23 chỉ tham khảo vị trí hook/loại tính năng MinhHiep08; không chạy JS hay token từ `locket-pro-backend.onrender.com`.

## Những gì đã bổ sung

- **YouTube tùy chọn:** Script `scripts/ptb/v23/youtube-ui-response.js` xử lý JSON của `youtubei.googleapis.com/youtubei/v1/{browse,next,search,guide}`; có thể ẩn các mục Shorts dạng `reelShelfRenderer`, `reelItemRenderer`, `shortsLockupViewModel`, tab `FEshorts`, và nút upload dạng renderer đã nhận diện. Không có xử lý quảng cáo, SponsorBlock, YouTube Premium hay dịch phụ đề.
- **RevenueCat nâng cao:** `scripts/ptb/v23/revenuecat-observer.js` báo tổng số entitlement/subscription, số tên entitlement giống Gold và số chưa hết hạn theo giá trị `expires_date`, không ghi ID người dùng, không sửa response, không xác nhận Gold thật.
- **Profile/Filter Debug:** Quan sát status/đếm số Filter của endpoint `getFilters`, `changeProfileInfo`, không sửa hồ sơ hoặc mở khóa quyền.
- **Spotify Debug:** Quan sát mã trạng thái của endpoint bootstrap/customize, không đụng payload protobuf, không mở Premium. Các header cache Spotify từ v22.2 tiếp tục giữ nguyên.
- **PTB / Caption:** giữ 6 khung của Worker Mạnh Hùng, cache và 239 caption từ bản v22.2.
- Giữ nguyên 10 Rule, 19 Header Rewrite, 8 script cũ trừ việc thay observer RevenueCat; thêm 3 script UI/Debug; `[URL Rewrite]` 307 vẫn tắt để `MH21 Generate Own PTB` chỉ route 6 ID kèm khóa `X-PTB-Key`.

## Các Arguments

```ini
#!arguments=PTB_KEY:SET_YOUR_KEY,PTB:true,Caption:true,RevenueCat:true,HideShorts:false,HideUpload:false,ProfileDebug:false,SpotifyDebug:false,Debug:false
```

- `PTB_KEY`: Khóa riêng của Worker, nhập trên iPhone, không đăng công khai
- `PTB`, `Caption`, `RevenueCat`: giữ như trước
- `HideShorts=true`: ẩn các Shorts dạng JSON có cấu trúc đã biết
- `HideUpload=true`: ẩn một số nút Upload được hỗ trợ
- `ProfileDebug=true`, `SpotifyDebug=true`: chỉ ghi log khi `Debug=true`
- `Debug=true`: xuất log có tiền tố `[MH23-YT]`, `[MH23-RC]`, `[MH23-PF]`, `[MH23-SP]`

## Cài đặt và kiểm tra

1. Tắt v22.2 / các module Locket trùng lặp, cài link v23.
2. Giữ `PTB=true`, `Caption=true`, `RevenueCat=true`; điền `PTB_KEY` của bạn.
3. Mặc định các phần YouTube/Spotify mới đều tắt. Chỉ bật từng công tắc khi muốn thử.
4. Nếu bật YouTube options, đóng mở lại YouTube để reload nội dung. Kiểm tra các tab và màn hình Browse.
5. Có thể bật `Debug=true`, `ProfileDebug=true`, `SpotifyDebug=true` để xem request/response có khớp các endpoint hay không. Tắt Debug sau khi thử.
6. Nếu hiệu ứng không xuất hiện, gửi log đã che thông tin nhạy cảm. Không gửi token, Authorization, Cookie, receipt hoặc khóa Worker.

## Kết quả kiểm thử mô phỏng

- Shorts shelf/wrapped reel và nút Upload bị xóa khỏi JSON mẫu, còn video thông thường vẫn giữ.
- `HideShorts=false` và `HideUpload=false`: script không thay đổi phản hồi.
- Observer RevenueCat đọc phản hồi JSON và trả dữ liệu gốc không đổi.
- Đã xác nhận module RAW và toàn bộ 8 file script nguồn tồn tại trên GitHub.

## Giới hạn

- **Chưa kiểm thử end-to-end trên iPhone/phiên bản YouTube, Spotify và Locket đang dùng.** YouTube có thể dùng protobuf hoặc schema khác, khiến tùy chọn ẩn không có tác dụng.
- Không thêm thuê bao Gold giả, không thay `subscriber.subscriptions` / `subscriber.entitlements`, không mở khóa Spotify/YouTube Premium.
- Không lấy script/token MinhHiep08 và không chuyển ảnh tới máy chủ bên thứ ba.
- Quy tắc chặn UDP 443 toàn thiết bị và Sentry giữ nguyên theo bản bạn gửi, có thể ảnh hưởng kết nối hoặc khả năng báo lỗi.
