import { deleteBankAccount, getBankAccount } from "@/api/payment";
import { AlertDialogForm } from "@/components/AlertDialogForm";
import { Paginations } from "@/components/Pagination";
import Delete from "@/components/icons/Delete";
import { DataTable } from "@/components/ui/custom/data-table";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import AddAndUpdateBankAccount from "./components/AddAndUpdateBankAccount";
import LoadingView from "@/components/LoadingView";
import ErrorViews from "@/components/ErrorViews";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

export function BankAccount() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);

  const {
    data: bankAccountList,
    error,
    isLoading,
    refetch
  } = useQuery({ queryKey: ["bankAccountList"], queryFn: getBankAccount });

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const pageCount = bankAccountList
    ? Math.ceil(bankAccountList?.data?.length / pageSize)
    : 0;

  const currentData = bankAccountList?.data?.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const mutation = useMutation({
    mutationFn: deleteBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bankAccountList"],
      });
      toast({
        title: "Thành công",
        description: "Xoá tài khoản ngân hàng thành công",
      });
    },
    onError: () => {
      toast({
        title: "Thất bại",
        description: "Xoá tài khoản ngân hàng thất bại",
      });
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
            {row["index"] + 1 + currentPage * pageSize}
          </div>
        );
      },
    },
    {
      accessorKey: "nameAccount",
      header: "Tên tài khoản",
      cell: ({ row }) => <div>{row.original["nameAccount"]}</div>,
    },
    {
      accessorKey: "numberAccount",
      header: "Số tài khoản",
      cell: ({ row }) => <div>{row.original["numberAccount"]}</div>,
    },
    {
      accessorKey: "nameBank",
      header: "Ngân hàng",
      cell: ({ row }) => <div>{row.original["nameBank"]}</div>,
    },
    {
      accessorKey: "branch",
      header: "Chi nhánh",
      cell: ({ row }) => <div>{row.original["branch"]}</div>,
    },

    {
      id: "id",
      header: "",
      cell: ({ row }: { row: any }) => {
        return (
          <div className="flex justify-end">
            <div className="flex gap-2">
              <AddAndUpdateBankAccount
                edit={true}
                dataList={row.original}
                refetch={refetch}
              />
              <AlertDialogForm
                title="Bạn muốn xóa tài khoản ngân hàng này?"
                content="Xóa tài khoản ngân hàng có thể ảnh hưởng đến dữ liệu hiện tại, bạn có chắc chắn muốn xóa?"
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
      nameAccount: item.nameAccount,
      numberAccount: item.numberAccount,
      nameBank: item.nameBank,
      branch: item.branch
    }),);
    const heading = [["Tên tài khoản", "Số tài khoản", "Ngân hàng", "Chi nhánh"]];
    // Create Excel workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, heading);
    XLSX.utils.sheet_add_json(ws, dataToExport, { origin: 'A2', skipHeader: true });
    // const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, ws, "Quản trị thanh toán");
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `thanhtoan.xlsx`);
  }

  if (isLoading) return <LoadingView />;

  if (error instanceof Error && "response" in error) {
    const status = (error as any).response?.status;
    const type = (error as any).response?.type;
    const statusText = (error as any).response?.statusText;
    const message = (error as any).response?.data?.message;
    return (
      <ErrorViews status={status} statusText={statusText} message={message} type={type} />
    );
  }

  return (
    <div className="w-full">
      <div className="flex  py-2 justify-end items-end">
        <AddAndUpdateBankAccount
          refetch={refetch}
        />
        {/* <Button onClick={() => handleExportExcel(currentData)} className='ml-2' variant={"outline"}>Xuất Excel</Button> */}
      </div>
      <DataTable
        data={currentData || []}
        columns={columns}
      />
      <div className="mt-5 flex justify-end">
        <Paginations
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
