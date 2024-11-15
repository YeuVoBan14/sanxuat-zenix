import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Paginations } from "@/components/Pagination";
import { format } from "date-fns";
import { putCalendar } from "@/api/quotations";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCustomerReview,
  deleteCustomerReview,
  getCustomerReview,
  getTotalQuoteCustomer,
  updateCustomerReview,
} from "@/api/customer";
import { Badge } from "@/components/ui/badge";
import DateRangePicker from "@/components/datePicker/DateRangePicker";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { AlertDialogForm } from "@/components/AlertDialogForm";
import Delete from "@/components/icons/Delete";
import Edit from "@/components/icons/Edit";
import ErrorViews from "@/components/ErrorViews";
import LoadingView from "@/components/LoadingView";
import * as XLSX from "xlsx";

export default function Review({ customerId }: { customerId: number }) {
  const [searchValue, setSearchValue] = useState<string>("");
  const currentDate = new Date();
  const queryClient = useQueryClient();
  currentDate.setDate(1);
  const [date, setDate] = useState<DateRange | undefined>({
    from: currentDate,
    to: new Date(),
  });
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    keySearch: string;
    startDate: string;
    endDate: string;
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
    startDate: format(currentDate, "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const memoizedPagination = useMemo(() => pagination, [pagination]);

  const {
    data: customerReviewList,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["customerReviewList", customerId, memoizedPagination],
    queryFn: () => getCustomerReview(customerId, memoizedPagination),
  });

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, keySearch: searchValue, page: 0 });
    }, 500);
    return () => clearTimeout(timeId);
  }, [searchValue]);

  useEffect(() => {
    if (date?.from && date?.to) {
      if (new Date(date?.to).getDate() - new Date(date?.from).getDate() > 0) {
        setPagination({
          ...pagination,
          startDate: format(date?.from, "yyyy-MM-dd"),
          endDate: format(date?.to, "yyyy-MM-dd"),
        });
      }
    }
  }, [date]);

  const mutationDel = useMutation({
    mutationFn: deleteCustomerReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomerReview"],
      });
      refetch();
      toast({
        title: "Thành công",
        description: "Xoá đánh giá khách hàng thành công",
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error.message,
      });
    },
  });

  const handleDeleteReview = async (id: number) => {
    await mutationDel.mutateAsync(id);
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "STT",
      cell: ({ row }) => {
        return (
          <div key={row["index"]} className="capitalize">
            {pagination.page * pagination.pageSize + row["index"] + 1}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày đánh giá",
      cell: ({ row }) => (
        <div>
          {format(new Date(row.original["createdAt"]), "dd/MM/yyyy kk:mm:ss")}
        </div>
      ),
    },
    {
      accessorKey: "creatorInfo",
      header: "Người tạo đánh giá",
      cell: ({ row }) =>
        row.original["creatorInfo"] && (
          <div>{row.original["creatorInfo"]["fullName"]}</div>
        ),
    },
    {
      accessorKey: "score",
      header: "Điểm",
      cell: ({ row }) => <div>{row.original["score"]}</div>,
    },
    {
      accessorKey: "notes",
      header: "Ghi chú",
      cell: ({ row }) => <div>{row.original["notes"]}</div>,
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => {
        return (
          <div
            className="flex justify-end"
            onDoubleClick={(event) => event.stopPropagation()}
          >
            <div className="flex gap-2 items-center">
              <div className="px-1 border-r-2 border-[#E2E2E2]">
                <CreateCustomerReview
                  edit={true}
                  id={customerId}
                  refetch={refetch}
                  detailData={row.original}
                />
              </div>
              <div className="mt-1 mr-1">
                <AlertDialogForm
                  action={<Delete width="20" height="20" />}
                  title="Bạn có chắc muốn xóa đánh giá này?"
                  handleSubmit={() => handleDeleteReview(row.original["id"])}
                />
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      createdAt: format(new Date(item?.createdAt), "dd/MM/yyyy kk:mm:ss"),
      creatorInfo: item?.creatorInfo?.fullName,
      score: item?.score,
      notes: item?.notes,
    }));
    const heading = [
      ["Ngày đánh giá", "Người tạo đánh giá", "Điểm", "Ghi chú"],
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
    XLSX.utils.book_append_sheet(workbook, ws, `Dữ liệu đánh giá khách hàng`);
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `danh-gia-khach-hang.xlsx`);
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
    <>
      <div className=" w-full mb-2">
        <div className="flex justify-between items-center">
          <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm đánh giá"
          />
          <div className="w-52 flex justify-between items-end">
            <h1 className="font-bold">Tổng số đánh giá: </h1>
            <p>{customerReviewList?.data?.data?.total}</p>
          </div>
          <div className="flex">
            <DateRangePicker date={date} setDate={setDate} />
            <Button
              onClick={() =>
                customerReviewList?.data?.data?.results &&
                handleExportExcel(customerReviewList?.data?.data?.results)
              }
              className="ml-2"
              variant={"outline"}
            >
              Xuất Excel
            </Button>
            <CreateCustomerReview
              edit={false}
              id={customerId}
              refetch={refetch}
            />
          </div>
        </div>
      </div>
      {isLoading ? (
        <LoadingView />
      ) : (
        <>
          <DataTable
            data={customerReviewList?.data?.data?.results || []}
            columns={columns}
          />
          <div className="mt-5 flex justify-end">
            <Paginations
              currentPage={pagination.page}
              pageCount={customerReviewList?.data?.data?.numberPages}
              pagination={pagination}
              setPagination={setPagination}
              onPageChange={(value: number) =>
                setPagination({ ...pagination, page: value })
              }
            />
          </div>
        </>
      )}
    </>
  );
}

