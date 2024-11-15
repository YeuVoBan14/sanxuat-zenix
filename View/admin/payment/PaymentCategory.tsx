
import { AlertDialogForm } from "@/components/AlertDialogForm";
import { Paginations } from "@/components/Pagination";
import Delete from "@/components/icons/Delete";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePaymentCategory, getPaymentCategory } from "@/api/payment";
import { useEffect, useState } from "react";
import { handleApiError } from "@/lib/unauthorized-error";
import { usePathname, useRouter } from "next/navigation";
import AddAndUpdatePaymentCategory from "./components/AddAndUpdatePaymentCategory";
import LoadingView from "@/components/LoadingView";
import ErrorViews from "@/components/ErrorViews";

export function PaymentCategory() {
    const queryClient = useQueryClient();
    const route = useRouter();
    const pathname = usePathname();
    const [pagination, setPagination] = useState<{
        page: number;
        pageSize: number;
    }>({
        page: 0,
        pageSize: 10,
    });

    const {
        data: paymentCategoryList,
        error,
        isLoading,
    } = useQuery({
        queryKey: ["paymentCategoryList", pagination],
        queryFn: () => getPaymentCategory(pagination)
    });

    useEffect(() => {
        const timeId = setTimeout(() => {
            setPagination({ ...pagination, page: 0 });
        }, 500);
        return () => clearTimeout(timeId);
    }, []);

    const mutation = useMutation({
        mutationFn: (data: any) => deletePaymentCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["paymentCategoryList"],
            });
            toast({
                title: "Thành công",
                description: "Xoá danh mục thanh toán thành công",
            });
        },
        onError: (error) => {
            handleApiError(error, route, pathname);
        },
    });

    const handleDelete = (id: number) => {
        mutation.mutateAsync(id);
    };

    if (isLoading) return <LoadingView />;
    if (error instanceof Error && "response" in error) {
        const status = (error as any).response?.status;
        const type = (error as any).response?.type;
        const statusText = (error as any).response?.statusText;
        const message = (error as any).response?.data?.message;
        return (
            <ErrorViews status={status} statusText={statusText} message={message} type={type} />
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center py-4 gap-5 justify-end">
                <AddAndUpdatePaymentCategory />
            </div>
            <div className="border rounded-[10px]">
                {paymentCategoryList?.data?.results?.length ?
                    paymentCategoryList?.data?.results?.map((item: any) => (
                        <div className="grid grid-cols-4 border-b px-10 py-2">
                            <div className="col-span-3">
                                <p className="font-bold">{item.name}</p>
                            </div>
                            <div className="flex justify-end">
                                <div className="flex gap-2">
                                    <AddAndUpdatePaymentCategory edit={true} dataList={item} />
                                    <AlertDialogForm
                                        title="Bạn muốn xóa danh mục thanh toán này?"
                                        content="Xóa danh mục thanh toán có thể ảnh hưởng đến dữ liệu hiện tại, bạn có chắc chắn muốn xóa?"
                                        action={
                                            (
                                                <div>
                                                    <Delete width="20" height="20" />
                                                </div>
                                            ) as any
                                        }
                                        handleSubmit={() => handleDelete(item?.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="rounded-none h-32 flex justify-center items-center">
                            Không có dữ liệu.
                        </div>
                    )
                }
            </div>
            <div className="mt-5 flex justify-end">
                <Paginations
                    currentPage={pagination.page}
                    pageCount={paymentCategoryList?.data?.numberPages}
                    pagination={pagination}
                    setPagination={setPagination}
                    onPageChange={(value: number) => setPagination({ ...pagination, page: value })}
                />
            </div>
        </div>
    );
}
