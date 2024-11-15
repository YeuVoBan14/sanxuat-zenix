import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import { Paginations } from "@/components/Pagination";
import { format } from "date-fns";
import {
  createScheduleWork,
  getCodeQuoteList,
  getListUserByDepartmentAndCustomerId,
  putCalendar,
  updateScheduleWork,
} from "@/api/quotations";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deleteCustomerContact,
  getScheduleCustomer,
  getTotalQuoteCustomer,
} from "@/api/customer";
import { Badge } from "@/components/ui/badge";
import DateRangePicker from "@/components/datePicker/DateRangePicker";
import { DateRange } from "react-day-picker";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";
import SelectComponent from "@/components/Select";
import { Input } from "@/components/ui/input";
import { AlertDialogForm } from "@/components/AlertDialogForm";
import Delete from "@/components/icons/Delete";
import Edit from "@/components/icons/Edit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as XLSX from "xlsx";

const archiveData = [
  {
    id: 1,
    createdAt: new Date(),
    file: "",
    categoryInfo: {
      id: "1",
      name: "BG",
    },
    note: "Ghi chú",
  },
  {
    id: 2,
    createdAt: new Date(),
    file: "https://sunvietbucket.s3.ap-southeast-1.amazonaws.com/products-quote/1722843334135-customer.jpg.jpg",
    categoryInfo: {
      id: "2",
      name: "YCBG",
    },
    note: "Ghi chú",
  },
  {
    id: 3,
    createdAt: new Date(),
    file: "https://sunvietbucket.s3.ap-southeast-1.amazonaws.com/products-quote/1722843334135-customer.jpg.jpg",
    categoryInfo: {
      id: "1",
      name: "BG",
    },
    note: "Ghi chú",
  },
];

export default function Attachment({
  customerId,
  processCustomer,
}: {
  customerId: number;
  processCustomer: string;
}) {
  const [searchValue, setSearchValue] = useState<string>("");
  const currentDate = new Date();
  const queryClient = useQueryClient();
  const [potentialState, setPotentialState] = useState<any[]>([]);
  currentDate.setDate(1);
  const [date, setDate] = useState<DateRange | undefined>({
    from: currentDate,
    to: new Date(),
  });
  // const [pagination, setPagination] = useState<{
  //   page: number;
  //   pageSize: number;
  //   keySearch: string;
  //   startDate: string;
  //   endDate: string;
  // }>({
  //   page: 0,
  //   pageSize: 10,
  //   keySearch: "",
  //   startDate: format(currentDate, "yyyy-MM-dd"),
  //   endDate: format(new Date(), "yyyy-MM-dd"),
  // });
  // const memoizedPagination = useMemo(() => pagination, [pagination]);

  // const {
  //     data: totalQuoteCustomer,
  //     error,
  //     isLoading,
  // } = useQuery({
  //     queryKey: ["totalQuoteCustomer", customerId, memoizedPagination],
  //     queryFn: () => getTotalQuoteCustomer(customerId, memoizedPagination),
  // });

  // useEffect(() => {
  //   const timeId = setTimeout(() => {
  //     setPagination({ ...pagination, keySearch: searchValue, page: 0 });
  //   }, 500);
  //   return () => clearTimeout(timeId);
  // }, [searchValue]);

  // useEffect(() => {
  //   if (date?.from && date?.to) {
  //     if (new Date(date?.to).getDate() - new Date(date?.from).getDate() > 0) {
  //       setPagination({
  //         ...pagination,
  //         startDate: format(date?.from, "yyyy-MM-dd"),
  //         endDate: format(date?.to, "yyyy-MM-dd"),
  //       });
  //     }
  //   }
  // }, [date]);

  // const mutationDel = useMutation({
  //   mutationFn: deleteCustomerContact,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["listCustomerContact"],
  //     });
  //     refetch();
  //     toast({
  //       title: "Thành công",
  //       description: "Xoá lịch liên hệ thành công",
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Thất bại",
  //       description: error.message,
  //     });
  //   },
  // });

  // const handleDeleteContact = async (id: number) => {
  //   await mutationDel.mutateAsync(id);
  // };

  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "STT",
      cell: ({ row }) => {
        return (
          <div key={row["index"]} className="capitalize">
            {/* {pagination.page * pagination.pageSize + row["index"] + 1} */}
            {row["index"] + 1}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Thời gian",
      cell: ({ row }) => (
        <div>{format(row.original["createdAt"], "dd/MM/yyyy kk:mm")}</div>
      ),
    },
    {
      accessorKey: "file",
      header: "File",
      cell: ({ row }) =>
        row.original["file"] && (
          <p
            onClick={() => window.open(row.original["file"], "_blank")}
            className="underline cursor-pointer"
          >
            File
          </p>
        ),
    },
    {
      accessorKey: "category",
      header: "Phân loại",
      cell: ({ row }) => <div>{row.original["categoryInfo"]?.name}</div>,
    },
    {
      accessorKey: "note",
      header: "Ghi chú",
      cell: ({ row }) => <div>{row.original["note"]}</div>,
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
                <CreateAttachment
                  // detailData={row.original}
                  edit={true}
                  potentialState={potentialState}
                  setPotentialState={setPotentialState}
                  detailData={row.original}
                  // id={customerId}
                  // processCustomer={processCustomer}
                  // refetch={refetch}
                />
              </div>
              <div className="mt-1 mr-1">
                <AlertDialogForm
                  action={<Delete width="20" height="20" />}
                  title="Bạn có chắc muốn xóa file này?"
                  handleSubmit={() => {}}
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
      createdAt: format(item?.createdAt, "dd/MM/yyyy kk:mm"),
      file: item?.file,
      category: item["categoryInfo"]?.name,
      note: item?.note,
    }));
    const heading = [["Thời gian", "File", "Phân loại", "Ghi chú"]];
    // Create Excel workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, heading);
    XLSX.utils.sheet_add_json(ws, dataToExport, {
      origin: "A2",
      skipHeader: true,
    });
    // const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, ws, `Dữ liệu lưu trữ khách hàng`);
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `luu-tru-khach-hang.xlsx`);
  };

  // if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <>
      <div className=" w-full mb-2">
        <div className="flex justify-between items-center">
          <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm ..."
          />
          <div className="flex">
            <DateRangePicker date={date} setDate={setDate} />
            <Button
              onClick={() => archiveData && handleExportExcel(archiveData)}
              className="ml-2"
              variant={"outline"}
            >
              Xuất Excel
            </Button>
            <CreateAttachment
              // id={customerId}
              edit={false}
              potentialState={potentialState}
              setPotentialState={setPotentialState}

              // processCustomer={processCustomer}
              // refetch={refetch}
            />
          </div>
        </div>
      </div>
      <DataTable data={archiveData || []} columns={columns} />
      {/* {!isLoading ? (
        <DataTable
          data={potentialData?.filter((item) => item.created === years) || []}
          columns={columns}
        />
      ) : (
        <div>Loading...</div>
      )} */}
      {/* <div className="mt-5 flex justify-end">
        <Paginations
          currentPage={pagination.page}
          pageCount={totalScheduleCustomer?.data?.data?.numberPages}
          pagination={pagination}
          setPagination={setPagination}
          onPageChange={(value: number) =>
            setPagination({ ...pagination, page: value })
          }
        />
      </div> */}
    </>
  );
}

