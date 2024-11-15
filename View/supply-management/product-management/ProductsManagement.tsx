"use client";
import SearchInput from "@/components/SearchInput";
import Delete from "@/components/icons/Delete";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import CreateProduct from "./components/CreateProduct";
import ProductDetails from "./components/ProductDetails";
import {
  deleteFileProduct,
  deleteProduct,
  getListProduct,
  uploadFileProduct,
} from "@/api/product";
import { toast } from "@/components/ui/use-toast";
import EditProduct from "./components/EditProduct";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Paginations } from "@/components/Pagination";
import { AlertDialogForm } from "@/components/AlertDialogForm";
import { handleApiError } from "@/lib/unauthorized-error";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import LoadingView from "@/components/LoadingView";
import ErrorViews from "@/components/ErrorViews";
import Print from "@/components/icons/Print";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

export default function ProductsManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [detailData, setDetailData] = useState();
  const [productData, setProductData] = useState();
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    keySearch: string;
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
  });

  const {
    data: productsData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["productsData", pagination],
    queryFn: () => getListProduct(pagination),
  });

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, keySearch: searchValue, page: 0 });
    }, 500);
    return () => clearTimeout(timeId);
  }, [searchValue]);

  const mutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productsData"],
      });
      toast({
        title: "Thành công",
        description: `Xóa sản phẩm thành công`,
      });
    },
    onError: (error: any) => {
      handleApiError(error, router, pathname);
    },
  });

  async function handleDeleteProduct(ProductID: number) {
    mutation.mutateAsync(ProductID);
  }

  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "STT",
      cell: ({ row }) => {
        return (
          <div key={row["index"]} className="capitalize">
            {row["index"] + 1 + pagination.page * pagination.pageSize}
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
      accessorKey: "producerInfo",
      header: "Nhà sản xuất",
      cell: ({ row }) => {
        return <div>{row.original["producerInfo"]?.["name"]}</div>;
      },
    },
    {
      accessorKey: "Supplier",
      header: "Nhà cung cấp",
      cell: ({ row }) => {
        return (
          <div>
            {row.original["suppliers"]?.length !== 0 && (
              <SupplierDetail data={row.original["suppliers"]} />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "unit",
      header: "Đơn vị tính",
      cell: ({ row }) => <div>{row.original["unit"]}</div>,
    },
    {
      accessorKey: "type",
      header: "Loại hình",
      cell: ({ row }) => {
        return <div>{row.original["type"]}</div>;
      },
    },
    {
      accessorKey: "MMQ",
      header: "M.O.Q",
      cell: ({ row }) => {
        return <div>{row.original["MMQ"]}</div>;
      },
    },
    {
      accessorKey: "image",
      header: "Ảnh",
      cell: ({ row }) => {
        return (
          <>
            {row.original["image"] !== null &&
              row.original["image"] !== "null" && (
                <a
                  href={`${row.original["image"]}`}
                  target="_blank"
                  className="hover:border-b-black hover:border-b-2"
                  rel="noopener noreferrer"
                >
                  File
                </a>
              )}
          </>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => {
                      setProductData(row.original);
                      setOpenDialog(true);
                    }}
                    className="px-1 border-r-2 border-[#E2E2E2]"
                  >
                    <Print width="20" height="20" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lưu trữ</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="px-1 border-r-2 border-[#E2E2E2]">
                    <EditProduct productData={row.original} refetch={refetch} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chỉnh sửa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="px-1">
                    <AlertDialogForm
                      action={<Delete width="20" height="20" />}
                      title="Bạn có chắc xóa sản phẩm này?"
                      handleSubmit={() =>
                        handleDeleteProduct(row.original["id"])
                      }
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xoá</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];
  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      productCode: item?.productCode,
      productName: item?.productName,
      producerInfo: item?.producerInfo?.name,
      suppliers: item?.suppliers
        ?.map((el: { name: string }) => el.name)
        ?.toString(),
      unit: item?.unit,
      type: item?.type,
      MMQ: item?.MMQ,
      file: item?.image,
    }));
    const heading = [
      [
        "Mã sản phẩm",
        "Tên sản phẩm",
        "Nhà sản xuất",
        "Nhà cung cấp",
        "Đơn vị tính",
        "Loại hình",
        "M.O.Q",
        "File ảnh",
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
    XLSX.utils.book_append_sheet(workbook, ws, `Dữ liệu sản phẩm`);
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `san-pham.xlsx`);
  };
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
    <div>
      <div className="flex justify-between w-full mb-2">
        <div className="flex justify-between items-center">
          <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm sản phẩm"
          />
        </div>
        <div className="flex">
          <Button
            onClick={() =>
              productsData?.data?.data?.products &&
              handleExportExcel(productsData?.data?.data?.products)
            }
            className="ml-2"
            variant={"outline"}
          >
            Xuất Excel
          </Button>
          <CreateProduct refetch={refetch} />
        </div>
      </div>
      {isLoading ? (
        <LoadingView />
      ) : (
        <>
          <DataTable
            data={productsData?.data?.data?.products || []}
            columns={columns}
            onRow={(value: any) => {
              setDetailData(
                productsData?.data?.data?.products?.find(
                  (item: { id: number }) => item.id === value
                )
              );
              setOpen(true);
            }}
          />
          <div className="mt-5 flex justify-end">
            <Paginations
              currentPage={pagination.page}
              pageCount={productsData?.data?.data?.numberPages}
              pagination={pagination}
              setPagination={setPagination}
              onPageChange={(value: number) =>
                setPagination({ ...pagination, page: value })
              }
            />
          </div>
        </>
      )}
      <ProductDetails
        setOpen={setOpen}
        open={open}
        productDetail={detailData}
      />
      <ArchiveFile
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        productData={productData}
        refetch={refetch}
      />
    </div>
  );
}

export function SupplierDetail({ data }: { data: any }) {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;
  const pageCount = data ? Math.ceil(data?.length / pageSize) : 0;

  const currentData = data?.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "STT",
      cell: ({ row }) => {
        return (
          <div key={row["index"]} className="capitalize">
            {row["index"] + 1 + currentPage * pageSize}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Tên ncc",
      cell: ({ row }) => <div>{row.original["name"]}</div>,
    },
    {
      accessorKey: "taxCode",
      header: "MST",
      cell: ({ row }) => <div>{row.original["taxCode"]}</div>,
    },
    {
      accessorKey: "phoneNumber",
      header: "SĐT",
      cell: ({ row }) => {
        return <div>{row.original["phoneNumber"]}</div>;
      },
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      cell: ({ row }) => {
        return <div>{row.original["address"]}</div>;
      },
    },
    {
      accessorKey: "bankAccount",
      header: "TK ngân hàng",
      cell: ({ row }) => {
        return <div>{row.original["bankAccount"]}</div>;
      },
    },
    {
      accessorKey: "fileSupplier",
      header: "File",
      cell: ({ row }) => {
        return (
          <>
            {row.original["fileSupplier"] !== null && (
              <a
                href={`${row.original["fileSupplier"]}`}
                target="_blank"
                className="hover:border-b-black hover:border-b-2"
                rel="noopener noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      id: "actions",
      header: "",
    },
  ];

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Badge variant="outline">Chi tiết</Badge>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Thông tin nhà cung cấp</DialogTitle>
          </DialogHeader>
          <div className="sm:max-w-[950px]">
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

export function ArchiveFile({
  productData,
  refetch,
  openDialog,
  setOpenDialog,
}: {
  productData: any;
  refetch: any;
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [listFile, setListFile] = useState<any[]>([]);
  const [note, setNote] = useState<string>("");
  const [fileProduct, setFileProduct] = useState<File | undefined>();

  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (productData?.ProductFiles) {
      setListFile(productData?.ProductFiles);
    }
  }, [productData]);

  const mutationDelete = useMutation({
    mutationFn: deleteFileProduct,
    onSuccess: (data) => {
      setListFile(
        listFile?.filter((item) => item?.id !== Number(data?.data?.data))
      );
      toast({
        title: "Thành công",
        description: `Xóa file sản phẩm thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  const mutationUploadFile = useMutation({
    mutationFn: uploadFileProduct,
    onSuccess: (data: any) => {
      setListFile([...listFile, data?.data?.data]);
      setOpen(false);
      toast({
        title: "Thành công",
        description: `Thêm file sản phẩm thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error?.message,
      });
    },
  });

  const handleDeleteFileProduct = (id: number) => {
    mutationDelete.mutate(id);
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "STT",
      cell: ({ row }) => {
        return (
          <div key={row["index"]} className="capitalize">
            {row["index"] + 1}
          </div>
        );
      },
    },
    {
      accessorKey: "file",
      header: "File",
      cell: ({ row }) => (
        <Button
          disabled={row.original["url"] ? false : true}
          variant={"outline"}
          onClick={() => window.open(row.original["url"], "_blank")}
        >
          Xem file
        </Button>
      ),
    },
    {
      accessorKey: "note",
      header: "Ghi chú về file sản phẩm",
      cell: ({ row }) => <div>{row.original["note"]}</div>,
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <div>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div>
                  <AlertDialogForm
                    action={<Delete width="20" height="20" />}
                    title="Bạn có chắc xóa file sản phẩm này?"
                    handleSubmit={() =>
                      handleDeleteFileProduct(row.original["id"])
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xoá</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  const handleUploadFile = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFileProduct(file);
    }
  };

  const handleUploadProductFile = () => {
    const formData = new FormData();
    formData.append("note", note);
    fileProduct && formData.append("file", fileProduct);
    mutationUploadFile.mutate({
      productId: productData?.id,
      formData: formData,
    });
  };

  return (
    <>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[1100px]">
          <DialogHeader>
            <DialogTitle>Danh sách file sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="max-h-[550px] overflow-y-auto scrollbar-thin">
            <div className="flex justify-end items-end mb-1">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                  <Button>Tải thêm file</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm file sản phẩm</DialogTitle>
                  </DialogHeader>
                  <div>
                    <Input
                      placeholder="Nhập ghi chú về file sản phẩm"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <Input
                      type="file"
                      id="picture"
                      onChange={handleUploadFile}
                    />
                  </div>
                  <div className="flex justify-end">
                    <DialogClose>
                      <Button variant={"outline"}>Huỷ</Button>
                    </DialogClose>
                    {mutationUploadFile.isPending ? (
                      <Button disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Xin chờ
                      </Button>
                    ) : (
                      <Button
                        className="ml-2"
                        onClick={() => handleUploadProductFile()}
                        variant={"default"}
                      >
                        Xác nhận
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="sm:max-w-[1050px]">
              <DataTable data={listFile || []} columns={columns} />
            </div>
            {/* <div className="mt-5 flex justify-end">
              <Paginations
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={setCurrentPage}
              />
            </div> */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
