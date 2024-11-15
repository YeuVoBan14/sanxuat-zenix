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

const potentialData = [
  {
    GSR: 1000000,
    rival: 1000000,
    expectation: 2000000,
    arising: 1000000,
    potential: 3000000,
    created: "2022",
  },
  {
    GSR: 2000000,
    rival: 1000000,
    expectation: 3000000,
    arising: 1000000,
    potential: 4000000,
    created: "2023",
  },
  {
    GSR: 1000000,
    rival: 3000000,
    expectation: 4000000,
    arising: 2000000,
    potential: 6000000,
    created: "2024",
  },
];

const yearData = [
  { id: 1, value: "2020" },
  { id: 2, value: "2021" },
  { id: 3, value: "2022" },
  { id: 4, value: "2023" },
  { id: 5, value: "2024" },
  { id: 6, value: "2025" },
  { id: 7, value: "2026" },
  { id: 8, value: "2027" },
  { id: 9, value: "2028" },
  { id: 10, value: "2029" },
  { id: 11, value: "2030" },
];

export default function Potential({
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
  // currentDate.setDate(1);
  // const [date, setDate] = useState<DateRange | undefined>({
  //   from: currentDate,
  //   to: new Date(),
  // });
  useEffect(() => {
    setPotentialState(potentialData);
  }, [potentialData]);
  const [years, setYears] = useState<string>("2024");
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
    // {
    //   id: "id",
    //   header: "STT",
    //   cell: ({ row }) => {
    //     return (
    //       <div key={row["index"]} className="capitalize">
    //         {/* {pagination.page * pagination.pageSize + row["index"] + 1} */}
    //         {row["index"]}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "GSR",
      header: "Doanh số đăng ký GSR",
      cell: ({ row }) => <div>{row.original["GSR"]}</div>,
    },
    {
      accessorKey: "rival",
      header: "Doanh số đối thủ",
      cell: ({ row }) => <div>{row.original["rival"]}</div>,
    },
    {
      accessorKey: "expectation",
      header: "Doanh số kì vọng",
      cell: ({ row }) => <div>{row.original["expectation"]}</div>,
    },
    {
      accessorKey: "arising",
      header: "Doanh số phát sinh",
      cell: ({ row }) => <div>{row.original["arising"]}</div>,
    },
    {
      accessorKey: "potential",
      header: "Tổng tiềm năng",
      cell: ({ row }) => <div>{row.original["potential"]}</div>,
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
              <div className="px-1">
                <CreatePotential
                  // detailData={row.original}
                  edit={true}
                  yearsList={potentialState.map((item: any) => item.created)}
                  potentialState={potentialState}
                  setPotentialState={setPotentialState}
                  detailData={row.original}
                  // id={customerId}
                  // processCustomer={processCustomer}
                  // refetch={refetch}
                />
              </div>
              {/* <div className="mt-1 mr-1">
                <AlertDialogForm
                  action={<Delete width="20" height="20" />}
                  title="Bạn có chắc muốn xóa lịch làm việc này?"
                  handleSubmit={() => {}}
                />
              </div> */}
            </div>
          </div>
        );
      },
    },
  ];

  const handleExportExcel = (data: any, year: string) => {
    const dataToExport = data.map((item: any) => ({
      GSR: item?.GSR,
      rival: item?.rival,
      expectation: item?.expectation,
      arising: item?.arising,
      potential: item?.potential,
    }));
    const heading = [
      [
        "Doanh số đăng ký GSR",
        "Doanh số đối thủ",
        "Doanh số kì vọng",
        "Doanh số phát sinh",
        "Tổng tiềm năng",
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
    XLSX.utils.book_append_sheet(
      workbook,
      ws,
      `Dữ liệu tiềm năng khách hàng năm ${year}`
    );
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `tiem-nang-khach-hang-${year}.xlsx`);
  };

  // if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <>
      <div className=" w-full mb-2">
        <div className="flex justify-between items-center">
          {/* <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm người liên hệ, nội dung, kết quả, ..."
          /> */}
          <div>
            <Select onValueChange={(value) => setYears(value)} value={years}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {yearData?.map((item: any) => (
                  <SelectItem key={item?.id} value={item?.value}>
                    {item?.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex">
            <CreatePotential
              // id={customerId}
              edit={false}
              yearsList={potentialState?.map((item: any) => item.created)}
              potentialState={potentialState}
              setPotentialState={setPotentialState}

              // processCustomer={processCustomer}
              // refetch={refetch}
            />
            <Button
              onClick={() =>
                potentialState?.filter((item: any) => item.created === years) &&
                handleExportExcel(
                  potentialState?.filter((item: any) => item.created === years),
                  years
                )
              }
              className="ml-2"
              variant={"outline"}
            >
              Xuất Excel
            </Button>
          </div>
        </div>
      </div>
      <DataTable
        data={
          potentialState?.filter((item: any) => item.created === years) || []
        }
        columns={columns}
      />
      <div className="flex items-center mb-2 mt-2">
        <div className="w-[200px]">
          <p className="font-light">Thời gian sửa đổi gần nhất:</p>
        </div>
        <p className="ml-2 font-light">{format(new Date(), "dd/MM/yyyy")}</p>
      </div>
      <div className="flex items-center">
        <div className="w-[200px]">
          <p className="font-light">Người sửa đổi gần nhất:</p>
        </div>
        <p className="ml-2 font-light">Chu Thi Thu</p>
      </div>
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
  created: z.string({
    required_error: "Chưa chọn năm",
    description: "Chọn năm",
  }),
  GSR: z.string().min(1, {
    message: "Bạn chưa nhập doanh số đăng ký GSR",
  }),
  rival: z.string().min(1, {
    message: "Bạn chưa nhập doanh số đối thủ",
  }),
  arising: z.string().min(1, {
    message: "Bạn chưa nhập doanh số phát sinh",
  }),
});

export function CreatePotential({
  // id,
  edit,
  yearsList,
  potentialState,
  setPotentialState,
  detailData,
}: // detailData,
// processCustomer,
// refetch,
{
  // id: number;
  edit: boolean;
  yearsList: string[];
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
      created: "",
      GSR: 1,
      rival: 1,
      arising: 1,
    },
  });

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
      form.setValue("created", detailData?.created);
      form.setValue("GSR", detailData?.GSR.toString());
      form.setValue("rival", detailData?.rival.toString());
      form.setValue("expectation", detailData?.expectation.toString());
      form.setValue("arising", detailData?.arising.toString());
      form.setValue("potential", detailData?.potential.toString());
    }
  }, [detailData]);

  const handleSubmitSchedule = (data: any) => {
    data["GSR"] = Number(data["GSR"]);
    data["rival"] = Number(data["rival"]);
    data["expectation"] = data["GSR"] + data["rival"];
    data["potential"] = data["expectation"] + data["arising"];
    if (edit) {
      const itemIndex: number = potentialState?.findIndex(
        (item: any) => item.created === data["created"]
      );
      const newPotential = potentialState;
      if (itemIndex > -1) {
        newPotential[itemIndex] = data;
        setPotentialState(newPotential);
        setOpen(false);
      }
    } else {
      setPotentialState([...potentialState, data]);
      setOpen(false);
    }
  };

  const returnYearData = (yearData: any[]) => {
    if (edit) {
      return yearData;
    } else {
      return yearData?.filter((ele) => !yearsList.includes(ele.value));
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
            } tổng tiềm năng`}</DialogTitle>
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
                      name="created"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>
                            <span className="text-red-500">* </span> Năm
                          </FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                            value={field.value}
                            disabled={edit}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn năm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {returnYearData(yearData)?.map((item: any) => (
                                <SelectItem key={item?.id} value={item?.value}>
                                  {item?.value}
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
                      name="GSR"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-4">
                            <FormLabel className="flex">
                              <div className="text-red-600">*</div> Doanh số
                              đăng ký GSR
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập doanh số đăng ký GSR"
                                value={field.value}
                                onChange={field.onChange}
                                type="number"
                                min={1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="rival"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-4">
                            <FormLabel className="flex">
                              <div className="text-red-600">*</div> Doanh số đối
                              thủ
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập doanh số đối thủ"
                                value={field.value}
                                onChange={field.onChange}
                                type="number"
                                min={1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <p className="font-semibold text-[14px] mb-2 mt-2">
                      Doanh số kì vọng
                    </p>
                    <Input
                      placeholder="Nhập doanh số đăng ký GSR"
                      value={
                        Number(form.watch("GSR")) + Number(form.watch("rival"))
                      }
                      className="mb-3"
                      disabled
                      type="number"
                    />

                    <FormField
                      control={form.control}
                      name="arising"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-4">
                            <FormLabel className="flex">
                              <div className="text-red-600">*</div> Doanh số
                              phát sinh
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập doanh số phát sinh"
                                value={field.value}
                                onChange={field.onChange}
                                type="number"
                                min={1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <p className="font-semibold text-[14px] mb-2 mt-2">
                      Doanh số tổng tiềm năng
                    </p>
                    <Input
                      placeholder="Nhập doanh số tổng tiềm năng"
                      value={(
                        Number(form.watch("GSR")) +
                        Number(form.watch("rival")) +
                        Number(form.watch("arising"))
                      ).toString()}
                      disabled
                      type="number"
                      min={1}
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
