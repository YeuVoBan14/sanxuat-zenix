"use client";

import { AlertDialogForm } from "@/components/AlertDialogForm";
import { Paginations } from "@/components/Pagination";
import Delete from "@/components/icons/Delete";
import { DataTable } from "@/components/ui/custom/data-table";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { deleteSupplier, getSupplierList } from "@/api/supply";
import CreateAndUpdateSupplier from "./components/CreateAndUpdateSupplier";
import SearchInput from "@/components/SearchInput";
import { handleApiError } from "@/lib/unauthorized-error";
import { usePathname, useRouter } from "next/navigation";
import LoadingView from "@/components/LoadingView";
import ErrorViews from "@/components/ErrorViews";
import SupplierDetail from "./components/SupplierDetail";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

export default function SupplierManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState<string>("");
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
    data: supplierList,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["supplierList", pagination],
    queryFn: () => getSupplierList(pagination),
  });

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, keySearch: searchValue, page: 0 });
    }, 500);
    return () => clearTimeout(timeId);
  }, [searchValue]);

  const mutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supplierList"],
      });
      toast({
        title: "Thành công",
        description: "Xoá nhà cung cấp thành công",
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
      cell: ({ row }) => {
        return (
          <div className="capitalize">
            {row["index"] + 1 + pagination.page * pagination.pageSize}
          </div>
        );
      },
    },
    {
      accessorKey: "abbreviation",
      header: "Tên viết tắt",
      cell: ({ row }) => <div>{row.original["abbreviation"]}</div>,
    },
    {
      accessorKey: "taxCode",
      header: "MST",
      cell: ({ row }) => <div>{row.original["taxCode"]}</div>,
    },
    {
      accessorKey: "name",
      header: "Tên nhà cung cấp",
      cell: ({ row }) => <div>{row.original["name"]}</div>,
    },
    {
      accessorKey: "userContact",
      header: "Người liên hệ",
      cell: ({ row }) => <div>{row.original["userContact"]}</div>,
    },
    {
      accessorKey: "phoneNumber",
      header: "SĐT",
      cell: ({ row }) => <div>{row.original["phoneNumber"]}</div>,
    },
    {
      accessorKey: "Email_Suppliers",
      header: "Email",
      cell: ({ row }) => (
        <>
          {row.original?.Email_Suppliers?.map((i: any) => (
            <div>{i?.email}</div>
          ))}
        </>
      ),
    },
    {
      accessorKey: "bankAccount",
      header: "TK ngân hàng",
      cell: ({ row }) => <div>{row.original["bankAccount"]}</div>,
    },
    {
      accessorKey: "paymentMethod",
      header: "ĐKTT",
      cell: ({ row }) => <div>{row.original["paymentMethod"]?.name}</div>,
    },
    {
      accessorKey: "rate",
      header: "Đánh giá",
      cell: ({ row }) => <div>{row.original["rate"]}</div>,
    },
    {
      accessorKey: "fileSupplier",
      header: "File",
      cell: ({ row }) => (
        <>
          {row.original["fileSupplier"] !== "" && (
            <a
              className="hover:border-b-black hover:border-b-2"
              href={`${row.original["fileSupplier"]}`}
              target="_blank"
            >
              File
            </a>
          )}
        </>
      ),
    },
    {
      id: "action",
      header: "",
      cell: ({ row }: { row: any }) => {
        return (
          <div className="flex justify-end">
            <div className="flex gap-2 items-center">
              <SupplierDetail data={row.original} />
              <CreateAndUpdateSupplier edit={true} dataList={row.original} />
              <AlertDialogForm
                title="Bạn muốn xóa nhà cung cấp này?"
                content="Xóa nhà cung cấp có thể ảnh hưởng đến dữ liệu hiện tại, bạn có chắc chắn muốn xóa?"
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
        );
      },
    },
  ];

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      abbreviation: item?.abbreviation,
      taxCode: item?.taxCode,
      name: item?.name,
      userContact: item?.userContact,
      phoneNumber: item?.phoneNumber,
      Email_Suppliers: item?.Email_Suppliers?.map(
        (i: any) => i?.email
      )?.toString(),
      bankAccount: item?.bankAccount,
      paymentMethod: item?.paymentMethod?.name,
      rate: item?.rate,
      fileSupplier: item?.fileSupplier,
    }));
    const heading = [
      [
        "Tên viết tắt",
        "Mã số thuế",
        "Tên nhà cung cấp",
        "Người liên hệ",
        "Số điện thoại",
        "Email",
        "Tài khoản ngân hàng",
        "Điều kiện thanh toán",
        "Đánh giá",
        "File",
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
    XLSX.utils.book_append_sheet(workbook, ws, `Dữ liệu nhà cung cấp`);
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `nha-cung-cap.xlsx`);
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
    <div className="w-auto">
      <div className="flex py-2 justify-between items-center">
        <SearchInput
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          placeholder="Tìm kiếm nhà cung cấp"
        />
        <div className="flex">
          <Button
            onClick={() =>
              supplierList?.data?.results &&
              handleExportExcel(supplierList?.data?.results)
            }
            className="mr-2"
            variant={"outline"}
          >
            Xuất Excel
          </Button>
          <CreateAndUpdateSupplier />
        </div>
      </div>
      {isLoading ? (
        <LoadingView />
      ) : (
        <>
          <DataTable
            data={supplierList?.data?.results || []}
            columns={columns}
          />
          <div className="mt-5 flex justify-end">
            <Paginations
              currentPage={pagination.page}
              pageCount={supplierList?.data?.numberPages}
              pagination={pagination}
              setPagination={setPagination}
              onPageChange={(value: number) =>
                setPagination({ ...pagination, page: value })
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
