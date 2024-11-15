"use client";

import { Paginations } from "@/components/Pagination";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getListHistoryWarehouse } from "@/api/purchase";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

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
const fakeUserData = {
  data: [
    {
      id: 1,
      codePO: "DM-1",
      productCode: "AZ-01-1",
      productname: "Ốc vít nhỏ Az-01",
      date: "24/06/2024",
      supplierName: "Nhà cung cấp A",
      quantity: 12,
      price: 150000,
      isTrade: true,
    },
    {
      id: 2,
      codePO: "DM-1",
      productCode: "AZ-01-2",
      productname: "Ốc vít nhỏ Az-01",
      date: "24/06/2024",
      supplierName: "Nhà cung cấp B",
      quantity: 12,
      price: 200000,
      isTrade: false,
    },
    {
      id: 3,
      codePO: "DM-2",
      productCode: "HZS-01-1",
      productname: "Bu Lông HZS-01",
      date: "24/06/2024",
      supplierName: "Nhà cung cấp C",
      quantity: 8,
      price: 200000,
      isTrade: true,
    },
    {
      id: 4,
      codePO: "DM-2",
      productCode: "HZS-01-2",
      productname: "Bu Lông HZS-01",
      date: "24/06/2024",
      supplierName: "Nhà cung cấp D",
      quantity: 2,
      price: 200000,
      isTrade: false,
    },
  ],
};

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function HistoryWarehouseView() {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const pageSize = 10;
  const userList = fakeUserData;
  const pageCount = Math.ceil(userList.data.length / pageSize);
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
  }>({
    page: 0,
    pageSize: 10,
  });

  const currentData = userList.data.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const { data: listHistoryWarehouse, refetch } = useQuery({
    queryKey: ["listHistoryWarehouse", pagination],
    queryFn: () => getListHistoryWarehouse(pagination),
  });

  useEffect(() => {
    refetch();
  }, [])

  const columns: ColumnDef<any>[] = [
    {
      header: "STT",
      cell: ({ row }) => {
        return (
          <div className="capitalize">
            {row.index + 1 + pagination.page * pageSize}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Ngày nhập/xuất",
      cell: ({ row }) => (
        <div>{format(row.original["updatedAt"], "dd/MM/yyyy")}</div>
      ),
    },
    // {
    //   accessorKey: "productCode",
    //   header: "Mã tham chiếu",
    //   cell: ({ row }) => <div>{row.getValue("productCode")}</div>,
    // },
    {
      accessorKey: "productname",
      header: "Tên sản phẩm",
      cell: ({ row }) => <div>{row.original["Product"]["productName"]}</div>,
    },
    {
      accessorKey: "supplierName",
      header: "Nhà cung cấp",
      cell: ({ row }) => <div>{row.original["Supplier"]["name"]}</div>,
    },
    {
      accessorKey: "quantity",
      header: "SL xuất/nhập",
      cell: ({ row }) => (
        <div>
          {row.original["WarehouseSuggest"]["type"] === "INPUT"
            ? row.original["quantity"]
            : row.original["quantityExport"]}
        </div>
      ),
    },
    {
      accessorKey: "isTrade",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex justify-start items-center">
          <Badge
            className={`${
              row.original["WarehouseSuggest"]["type"] === "INPUT"
                ? "bg-blue-500 hover:bg-blue-500"
                : "bg-red-500 hover:bg-red-500"
            }`}
          >
            {" "}
            {row.original["WarehouseSuggest"]["type"] === "INPUT"
              ? "Nhập"
              : "Xuất"}
          </Badge>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="flex py-2 justify-end items-end"></div>
      <DataTable
        data={listHistoryWarehouse?.data?.data?.results || []}
        columns={columns}
      />
      <div className="mt-5 flex justify-end">
        <Paginations
          currentPage={pagination.page}
          pageCount={listHistoryWarehouse?.data?.data?.numberPages}
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
