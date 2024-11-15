import { Paginations } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/custom/data-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { formatters } from "date-fns";
import { useEffect, useState } from "react";
import ConfirmReceipt from "./components/ConfirmReceipt";

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function PurchaseOrderDetails({
  data,
  code,
  purchaseName,
  refetch,
  reload,
  setReload,
}: {
  data: any;
  code: string;
  purchaseName: string;
  refetch: any;
  reload: boolean;
  setReload: (value: boolean) => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const pageCount = Math.ceil(data.length / pageSize);

  const currentData = data.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const columns: ColumnDef<any>[] = [
    {
      header: "STT",
      cell: ({ row }) => {
        return (
          <div className="capitalize">
            {row.index + 1 + currentPage * pageSize}
          </div>
        );
      },
    },
    {
      accessorKey: "codeSubPO",
      header: "Số PO",
      cell: ({ row }) => <div>{code + " - " + row.original["id"]}</div>,
    },
    // {
    //   accessorKey: "supplierName",
    //   header: "Nhà cung cấp",
    //   cell: ({ row }) => <div>{row.original["Supplier"]["name"]}</div>,
    // },
    // {
    //   accessorKey: "amount",
    //   header: "Giá trị",
    //   cell: ({ row }) => <div>{formatter.format(row.getValue("amount"))}</div>,
    // },
    {
      accessorKey: "totalEntry",
      header: "Tổng số nhập",
      cell: ({ row }) => {
        const WSProducts: { statusConfirm: boolean }[] =
          row.original["WSProducts"];
        const poProducts = WSProducts?.filter((ele) => ele.statusConfirm);
        return (
          <div>
            {poProducts?.length} / {WSProducts?.length}
          </div>
        );
      },
    },
    {
      accessorKey: "isComplete",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex items-center">
          <ConfirmReceipt
            reload={reload}
            setReload={setReload}
            refetch={refetch}
            code={code + " - " + row.original["id"]}
            data={row.original}
            purchaseName={purchaseName}
          />
        </div>
      ),
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge>Chi tiết đơn hàng</Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>Đơn mua {code}</DialogTitle>
        </DialogHeader>
        <DataTable data={currentData} columns={columns} />
        <div className="mt-5 flex justify-end">
          <Paginations
            currentPage={currentPage}
            pageCount={pageCount}
            onPageChange={setCurrentPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
