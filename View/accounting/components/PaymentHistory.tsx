
import { DataTable } from "@/components/ui/custom/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Paginations } from "@/components/Pagination";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";


export function PaymentHistory({ data }: { data: any }) {
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const pageCount = data ? Math.ceil(data?.length / pageSize) : 0;
    const currentData = data?.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    const columns: ColumnDef<any>[] = [
        {
            id: "id",
            header: "STT",
            cell: ({ row }) => <div>{row["index"] + 1 + currentPage * pageSize}</div>
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
            accessorKey: "paymentPrice",
            header: "Số tiền thanh toán",
            cell: ({ row }) => <div>{row.original["paymentPrice"]}</div>
        },
        {
            accessorKey: "title",
            header: "Thông tin",
            cell: ({ row }) => <div>{row.original["title"]}</div>
        },
        {
            accessorKey: "nameAccount",
            header: "Tài khoản",
            cell: ({ row }) => <div>{row.original["Bank_Account"]?.nameAccount}</div>
        },
        {
            id: "action",
            header: "",
        },
    ]

    return (
        <>
            <Dialog>
                <DialogTrigger>
                    {data?.length > 0 && <Badge>Chi tiết</Badge>}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader className="font-bold">
                        Lịch sử thanh toán
                    </DialogHeader>
                    <div>
                        <DataTable data={currentData || []} columns={columns} />
                        <div className="mt-5 flex justify-end">
                            <Paginations
                                currentPage={currentPage}
                                pageCount={pageCount}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
