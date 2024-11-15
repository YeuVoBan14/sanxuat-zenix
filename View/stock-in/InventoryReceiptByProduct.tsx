"use client";

import { Paginations } from "@/components/Pagination";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { PurchaseOrderDetails } from "./PurchaseOrderDetails";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialogContent } from "@/components/ui/alert-dialog";
import { confirmInput, getListProductsInStock } from "@/api/purchase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ProcessInput } from "./components/ProcessInput";
import { toast } from "@/components/ui/use-toast";
import LoadingView from "@/components/LoadingView";
import ErrorViews from "@/components/ErrorViews";
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

export function InventoryReceiptByProduct({ reload }: { reload: boolean }) {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    keySearch: "",
  });

  const {
    data: listInputWarehouseByProduct,
    refetch,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["listInputWarehouseByProduct", pagination],
    queryFn: () => getListProductsInStock(pagination),
  });

  useEffect(() => {
    refetch();
  }, [reload]);

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
      accessorKey: "productCode",
      header: "Mã sản phẩm",
      cell: ({ row }) => <div>{row.original["productCode"]}</div>,
    },

    {
      accessorKey: "productName",
      header: "Tên sản phẩm",
      cell: ({ row }) => <div>{row.original["productName"]}</div>,
    },
    {
      accessorKey: "producer",
      header: "Nhà sản xuất",
      cell: ({ row }) => <div>{row.original["producerInfo"]["name"]}</div>,
    },
    {
      accessorKey: "quantity",
      header: "Số lượng tồn kho",
      cell: ({ row }) => <div>{row.original["quantityTotal"]}</div>,
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end items-center">
          <ProductStockIn
            data={row.original["Warehouses"]}
            productName={row.original["productName"]}
            refetch={refetch}
          />
        </div>
      ),
    },
  ];

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      productCode: item?.productCode,
      productName: item?.productName,
      producerInfo: item?.producerInfo?.name,
      quantityTotal: item?.quantityTotal,
    }));
    const heading = [
      ["Mã sản phẩm", "Tên sản phẩm", "Nhà sản xuất", "Số lượng tồn kho"],
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
      `Nhập kho sản phẩm`
    );
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `nhap-kho-san-pham.xlsx`);
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
            listInputWarehouseByProduct?.data?.data?.results &&
            handleExportExcel(listInputWarehouseByProduct?.data?.data?.results)
          }
          className="ml-2"
          variant={"outline"}
        >
          Xuất Excel
        </Button>
      </div>
      <DataTable
        data={listInputWarehouseByProduct?.data?.data?.results || []}
        columns={columns}
      />
      <div className="mt-5 flex justify-end">
        <Paginations
          currentPage={pagination.page}
          pageCount={listInputWarehouseByProduct?.data?.data?.numberPages}
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

interface ProductDataType {
  supplierName: string;
  quantityStock: number;
  quantity: number;
  productId: number;
}

const ProductStockIn = ({
  data,
  productName,
  refetch,
}: {
  data: any;
  productName: string;
  refetch: any;
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const pageSize = 10;
  const pageCount = Math.ceil(data?.length / pageSize);
  const [productId, setProductId] = useState<number>();
  const [openAlert, setOpenAlert] = useState<boolean>(false);

  const [productsData, setProductsData] = useState<ProductDataType[]>([]);

  const queryClient = useQueryClient();

  const mutationConfirmInput = useMutation({
    mutationFn: confirmInput,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["confirmInput"],
      });
      refetch();
      toast({
        title: "Thành công",
        description: "Xác nhận nhập kho thành công",
      });
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

  useEffect(() => {
    if (data) {
      const listProducts: ProductDataType[] = [];
      data.forEach(
        (item: {
          id: number;
          Supplier: { name: string };
          quantity: number;
        }) => {
          listProducts.push({
            productId: item.id,
            quantity: 1,
            quantityStock: item.quantity,
            supplierName: item["Supplier"]?.name,
          });
        }
      );
      setValue("dataProduct", listProducts);
      setProductsData(listProducts);
    }
  }, []);

  const { fields } = useFieldArray({
    control,
    name: "dataProduct",
  });

  const currentData = fields.slice(
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
    // {
    //   accessorKey: "code",
    //   header: "Mã tham chiếu",
    //   cell: ({ row }) => <div>{row.getValue("code")}</div>,
    // },
    {
      accessorKey: "supplierName",
      header: "Nhà cung cấp",
      cell: ({ row }) => <div>{row.original["supplierName"]}</div>,
    },
    {
      accessorKey: "quantityStock",
      header: "SL kho",
      cell: ({ row }) => <div>{row.getValue("quantityStock")}</div>,
    },
    {
      accessorKey: "quantity",
      header: "SL nhập",
      cell: ({ row }) => (
        <Controller
          name={`dataProduct.${row.index}.quantity`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              defaultValue={field.value}
              type="number"
              min={1}
              onChange={field.onChange}
              className="w-20"
            />
          )}
        />
      ),
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <div
          onClick={() => {
            setProductId(row.original["productId"]);
            setOpenAlert(true);
          }}
          className="flex justify-end items-center"
        >
          <Button onClick={handleSubmit(handleSubmitInput)}>Xác nhận</Button>
        </div>
      ),
    },
  ];

  const handleSubmitInput = (data: any) => {
    setProductsData(data.dataProduct);
  };

  const handleConfirmInput = (
    data: ProductDataType[],
    productId: number | undefined
  ) => {
    if (productId) {
      const newQuantity = data.find(
        (item: { productId: number }) => item.productId === productId
      )?.quantity;
      if (newQuantity) {
        mutationConfirmInput.mutate({
          id: productId,
          quantity: Number(newQuantity),
        });
      } else {
        alert("Bạn chưa điền số lượng nhập kho !!!");
      }
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Badge>Nhập kho</Badge>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Sản phẩm {productName}</DialogTitle>
          </DialogHeader>
          <form>
            <DataTable data={currentData} columns={columns} />
            <div className="mt-5 flex justify-end">
              <Paginations
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={setCurrentPage}
              />
            </div>
            <ProcessInput
              description="Bạn có thực sự muốn xác nhận nhập kho sản phẩm này?"
              title="Xác nhận nhập kho"
              open={openAlert}
              setOpen={setOpenAlert}
              loading={mutationConfirmInput.isPending}
              handleDel={() => handleConfirmInput(productsData, productId)}
            />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
