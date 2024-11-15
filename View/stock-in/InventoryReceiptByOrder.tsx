"use client";

import { Paginations } from "@/components/Pagination";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PurchaseOrderDetails } from "./PurchaseOrderDetails";
import { useQuery } from "@tanstack/react-query";
import { getListWarehouse } from "@/api/purchase";
import { format } from "date-fns";
import LoadingView from "@/components/LoadingView";
import ErrorViews from "@/components/ErrorViews";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

export const returnColor = (valuePO: string) => {
  switch (valuePO) {
    case "admin":
      return "bg-red-500";
    case "manager":
      return "bg-blue-400";
    case "staff":
      return "bg-gray-400";
    default:
      return "bg-gray-200";
  }
};

// Fake data

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function InventoryReceiptByOrder(props: {
  reload: boolean;
  setReload: (value: boolean) => void;
}) {
  const router = useRouter();
  const { reload, setReload } = props;
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    type: "INPUT",
  });

  const {
    data: listInputWarehouse,
    refetch,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["listInputWarehouse", pagination],
    queryFn: () => getListWarehouse(pagination),
  });

  const columns: ColumnDef<any>[] = [
    {
      header: "STT",
      cell: ({ row }) => {
        return (
          <div className="capitalize">
            {row.index + 1 + pagination.page * pagination.pageSize}
          </div>
        );
      },
    },
    {
      accessorKey: "Order",
      header: "Mã đơn bán",
      cell: ({ row }) => <div>{row.original["Order"]["codeOrder"]}</div>,
    },
    {
      accessorKey: "POCode",
      header: "Mã đơn mua",
      cell: ({ row }) => <div>{row.getValue("POCode")}</div>,
    },
    {
      accessorKey: "POCustomer",
      header: "Số PO",
      cell: ({ row }) => {
        const rowData: { Order: { POCustomer: string } } = row.original;
        return <div>{rowData?.Order?.POCustomer}</div>;
      },
    },
    {
      accessorKey: "startDatePO",
      header: "Ngày bắt đầu PO",
      cell: ({ row }) => (
        <div>
          {row.original["createdAt"]
            ? format(row.original["createdAt"], "dd/MM/yyyy")
            : ""}
        </div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Tên khách hàng",
      cell: ({ row }) => {
        const rowData: { Customer: { customerName: string } } =
          row.original["Order"];
        return <div>{rowData?.Customer?.customerName}</div>;
      },
    },
    {
      accessorKey: "Supplier",
      header: "Nhà cung cấp",
      cell: ({ row }) => <div>{row.original["Supplier"]?.name}</div>,
    },
    {
      accessorKey: "valuePO",
      header: "Giá trị",
      cell: ({ row }) => (
        <div>{formatter.format(Number(row.original["totalPrice"]))}</div>
      ),
    },
    {
      id: "isComplete",
      cell: ({ row }) => (
        <div className="flex justify-end items-center relative">
          <PurchaseOrderDetails
            data={row.original["WarehouseSuggests"]}
            code={row.original["Order"]["POCustomer"]}
            purchaseName={row.original["Order"]?.purchaseInfo?.fullName}
            refetch={refetch}
            reload={reload}
            setReload={setReload}
          />{" "}
          {row.original["WarehouseSuggests"].filter(
            (item: { statusAll: { id: boolean } }) => !item.statusAll.id
          )?.length > 0 && (
            <div className=" rounded-full p-1 text-xs bg-red-500 h-4 w-4 text-white flex items-center justify-center font-medium absolute bottom-[13px] right-[-6px]">
              {
                row.original["WarehouseSuggests"].filter(
                  (item: { statusAll: { id: boolean } }) => !item.statusAll.id
                )?.length
              }
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      codeOrder: item?.Order?.codeOrder,
      POCode: item?.POCode,
      POCustomer: item?.Order?.POCustomer,
      createdAt: format(item?.createdAt, "dd/MM/yyyy"),
      customerName: item?.Order?.Customer?.customerName,
      supplierName: item?.Supplier?.name,
      totalPrice: formatter.format(Number(item?.totalPrice)),
    }));
    const heading = [
      [
        "Mã đơn bán",
        "Mã đơn mua",
        "Số PO",
        "Ngày bắt đầu PO",
        "Tên khách hàng",
        "Nhà cung cấp",
        "Giá trị",
      ],
    ];
    // Create Excel workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, heading);
    XLSX.utils.sheet_add_json(ws, dataToExport, {
      origin: "A2",
      skipHeader: true,
    });
    // const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(
      workbook,
      ws,
      `Nhập kho đơn hàng`
    );
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `nhap-kho-don-hang.xlsx`);
  };

  if (isLoading) return <LoadingView />;
  if (error instanceof Error && "response" in error) {
    const status = (error as any).response?.status;
    const type = (error as any).response?.type;
    const statusText = (error as any).response?.statusText;
    const message = (error as any).response?.data?.message;
    return (
      <ErrorViews
        status={status}
        statusText={statusText}
        message={message}
        type={type}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="flex py-2 justify-end items-end">
        <Button
          onClick={() =>
            listInputWarehouse?.data?.data?.results &&
            handleExportExcel(listInputWarehouse?.data?.data?.results)
          }
          className="ml-2"
          variant={"outline"}
        >
          Xuất Excel
        </Button>
      </div>
      <DataTable
        data={listInputWarehouse?.data?.data?.results || []}
        columns={columns}
      />
      <div className="mt-5 flex justify-end">
        <Paginations
          currentPage={pagination.page}
          pageCount={listInputWarehouse?.data?.data?.numberPages}
          pagination={pagination}
          setPagination={setPagination}
          onPageChange={(value: number) =>
            setPagination({ ...pagination, page: value })
          }
        />
      </div>
    </div>
  );
}
