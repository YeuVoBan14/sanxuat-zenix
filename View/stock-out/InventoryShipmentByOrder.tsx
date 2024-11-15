"use client";

import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PurchaseOrderDetails } from "./PurchaseOrderDetails";
import { exportOrderFile, getListWarehouse } from "@/api/purchase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Paginations } from "@/components/Pagination";
import { format } from "date-fns";
import LoadingView from "@/components/LoadingView";
import ErrorViews from "@/components/ErrorViews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import axios from "axios";
import * as XLSX from "xlsx";

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

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function InventoryShipmentByOrder() {
  const [currentPage, setCurrentPage] = useState(0);
  const [user, setUser] = useState<{ department: string; role: string }>();
  const [orderId, setOrderId] = useState<number>();
  const [isExport, setIsExport] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    type: "OUTPUT",
  });

  const queryClient = useQueryClient();

  const {
    data: listOutputWarehouse,
    refetch,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["listOutputWarehouse", pagination],
    queryFn: () => getListWarehouse(pagination),
  });

  const mutationExport = useMutation({
    mutationFn: exportOrderFile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["updateProposal"],
      });
      setIsExport(true);
      setFileUrl(data?.data?.data);
      toast({
        title: "Thành công",
        description: "Xuất BBGH/BBGT thành công",
      });
      refetch();
      // setOpenAlert(false);
    },
    onError: (error: any) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: error.response.data.message,
      });
    },
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userJson = JSON.parse(userData);
      setUser(userJson);
    }
  }, []);

  const handleDownloadFile = (url: string) => {
    // Thực hiện request để tải file
    if (url) {
      const urlArr = url.split("mega/");
      axios({
        url: url, // URL endpoint để tải file
        method: "GET",
        responseType: "blob", // Chỉ định kiểu dữ liệu là blob
      }).then((response) => {
        // Tạo một đường dẫn URL từ blob và tải xuống
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", urlArr[1]); // Tên file muốn tải xuống
        document.body.appendChild(link);
        link.click();
        setOpenDialog(false);
      });
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "STT",
      cell: ({ row }) => {
        return (
          <div className="capitalize">
            {row.index + 1 + currentPage * pagination.pageSize}
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
      header: "Số PO",
      cell: ({ row }) => {
        const rowData: { Order: { POCustomer: string } } = row.original;
        return <div>{rowData?.Order?.POCustomer}</div>;
      },
    },
    {
      accessorKey: "startDate",
      header: "Ngày lên đơn",
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
    {
      id: "action",
      cell: ({ row }) => (
        <Badge
          onClick={() => {
            setOpenDialog(true);
            setOrderId(row.original["id"]);
          }}
        >
          <p style={{ fontSize: "10px" }}>Xuất BBGH/BBNT</p>
        </Badge>
      ),
    },
  ];

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      codeOrder: item?.Order?.codeOrder,
      POCustomer: item?.Order?.POCustomer,
      createdAt: format(item?.createdAt, "dd/MM/yyyy"),
      customerName: item?.Order?.Customer?.customerName,
      totalPrice: formatter.format(Number(item?.totalPrice)),
    }));
    const heading = [
      ["Mã đơn bán", "Số PO", "Ngày lên đơn", "Tên khách hàng", "Giá trị"],
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
    XLSX.utils.book_append_sheet(workbook, ws, `Dữ liệu xuất kho`);
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `xuat-kho.xlsx`);
  };

  const handleExportFile = (id: number) => {
    mutationExport.mutate(id);
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
            listOutputWarehouse?.data?.data?.results &&
            handleExportExcel(listOutputWarehouse?.data?.data?.results)
          }
          className="ml-2"
          variant={"outline"}
        >
          Xuất Excel
        </Button>
      </div>
      <DataTable
        data={listOutputWarehouse?.data?.data?.results || []}
        columns={
          user?.department === "sale" || user?.role === "admin"
            ? columns
            : columns.filter((item: any) => item.id !== "action")
        }
      />
      <div className="mt-5 flex justify-end">
        <Paginations
          currentPage={pagination.page}
          pageCount={listOutputWarehouse?.data?.data?.numberPages}
          pagination={pagination}
          setPagination={setPagination}
          onPageChange={(value: number) =>
            setPagination({ ...pagination, page: value })
          }
        />
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xuất BBGH/BBNT</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Bạn có thực sự muốn xuất BBGH/BBNT này không?
          </DialogDescription>
          <DialogFooter>
            {mutationExport.isPending ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Xin chờ
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  if (isExport && fileUrl) {
                    handleDownloadFile(fileUrl);
                  } else {
                    orderId && handleExportFile(orderId);
                  }
                }}
              >
                {isExport ? "Tải xuống" : "Xác nhận"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