const formSchema: z.ZodSchema<any> = z.object({
  score: z.string({ required_error: "Trường này là bắt buộc" }).min(0),
  notes: z.string(),
});

export function CreateCustomerReview({
  id,
  refetch,
  edit,
  detailData,
}: {
  id: number;
  refetch: any;
  edit: boolean;
  detailData?: { notes: string; score: number; id: number };
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (edit && detailData) {
      form.setValue("score", detailData.score.toString());
      form.setValue("notes", detailData.notes);
    }
  }, [edit, detailData]);

  const mutation = useMutation({
    mutationFn: createCustomerReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomerReview"],
      });
      setOpen(false);
      refetch();
      toast({
        title: "Thành công",
        description: "Thêm đánh giá khách hàng thành công",
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error.message,
      });
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: updateCustomerReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomerReview"],
      });
      setOpen(false);
      refetch();
      toast({
        title: "Thành công",
        description: "Cập nhật đánh giá khách hàng thành công",
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error.message,
      });
    },
  });

  const handleSubmit = async (data: any) => {
    if (edit) {
      await mutationUpdate.mutateAsync({
        id: detailData?.id ? detailData?.id : 0,
        data: data,
      });
    } else {
      data["customerId"] = Number(id);
      await mutation.mutateAsync(data);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {edit ? (
            <div>
              <Edit width="20" height="20" />
            </div>
          ) : (
            <div className="ml-2">
              <Button variant={"default"}>Thêm đánh giá</Button>
            </div>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm đánh giá khách hàng</DialogTitle>
          </DialogHeader>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="max-w-md w-full"
              >
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => {
                    return (
                      <FormItem className="mb-4">
                        <FormLabel className="flex">
                          <div className="text-red-600">*</div> Điểm
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            onChange={field.onChange}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="flex">
                          <div className="text-red-600">*</div> Ghi chú
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập ghi chú"
                            onChange={field.onChange}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Huỷ
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={
                      edit ? mutationUpdate.isPending : mutation.isPending
                    }
                  >
                    {[mutation.isPending, mutationUpdate.isPending].includes(
                      true
                    ) && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                    Xác nhận
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
