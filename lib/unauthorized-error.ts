import { toast } from "@/components/ui/use-toast";
import { deleteCookie } from "cookies-next";

export function handleApiError(error: any, router: any, pathname: string) {
    if (error && error.response?.status === 401) {
        router.push(`/login?next=${pathname}`);
        deleteCookie("token");
        localStorage.clear();
        toast({
            title: "Tài khoản bạn bị đăng xuất",
            description: "Tài khoản của bạn đang đăng nhập ở nơi khác, vui lòng đăng nhập lại",
        });
    } else {
        toast({
            title: "Thất bại",
            description: error?.response?.data?.message,
        });
    }
}