const formSchema: z.ZodSchema<any> = z.object({
  file: z.any(),
  category: z.string().min(1, {
    message: "Bạn chưa chọn phân loại",
  }),
  note: z.string(),
});

export function CreateAttachment({
  // id,
  edit,
  potentialState,
  setPotentialState,
  detailData,
}: // detailData,
// processCustomer,
// refetch,
{
  // id: number;
  edit: boolean;
  potentialState: any[];
  setPotentialState: any;
  detailData?: any;
  // detailData?: any;
  // processCustomer: string;
  // refetch: any;
}) {
  const [open, setOpen] = useState(false);

  // <z.infer<typeof formSchema>></z.infer>

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
      category: "",
      note: "",
    },
  });

  const categoryData = [
    { id: "1", title: "BG" },
    { id: "2", title: "YCBG" },
  ];

  // const mutationCreate = useMutation({
  //   mutationFn: createScheduleWork,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["createScheduleWork"],
  //     });
  //     setIsLoading(false);
  //     setOpen(false);
  //     refetch();
  //     toast({
  //       title: "Thành công",
  //       description: "Thêm lịch làm việc với khách hàng thành công",
  //     });
  //   },
  //   onError: (error) => {
  //     setIsLoading(false);
  //     console.log(error);
  //     toast({
  //       title: "Thêm lịch làm việc với khách hàng thất bại",
  //       description: error.message,
  //     });
  //   },
  // });

  // const mutationEdit = useMutation({
  //   mutationFn: updateScheduleWork,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["updateScheduleWork"],
  //     });
  //     setIsLoading(false);
  //     setOpen(false);
  //     refetch();
  //     toast({
  //       title: "Thành công",
  //       description: "Cập nhật lịch làm việc với khách hàng thành công",
  //     });
  //   },
  //   onError: (error) => {
  //     setIsLoading(false);
  //     console.log(error);
  //     toast({
  //       title: "Cập nhật lịch làm việc với khách hàng thất bại",
  //       description: error.message,
  //     });
  //   },
  // });

  useEffect(() => {
    if (detailData) {
      form.setValue("category", detailData?.categoryInfo?.id);
      form.setValue("note", detailData?.note);
    }
  }, [detailData]);

  const handleSubmitSchedule = (data: any) => {
    setOpen(false);
  };

  const handleChangeFile = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      form.setValue("file", file);
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
              <Button
                onClick={() => {
                  form.reset();
                }}
                variant={"default"}
              >
                Thêm
              </Button>
            </div>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{`${
              edit ? "Cập nhật" : "Thêm"
            } file khách hàng`}</DialogTitle>
          </DialogHeader>
          <div className="w-full">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmitSchedule)}
                className="w-full"
              >
                <div className="w-full">
                  <div>
                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-4">
                            <FormLabel className="flex">
                              <div className="text-red-600">*</div> Tải file
                            </FormLabel>
                            <FormControl>
                              <Input
                                onChange={handleChangeFile}
                                type="file"
                                id="picture"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>
                            <span className="text-red-500">* </span> Phân loại
                          </FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryData?.map((item: any) => (
                                <SelectItem
                                  key={Number(item?.id)}
                                  value={item?.id}
                                >
                                  {item?.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-4">
                            <FormLabel className="flex">Ghi chú</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Nhập ghi chú về file"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4 flex justify-end">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Huỷ
                    </Button>
                  </DialogClose>
                  {/* <Button
                    type="submit"
                    variant="default"
                    disabled={[
                      mutationCreate.isPending,
                      mutationEdit.isPending,
                    ].includes(true)}
                  >
                    {[
                      mutationCreate.isPending,
                      mutationEdit.isPending,
                    ].includes(true) && (
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Xác nhận
                  </Button> */}
                  <Button type="submit" variant={"default"}>
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
