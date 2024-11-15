"use client"
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import AddAndUpdateCost from "./components/AddAndUpdateCost";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCost, getCostList, getCostListExcel } from "@/api/accounting";
import { Paginations } from "@/components/Pagination";
import { format, parseISO } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { AlertDialogForm } from "@/components/AlertDialogForm";
import Delete from "@/components/icons/Delete";
import ExcelExport from "./components/ExcelExport";
import { handleApiError } from "@/lib/unauthorized-error";
import { usePathname, useRouter } from "next/navigation";
import ErrorViews from "@/components/ErrorViews";
import LoadingView from "@/components/LoadingView";


export default function CostManager() {
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const [rowExcel, setRowExcel] = useState(10);
    const [openExcelModal, setOpenExcelModal] = useState(false);
    const [pagination, setPagination] = useState<{
        page: number;
        pageSize: number;
    }>({
        page: 0,
        pageSize: 10,
    });

    useEffect(() => {
        setRowExcel(pagination.pageSize);
    }, [pagination.pageSize]);

    const {
        data: costList,
        error,
        isLoading,
    } = useQuery({
        queryKey: ["costList", pagination],
        queryFn: () => getCostList(pagination),
    });

    const {
        data: costListExcel,
    } = useQuery({
        queryKey: ["costListExcel", rowExcel],
        queryFn: () => getCostListExcel({
            page: 0,
            pageSize: rowExcel,
        }),
        enabled: openExcelModal && rowExcel > 0,
    });

    useEffect(() => {
        const timeId = setTimeout(() => {
            setPagination({ ...pagination, page: 0 });
        }, 500);
        return () => clearTimeout(timeId);
    }, []);

    const mutation = useMutation({
        mutationFn: deleteCost,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["costList"],
            });
            toast({
                title: "Thành công",
                description: "Xoá chi phí thành công",
            });
        },
        onError: (error: any) => {
            handleApiError(error, router, pathname);
        },
    });

    const handleDelete = async (id: number) => {
        await mutation.mutateAsync(id);
    };


    const columns: ColumnDef<any>[] = [
        {
            id: "id",
            header: "STT",
            cell: ({ row }) => <div>{row["index"] + 1 + pagination.page * pagination.pageSize}</div>
        },
        {
            accessorKey: "title",
            header: "Tiêu đề",
            cell: ({ row }) => <div>{row.original["title"]}</div>
        },
        {
            accessorKey: "paymentAmount",
            header: "Số tiền thanh toán",
            cell: ({ row }) => <div>{row.original["paymentAmount"]}</div>
        },
        {
            accessorKey: "PaymentCategory",
            header: "Danh mục thanh toán",
            cell: ({ row }) => <div>{row.original["PaymentCategory"]?.name}</div>
        },
        {
            accessorKey: "paymentDate",
            header: "Ngày thanh toán",
            cell: ({ row }) => {
                const date = row.original["paymentDate"];
                const parsedDate = date ? parseISO(date) : null;
                return (
                    <div>{parsedDate ? format(parsedDate, "dd/MM/yyyy") : ""}</div>
                )
            }
        },
        {
            accessorKey: "PIC",
            header: "PIC",
            cell: ({ row }) => <div>{row.original["infoPIC"]?.fullName}</div>
        },
        {
            accessorKey: "POCustomer",
            header: "Số PO",
            cell: ({ row }) => <div>{row.original["poCustomer"]}</div>
        },
        {
            accessorKey: "codeBill",
            header: "Số hóa đơn",
            cell: ({ row }) => <div>{row.original["codeBill"]}</div>
        },
        {
            accessorKey: "dateExportBill",
            header: "Ngày xuất đơn",
            cell: ({ row }) => {
                const date = row.original["dateExportBill"];
                const parsedDate = date ? parseISO(date) : null;
                return (
                    <div>{parsedDate ? format(parsedDate, "dd/MM/yyyy") : ""}</div>
                )
            }
        },
        // {
        //     accessorKey: "supplierId",
        //     header: "Nhà cung cấp",
        //     cell: ({ row }) => <div>{row.original["Supplier"]?.name}</div>
        // },
        {
            accessorKey: "noteCost",
            header: "Ghi chú",
            cell: ({ row }) => <div>{row.original["noteCost"]}</div>
        },
        {
            accessorKey: "fileCost",
            header: "File hóa đơn",
            cell: ({ row }) => {
                return <>
                    {row.original["fileCost"] &&
                        <a href={`${row.original["fileCost"]}`} target="_blank">File</a>
                    }
                </>
            }
        },
        {
            id: "action",
            header: "",
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end">
                        <div className="flex gap-2 items-center">
                            <AddAndUpdateCost edit={true} costData={row.original} />
                            <AlertDialogForm
                                title="Bạn muốn xóa chi phí này?"
                                content="Xóa chi phí có thể ảnh hưởng đến dữ liệu hiện tại, bạn có chắc chắn muốn xóa?"
                                action={
                                    (
                                        <div className="cursor-pointer">
                                            <Delete width="20" height="20" />
                                        </div>
                                    ) as any
                                }
                                handleSubmit={() => handleDelete(row.original["id"])}
                            />
                        </div>
                    </div>
                )
            }
        },
    ];

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
        <>
            <div className="flex justify-end items-end mb-2 gap-2">
                <ExcelExport
                    open={openExcelModal}
                    setOpen={setOpenExcelModal}
                    data={costListExcel?.data?.results}
                    pageSize={rowExcel}
                    setPageSize={setRowExcel}
                />
                <AddAndUpdateCost />
            </div>
            <DataTable data={costList?.data?.results || []} columns={columns} />
            <div className="mt-5 flex justify-end">
                <Paginations
                    currentPage={pagination.page}
                    pageCount={costList?.data?.numberPages}
                    pagination={pagination}
                    setPagination={setPagination}
                    onPageChange={(value: number) => setPagination({ ...pagination, page: value })}
                />
            </div>
        </>
    );
}