# Non Truyện - Website đọc truyện tranh

Dự án này là một website cho phép đọc truyện tranh online với nhiều tính năng như: xem danh sách truyện, tìm kiếm theo thể loại, đọc chi tiết từng chapter, đánh dấu truyện yêu thích, theo dõi quá trình đọc.
Bạn có thể truy cập trang web ở đây: https://non-truyen.vercel.app/

## Công nghệ sử dụng

- **React**: Framework UI chính
- **TypeScript**: Ngôn ngữ lập trình với kiểu dữ liệu tĩnh
- **Vite**: Công cụ build hiện đại cho frontend
- **React Router DOM**: Quản lý định tuyến trong ứng dụng
- **Tailwind CSS**: Framework CSS tiện ích
- **Shadcn UI**: Các component UI có thể tùy chỉnh
- **Zustand**: Quản lý state toàn cục
- **Axios**: Thư viện HTTP client
- **Framer Motion**: Tạo animation cho UI
- **OGL**: Thư viện WebGL để tạo hiệu ứng 3D

## Tính năng

- 📚 Danh sách truyện tranh với hiển thị tương tác
- 🔍 Tìm kiếm truyện theo tên
- 🏷️ Phân loại truyện theo thể loại
- 📖 Đọc truyện theo từng chapter
- 🌓 Hỗ trợ chế độ sáng/tối
- 🔐 Đăng ký, đăng nhập tài khoản
- ❤️ Đánh dấu truyện yêu thích
- 📋 Theo dõi lịch sử đọc truyện

## Cấu trúc dự án

```
src/
  ├── apis/          # API calls và services
  ├── assets/        # Tài nguyên tĩnh
  ├── components/    # Các component có thể tái sử dụng
  │   ├── layout/    # Component layout chính
  │   └── ui/        # UI components cơ bản
  ├── constants/     # Hằng số và cấu hình
  ├── hooks/         # Custom React hooks
  ├── lib/           # Thư viện tiện ích
  ├── pages/         # Các trang của ứng dụng
  ├── store/         # State management với Zustand
  ├── types/         # Type definitions cho TypeScript
  └── utils/         # Các hàm tiện ích
```

## Hướng dẫn cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd non-truyen
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy ứng dụng ở môi trường development:
```bash
npm run dev
```

## Các lệnh có sẵn

- `npm run dev`: Khởi chạy server phát triển
- `npm run build`: Build ứng dụng cho production
- `npm run lint`: Kiểm tra lỗi code với ESLint
- `npm run preview`: Xem trước bản build

