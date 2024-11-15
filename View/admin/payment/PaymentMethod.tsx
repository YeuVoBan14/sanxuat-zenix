import { AlertDialogForm } from "@/components/AlertDialogForm";
import { Paginations } from "@/components/Pagination";
import Delete from "@/components/icons/Delete";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deletePaymentMethod, getPaymentMethod } from "@/api/payment";
import AddAndUpdatePaymentMethod from "./components/AddAndUpdatePaymentMethod";
import LoadingView from "@/components/LoadingView";
import ErrorViews from "@/components/ErrorViews";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

export function PaymentMethod() {
  const queryClient = useQueryClient();

  const {
    data: paymentMethodList,
    error,
    isLoading,
  } = useQuery({ queryKey: ["paymentMethodList"], queryFn: getPaymentMethod });

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const pageCount = paymentMethodList
    ? Math.ceil(paymentMethodList?.data?.length / pageSize)
    : 0;

  const currentData = paymentMethodList?.data?.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const mutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["paymentMethodList"],
      });
      toast({
        title: "Thành công",
        description: "Xoá điều kiện thanh toán thành công",
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error?.message,
      });
    },
  });

  const handleDelete = async (id: number) => {
    await mutation.mutateAsync(id);
  };

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      paymentMethod: item.name
    }),);
    const heading = [["Điều kiện thanh toán"]];
    // Create Excel workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, heading);
    XLSX.utils.sheet_add_json(ws, dataToExport, { origin: 'A2', skipHeader: true });
    // const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, ws, "Điều kiện thanh toán");
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `dk-thanhtoan.xlsx`);
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
      <div className="flex items-center py-4 justify-end">
        <AddAndUpdatePaymentMethod />
        <Button onClick={() => handleExportExcel(currentData)} className='ml-2' variant={"outline"}>Xuất Excel</Button>
      </div>
      <div className="border rounded-[10px]">
        {currentData?.length ?
          currentData?.map((item: any) => (
            <div className="grid grid-cols-4 border-b px-10 py-2">
              <div className="col-span-3">
                <p className="font-bold">{item.name}</p>
              </div>
              <div className="flex justify-end">
                <div className="flex gap-2">
                  <AddAndUpdatePaymentMethod edit={true} dataList={item} />
                  <AlertDialogForm
                    title="Bạn muốn xóa điều kiện thanh toán này?"
                    content="Xóa điều kiện thanh toán có thể ảnh hưởng đến dữ liệu hiện tại, bạn có chắc chắn muốn xóa?"
                    action={
                      (
                        <div className="cursor-pointer">
                          <Delete width="20" height="20" />
                        </div>
                      ) as any
                    }
                    handleSubmit={() => handleDelete(item?.id)}
                  />
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-none h-32 flex justify-center items-center">
              Không có dữ liệu.
            </div>
          )
        }
      </div>
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
