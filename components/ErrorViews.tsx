
import React from "react";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { Button } from "./ui/button";


export default function ErrorViews({
    status,
    statusText,
    message,
    type,
}: {
    status: number;
    statusText: string;
    message: string;
    type: string;
}) {
    const router = useRouter();

    const handleLogout = async () => {
        deleteCookie("token");
        localStorage.clear();
        router.push("/login");
    };

    return (
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-sm text-center">
                <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
                    {status}
                </h1>
                <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">{statusText}</p>
                <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">{message}</p>
                {(status === 401 && type === "typeError") ? (
                    <Button onClick={handleLogout} size="sm">
                        Đăng nhập lại
                    </Button>
                ) : (
                    <Button onClick={() => router.back()} size="sm">
                        Quay lại trang trước
                    </Button>
                )}
            </div>
        </div>
    );
}