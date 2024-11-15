import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Bỏ qua Middleware cho các file tĩnh (hình ảnh, CSS, JS, ...)
  const shouldHandle = !(
    (
      request.nextUrl.pathname.startsWith("/_next") || // Bỏ qua các đường dẫn kỹ thuật của Next.js
      request.nextUrl.pathname.includes(".")
    ) // Bỏ qua các tài nguyên tĩnh
  );

  if (!shouldHandle) {
    return NextResponse.next();
  }

  // Lấy token từ cookie
  const token = request.cookies.get("token");

  // Đường dẫn mà không cần xác thực, ví dụ như trang đăng nhập hoặc trang chủ
  const publicPaths = ["/login", "/"];

  // Nếu truy cập vào trang chủ
  if (request.nextUrl.pathname === "/") {
    if (token) {
      // Nếu đã đăng nhập, chuyển hướng đến /admin
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến /login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Nếu không có token và người dùng không phải đang truy cập vào một trang công cộng
  if (!token && !publicPaths.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Đính kèm đường dẫn hiện tại vào chuỗi truy vấn để sau khi đăng nhập có thể chuyển hướng trở lại
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Nếu không có gì cần xử lý, tiếp tục với phản hồi tiếp theo
  return NextResponse.next();
}
