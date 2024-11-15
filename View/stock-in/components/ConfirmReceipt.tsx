import { Paginations } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/custom/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProcessInput } from "./ProcessInput";
import { confirmInputByOrder, updateProposal } from "@/api/purchase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function ConfirmReceipt({
  data,
  code,
  purchaseName,
  refetch,
  reload,
  setReload
}: {
  data: any;
  code: string;
  purchaseName: string;
  refetch: any;
  reload: boolean;
  setReload: (value: boolean) => void
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentData, setCurrentData] = useState([]);
  const pageSize = 10;
  const pageCount = Math.ceil(data?.WSProducts?.length / pageSize);
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const [productId, setProductId] = useState<number>();
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const fileInputRefs = useRef<HTMLInputElement | null>(null);
  const [fileUpload, setFileUpload] = useState();

  const queryClient = useQueryClient();

  const mutationConfirmIutput = useMutation({
    mutationFn: confirmInputByOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["confirmInputByOrder"],
      });
      toast({
        title: "Thành công",
        description: "Xác nhận nhập kho thành công",
      });
      refetch();
      setReload(!reload);
      setOpenAlert(false);
    },
    onError: (error) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: "Xác nhận nhập kho thất bại",
      });
    },
  });

  const mutationUpdateProposal = useMutation({
    mutationFn: updateProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["updateProposal"],
      });
      toast({
        title: "Thành công",
        description: "Cập nhật đề xuất thành công",
      });
      refetch();
      setOpenAlert(false);
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
    const updateData = () => {
      const newData: any = data?.WSProducts?.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
      );
      setCurrentData(newData as any);
    };

    if (data) {
      setDocumentNumber(data?.documentNumber);
    }

    updateData();
  }, [data, currentPage]);

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
      accessorKey: "productName",
      header: "Tên sản phẩm",
      cell: ({ row }) => <div>{row.original["Product"]["productName"]}</div>,
    },
    {
      accessorKey: "unit",
      header: "Đơn vị tính",
      cell: ({ row }) => (
        <div>{row.original["PurchaseOrderProduct"]["Quote_History"]?.unit}</div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Số lượng",
      cell: ({ row }) => <div>{row.original["PurchaseOrderProduct"]["Quote_History"]?.quantity}</div>,
    },
    {
      accessorKey: "invetory",
      header: "SL tồn",
      cell: ({ row }) => <div>{row.original["Warehouse"]?.quantity}</div>,
    },
    {
      accessorKey: "entried",
      header: "SL đã nhập",
      cell: ({ row }) => (
        <div>{row.original["PurchaseOrderProduct"]?.quantityWH}</div>
      ),
    },
    {
      accessorKey: "entry",
      header: "SL đề xuất nhập",
      cell: ({ row }) => <div>{row.original["quantity"]}</div>,
    },
    {
      accessorKey: "statusConfirm",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          {row.original["statusConfirm"] ? (
            <Badge className="bg-green-500 w-[75px] flex justify-center text-center">Đã nhập</Badge>
          ) : (
            <Badge
              onClick={() => {
                setOpenAlert(true);
                setProductId(row.original["id"]);
              }}
            >
              Xác nhận
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const handleConfirmInput = (productId: number | undefined) => {
    if (productId) {
      mutationConfirmIutput.mutate(productId);
    }
  };

  const handleUpdateProposal = (
    id: number,
    documentNumber: string,
    file: any
  ) => {
    const formData = new FormData();
    formData.append("documentNumber", documentNumber);
    formData.append("file", file);
    mutationUpdateProposal.mutate({ id: id, formData: formData });
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {data?.statusAll?.id ? (
            <Badge className="bg-blue-500 hover:bg-blue-300">Hoàn tất</Badge>
          ) : (
            <Badge>Nhập kho</Badge>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[820px]">
          <DialogHeader>
            <DialogTitle>Đề xuất nhập kho</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-1">
            <div className="font-medium">Ngày nhập hàng:</div>
            <div>
              {data?.statusAll?.id
                ? format(data?.updatedAt, "dd/MM/yyyy")
                : "chưa có"}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="font-medium">Số PO:</div>
            <div>{code}</div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="font-medium">Pur phụ trách:</div>
            <div>{purchaseName}</div>
          </div>
          {/* <div className="font-medium">Nhà cung cấp:</div>
          <div>{data?.supplierName}</div> */}
          <div className="grid grid-cols-2 gap-1">
            <div className="font-medium ">Số chứng từ:</div>
            <div>
              <Input
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-30"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="font-medium">File đình kèm:</div>
            {data?.deliveryRecordFile ? (
              <div className="flex items-center">
                <p
                  className="text-blue-600 underline cursor-pointer mr-2"
                  onClick={() => {
                    window.open(data?.deliveryRecordFile, "_blank");
                  }}
                >
                  Xem file
                </p>
                <p>/</p>
                <p
                  onClick={() => fileInputRefs.current?.click()}
                  className="text-blue-600 underline cursor-pointer ml-2"
                >
                  {fileUpload ? "Đã tải file" : "Tải lại file"}
                </p>
                <Input
                  type="file"
                  id={`picture`}
                  className="hidden"
                  // accept="image/*"
                  ref={(el) => (fileInputRefs.current = el)}
                  onChange={(event: any) => {
                    const file = event.target.files[0];
                    if (file) {
                      setFileUpload(file);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center">
                <p
                  onClick={() => fileInputRefs.current?.click()}
                  className="text-blue-600 underline cursor-pointer ml-2"
                >
                  {fileUpload ? "Đã tải file" : "Tải file"}
                </p>
                <Input
                  type="file"
                  id={`picture`}
                  className="hidden"
                  // accept="image/*"
                  ref={(el) => (fileInputRefs.current = el)}
                  onChange={(event: any) => {
                    const file = event.target.files[0];
                    if (file) {
                      setFileUpload(file);
                    }
                  }}
                />
              </div>
            )}
          </div>
          <DataTable data={currentData || []} columns={columns} />
          <div className="mt-2 flex justify-end">
            <Paginations
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
            />
          </div>
          <div className="flex w-full justify-end">
            {mutationUpdateProposal.isPending ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Xin chờ
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() =>
                  handleUpdateProposal(data?.id, documentNumber, fileUpload)
                }
              >
                Xác nhận
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <ProcessInput
        description="Bạn có thực sự muốn xác nhận nhập kho sản phẩm này?"
        title="Xác nhận nhập kho"
        open={openAlert}
        setOpen={setOpenAlert}
        loading={mutationConfirmIutput.isPending}
        handleDel={() => handleConfirmInput(productId)}
      />
    </>
  );
}
