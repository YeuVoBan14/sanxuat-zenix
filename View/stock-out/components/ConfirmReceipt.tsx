import { confirmOutput, updateProposal } from "@/api/purchase";
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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { ProcessInput } from "@/View/stock-in/components/ProcessInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

interface ProductDataType {
  productName: string;
  quantityStock: number;
  quantityExport: number;
  productId: number;
  unit: string;
  quantityOrder: number;
  statusConfirm: boolean;
  quantity: number;
}

export default function ConfirmReceipt({
  data,
  code,
  purchaseName,
  refetch,
}: {
  data: any;
  code: string;
  purchaseName: string;
  refetch: any;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const pageCount = Math.ceil(data?.WSProducts?.length / pageSize);
  const [productId, setProductId] = useState<number>();
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const fileInputRefs = useRef<HTMLInputElement | null>(null);
  const [fileUpload, setFileUpload] = useState();

  const [productsData, setProductsData] = useState<ProductDataType[]>([]);

  const queryClient = useQueryClient();

  const mutationConfirmOutput = useMutation({
    mutationFn: confirmOutput,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["confirmOutput"],
      });
      toast({
        title: "Thành công",
        description: "Xác nhận xuất kho thành công",
      });
      refetch();
      setOpenAlert(false);
    },
    onError: (error) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: error?.message,
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

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm({
    defaultValues: {
      dataProduct: productsData,
    },
    values: {
      dataProduct: productsData,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "dataProduct",
  });

  const currentData = fields.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  useEffect(() => {
    if (data.WSProducts) {
      const listProducts: ProductDataType[] = [];
      data.WSProducts.forEach(
        (item: {
          id: number;
          Product: { productName: string };
          quantity: number;
          quantityExport: number;
          Warehouse: { quantity: number };
          PurchaseOrderProduct: {
            Quote_History: { unit: string };
            quantityOrder: number;
          };
          statusConfirm: boolean;
        }) => {
          listProducts.push({
            productId: item.id,
            quantityExport: item.statusConfirm
              ? item.quantityExport
              : item.quantity,
            quantityStock: item.Warehouse.quantity,
            quantityOrder: item.PurchaseOrderProduct.quantityOrder,
            unit: item.PurchaseOrderProduct.Quote_History.unit,
            productName: item["Product"]?.productName,
            statusConfirm: item.statusConfirm,
            quantity: item.quantity,
          });
        }
      );
      setValue("dataProduct", listProducts);
      setProductsData(listProducts);
    }
    if (data) {
      setDocumentNumber(data?.documentNumber);
    }
  }, []);

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
      cell: ({ row }) => <div>{row.original["productName"]}</div>,
    },
    {
      accessorKey: "unit",
      header: "Đơn vị tính",
      cell: ({ row }) => <div>{row.original["unit"]}</div>,
    },
    {
      accessorKey: "invetory",
      header: "SL kho",
      cell: ({ row }) => <div>{row.original["quantityStock"]}</div>,
    },
    {
      accessorKey: "entry",
      header: "SL đặt",
      cell: ({ row }) => <div>{row.original["quantityOrder"]}</div>,
    },
    {
      accessorKey: "entry",
      header: "SL đề xuất",
      cell: ({ row }) => <div>{row.original["quantity"]}</div>,
    },
    {
      accessorKey: "entry",
      header: "SL xuất",
      cell: ({ row }) => (
        <Controller
          name={`dataProduct.${row.index}.quantityExport`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              className="w-20"
              type="number"
              min={1}
              defaultValue={field.value}
              onChange={field.onChange}
              disabled={row.original["statusConfirm"]}
            />
          )}
        />
      ),
    },
    {
      accessorKey: "statusConfirm",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div
          onClick={() => {
            if (!row.original["statusConfirm"]) {
              setProductId(row.original["productId"]);
              setOpenAlert(true);
            }
          }}
          className="flex justify-center items-center"
        >
          {row.original["statusConfirm"] ? (
            <Badge className="bg-green-500">Đã xuất</Badge>
          ) : (
            <Badge onClick={handleSubmit(handleSubmitOutput)}>Xác nhận</Badge>
          )}
        </div>
      ),
    },
  ];

  const handleSubmitOutput = (data: any) => {
    setProductsData(data.dataProduct);
  };

  const handleConfirmOutput = (
    data: ProductDataType[],
    productId: number | undefined
  ) => {
    if (productId) {
      const newQuantity = data.find(
        (item: { productId: number }) => item.productId === productId
      )?.quantityExport;
      if (newQuantity) {
        mutationConfirmOutput.mutate({
          id: productId,
          quantity: Number(newQuantity),
        });
      } else {
        alert("Bạn chưa điền số lượng xuất kho !!!");
      }
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
    <Dialog>
      <DialogTrigger asChild>
        {data?.statusAll?.id ? (
          <Badge className="bg-blue-500 hover:bg-blue-300">Hoàn tất</Badge>
        ) : (
          <Badge>Xuất kho</Badge>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>Đề xuất xuất kho</DialogTitle>
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
        <form>
          <DataTable data={currentData} columns={columns} />
          <div className="mt-5 flex justify-end">
            <Paginations
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
            />
          </div>
          <div className="flex w-full justify-end mt-2">
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
          <ProcessInput
            description="Bạn có thực sự muốn xác nhận xuất kho sản phẩm này?"
            title="Xác nhận xuất kho"
            open={openAlert}
            setOpen={setOpenAlert}
            loading={mutationConfirmOutput.isPending}
            handleDel={() => handleConfirmOutput(productsData, productId)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
