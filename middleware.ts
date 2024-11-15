import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Bỏ qua Middleware cho các file tĩnh (hình ảnh, CSS, JS, ...)
  const shouldHandle = !(
    request.nextUrl.pathname.startsWith("/_next") || // Bỏ qua các đường dẫn kỹ thuật của Next.js
    request.nextUrl.pathname.includes(".") // Bỏ qua các tài nguyên tĩnh
  );

  if (!shouldHandle) {
    return NextResponse.next();
  }

  // Bỏ qua kiểm tra token và cho phép truy cập vào tất cả các trang

  // Nếu truy cập vào trang chủ, chuyển hướng đến /admin mà không kiểm tra đăng nhập
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Tiếp tục với phản hồi tiếp theo mà không kiểm tra xác thực
  return NextResponse.next();
}
