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
import ErrorViews from "@/components/ErrorViews";
import LoadingView from "@/components/LoadingView";
import * as XLSX from "xlsx";

export default function Contact({
  customerId,
  processCustomer,
}: {
  customerId: number;
  processCustomer: string;
}) {
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

  // const {
  //     data: totalQuoteCustomer,
  //     error,
  //     isLoading,
  // } = useQuery({
  //     queryKey: ["totalQuoteCustomer", customerId, memoizedPagination],
  //     queryFn: () => getTotalQuoteCustomer(customerId, memoizedPagination),
  // });

  const {
    data: totalScheduleCustomer,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["totalScheduleCustomer", customerId, memoizedPagination],
    queryFn: () => getScheduleCustomer(customerId, memoizedPagination),
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
    mutationFn: deleteCustomerContact,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomerContact"],
      });
      refetch();
      toast({
        title: "Thành công",
        description: "Xoá lịch liên hệ thành công",
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error.message,
      });
    },
  });

  const handleDeleteContact = async (id: number) => {
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
      header: "Ngày liên hệ",
      cell: ({ row }) => (
        <div>
          {format(new Date(row.original["sheduleWork"]), "dd/MM/yyyy kk:mm:ss")}
        </div>
      ),
    },
    {
      accessorKey: "process",
      header: "Tiến trình",
      cell: ({ row }) => <div>{row.original["process"]["id"]}</div>,
    },
    {
      accessorKey: "userContactInfo",
      header: "Người liên hệ",
      cell: ({ row }) => (
        <div>{row.original["userContactInfo"]["fullName"]}</div>
      ),
    },
    {
      accessorKey: "typeMeeting",
      header: "Loại hình hẹn",
      cell: ({ row }) => <div>{row.original["typeMeeting"]}</div>,
    },
    {
      accessorKey: "address",
      header: "Địa điểm",
      cell: ({ row }) => <div>{row.original["address"]}</div>,
    },
    {
      accessorKey: "content",
      header: "ND làm việc",
      cell: ({ row }) => <div>{row.original["content"]}</div>,
    },
    {
      accessorKey: "result",
      header: "Kết quả",
      cell: ({ row }) => <div>{row.original["result"]}</div>,
    },
    {
      accessorKey: "fileResult",
      header: "File",
      cell: ({ row }) =>
        row.original["fileResult"] && (
          <Link
            href={row.original["fileResult"]}
            target="_blank"
            className="text-blue-500 underline cursor-pointer"
          >
            Xem
          </Link>
        ),
    },
    {
      accessorKey: "type",
      header: "Phân loại",
      cell: ({ row }) => (
        <div>{row.original["type"] === "D" ? "Dự án" : "Tiêu hao"}</div>
      ),
    },
    {
      accessorKey: "task",
      header: "Phân công/ Nhiệm vụ",
      cell: ({ row }) => <div>{row.original["task"]}</div>,
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
                <CreateScheduleWork
                  detailData={row.original}
                  edit={true}
                  id={customerId}
                  processCustomer={processCustomer}
                  refetch={refetch}
                />
              </div>
              <div className="mt-1 mr-1">
                <AlertDialogForm
                  action={<Delete width="20" height="20" />}
                  title="Bạn có chắc muốn xóa lịch làm việc này?"
                  handleSubmit={() => handleDeleteContact(row.original["id"])}
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
      createdAt: format(new Date(item?.sheduleWork), "dd/MM/yyyy kk:mm:ss"),
      process: item?.process?.id + " - " + item?.process?.name,
      userContactInfo: item?.userContactInfo?.fullName,
      typeMeeting: item?.typeMeeting,
      address: item?.address,
      content: item?.content,
      result: item?.result,
      fileResult: item?.fileResult,
      type: item?.type === "D" ? "Dự án" : "Tiêu hao",
      task: item?.task,
    }));
    const heading = [
      [
        "Ngày liên hệ",
        "Tiến trình",
        "Người liên hệ",
        "Loại hình hẹn",
        "Địa điểm",
        "Nội dung làm việc",
        "Kết quả",
        "File đính kèm",
        "Phân loại",
        "Phân công/ Nhiệm vụ",
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
    XLSX.utils.book_append_sheet(workbook, ws, "Liên hệ khách hàng");
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `lien-he-khach-hang.xlsx`);
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
            placeholder="Tìm kiếm người liên hệ, nội dung, kết quả, ..."
          />
          <div className="flex">
            <DateRangePicker date={date} setDate={setDate} />
            <Button
              onClick={() =>
                totalScheduleCustomer?.data?.data?.results &&
                handleExportExcel(totalScheduleCustomer?.data?.data?.results)
              }
              className="ml-2"
              variant={"outline"}
            >
              Xuất Excel
            </Button>
            <CreateScheduleWork
              id={customerId}
              edit={false}
              processCustomer={processCustomer}
              refetch={refetch}
            />
          </div>
        </div>
      </div>
      {!isLoading ? (
        <DataTable
          data={totalScheduleCustomer?.data?.data?.results || []}
          columns={columns}
        />
      ) : (
        <LoadingView />
      )}
      <div className="mt-5 flex justify-end">
        <Paginations
          currentPage={pagination.page}
          pageCount={totalScheduleCustomer?.data?.data?.numberPages}
          pagination={pagination}
          setPagination={setPagination}
          onPageChange={(value: number) =>
            setPagination({ ...pagination, page: value })
          }
        />
      </div>
    </>
  );
}

const formSchema: z.ZodSchema<any> = z.object({
  sheduleWork: z.date({
    required_error: "Chưa chọn ngày để thêm lịch",
    description: "Chọn ngày để thêm lịch",
  }),
  process: z.string().min(2, {
    message: "Bạn chưa chọn tiến trình",
  }),
  userContact: z.number(),
  typeMeeting: z.string().min(1, {
    message: "Bạn chưa nhập loại hình hẹn",
  }),
  address: z.string().min(1, {
    message: "Bạn chưa nhập địa điểm",
  }),
  content: z.string().min(1, {
    message: "Bạn chưa nhập nội dung làm việc",
  }),
  result: z.string().min(1, {
    message: "Bạn chưa nhập kết quả",
  }),
  type: z.string().min(1, {
    message: "Bạn chưa chọn phân loại",
  }),
  task: z.string(),
  note: z.string(),
  typeWork: z.string(),
  codeWork: z.string(),
});

export function CreateScheduleWork({
  id,
  edit,
  detailData,
  processCustomer,
  refetch,
}: {
  id: number;
  edit: boolean;
  detailData?: any;
  processCustomer: string;
  refetch: any;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileSchedule, setFileSchedule] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const responseDatePickerRef = useRef<DatePicker>(null);
  const { data: listSale } = useQuery({
    queryKey: ["listSale", id],
    queryFn: () => getListUserByDepartmentAndCustomerId("sale", id),
  });
  const { data: listCodeQuote } = useQuery({
    queryKey: ["listCodeQuote"],
    queryFn: () => getCodeQuoteList({ id: id, type: "0" }),
  });
  const { data: listCodeRequireQuote } = useQuery({
    queryKey: ["listCodeRequireQuote"],
    queryFn: () => getCodeQuoteList({ id: id, type: "1" }),
  });

  // <z.infer<typeof formSchema>></z.infer>

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sheduleWork: new Date(),
      process: "",
      userContact: 0,
      typeMeeting: "",
      address: "",
      content: "",
      result: "",
      type: "",
      task: "",
      note: "",
      typeWork: "0",
      codeWork: "",
    },
  });

  const mutationCreate = useMutation({
    mutationFn: createScheduleWork,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["createScheduleWork"],
      });
      setIsLoading(false);
      setOpen(false);
      refetch();
      toast({
        title: "Thành công",
        description: "Thêm lịch làm việc với khách hàng thành công",
      });
    },
    onError: (error) => {
      setIsLoading(false);
      console.log(error);
      toast({
        title: "Thêm lịch làm việc với khách hàng thất bại",
        description: error.message,
      });
    },
  });

  const mutationEdit = useMutation({
    mutationFn: updateScheduleWork,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["updateScheduleWork"],
      });
      setIsLoading(false);
      setOpen(false);
      refetch();
      toast({
        title: "Thành công",
        description: "Cập nhật lịch làm việc với khách hàng thành công",
      });
    },
    onError: (error) => {
      setIsLoading(false);
      console.log(error);
      toast({
        title: "Cập nhật lịch làm việc với khách hàng thất bại",
        description: error.message,
      });
    },
  });

  const handleResponseDivClick = () => {
    if (responseDatePickerRef.current) {
      responseDatePickerRef.current.setFocus();
    }
  };

  const typeData = [
    { id: 1, value: "D", title: "Dự án" },
    { id: 2, value: "T", title: "Tiêu hao" },
    { id: 3, value: "DT", title: "Dự án & Tiêu hao" },
  ];

  const handleUploadFile = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFileSchedule(file);
    }
  };

  const processData = [
    { id: 1, name: "S1", title: "S1 - Khách hàng chung" },
    { id: 2, name: "S2", title: "S2 - Khách hàng tiềm năng" },
    { id: 3, name: "S3", title: "S3 - Khách hàng phát triển" },
    { id: 4, name: "S4", title: "S4 - Khách hàng có nhu cầu báo giá" },
    { id: 5, name: "S5", title: "S5 - Khách hàng muốn làm test" },
    { id: 6, name: "S6", title: "S6 - Đã gửi báo giá" },
    { id: 7, name: "S7", title: "S7 - Đang thương thảo" },
    { id: 8, name: "S8", title: "S8 - Đã có đơn hàng" },
    { id: 9, name: "S9", title: "S9 - Chăm sóc phát triển thêm" },
  ];

  const returnProcessArr = (
    processCustomer: string,
    process: string,
    edit: boolean
  ) => {
    const newProcess = edit ? process : processCustomer;
    switch (edit ? !!process : !!processCustomer) {
      case ["S1", "S2", "S3"].includes(newProcess):
        return [
          { id: 1, name: "S1" },
          { id: 2, name: "S2" },
          { id: 3, name: "S3" },
        ];
        break;
      case ["S4", "S5", "S6", "S7"].includes(newProcess):
        return [
          { id: 1, name: "S4" },
          { id: 2, name: "S5" },
          { id: 3, name: "S6" },
          { id: 4, name: "S7" },
        ];
        break;
      case ["S8"].includes(newProcess):
        return [{ id: 1, name: "S8" }];
        break;
      case ["S9"].includes(newProcess):
        return [{ id: 1, name: "S9" }];
        break;
      default:
        return [];
    }
  };

  useEffect(() => {
    if (detailData) {
      form.setValue("sheduleWork", new Date(detailData?.sheduleWork));
      form.setValue("process", detailData?.process?.id);
      form.setValue("userContact", detailData?.userContact);
      form.setValue("typeMeeting", detailData?.typeMeeting);
      form.setValue("address", detailData?.address);
      form.setValue("content", detailData?.content);
      form.setValue("result", detailData?.result);
      form.setValue("type", detailData?.type);
      form.setValue("task", detailData?.task);
      form.setValue("note", detailData?.note);
      if (!["S1", "S2", "S3"].includes(processCustomer)) {
        form.setValue("codeWork", detailData?.codeWork);
        form.setValue("typeWork", detailData?.typeWork["id"]);
      }
    }
  }, [detailData]);

  const returnCodeData = (type: string) => {
    if (type === "0") {
      return listCodeQuote?.data?.data?.map((item: string, index: number) => {
        return {
          id: index,
          name: item,
        };
      });
    } else {
      return listCodeRequireQuote?.data?.data?.map(
        (item: string, index: number) => {
          return {
            id: index,
            name: item,
          };
        }
      );
    }
  };

  const handleSubmitSchedule = (data: any) => {
    const formData = new FormData();
    formData.append(
      "typeSchedule",
      ["S1", "S2", "S3"].includes(processCustomer)
        ? JSON.stringify(false)
        : JSON.stringify(true)
    );
    if (!["S1", "S2", "S3"].includes(processCustomer)) {
      formData.append("typeWork", data["typeWork"]);
      formData.append("codeWork", data["codeWork"]);
    }
    formData.append("sheduleWork", data["sheduleWork"]);
    formData.append("process", data["process"]);
    formData.append("userContact", data["userContact"]);
    formData.append("typeMeeting", data["typeMeeting"]);
    formData.append("address", data["address"]);
    formData.append("content", data["content"]);
    formData.append("result", data["result"]);
    formData.append("type", data["type"]);
    formData.append("task", data["task"]);
    formData.append("note", data["note"]);
    fileSchedule && formData.append("file", fileSchedule);
    if (edit) {
      mutationEdit.mutate({ id: Number(detailData?.id), formData: formData });
    } else {
      mutationCreate.mutate({ id: Number(id), formData: formData });
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
                  form.setValue("process", processCustomer);
                }}
                variant={"default"}
              >
                Thêm
              </Button>
            </div>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{`${
              edit ? "Cập nhật" : "Thêm"
            } lịch làm việc`}</DialogTitle>
          </DialogHeader>
          <div className="w-full">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmitSchedule)}
                className="w-full"
              >
                <div className="w-full grid grid-cols-2 gap-2">
                  <div>
                    <FormField
                      control={form.control}
                      name="sheduleWork"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-2">
                            <FormLabel className="flex">
                              <div className="text-red-600">*</div> Lịch làm
                              việc
                            </FormLabel>
                            <FormControl>
                              <div
                                onClick={handleResponseDivClick}
                                className="flex items-center border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
                              >
                                <DatePicker
                                  ref={responseDatePickerRef}
                                  selected={field.value}
                                  onChange={field.onChange}
                                  showTimeSelect
                                  minDate={new Date()}
                                  dateFormat="dd/MM/yyyy HH:mm"
                                  placeholderText="Chọn ngày và giờ"
                                  className="w-full ml-3 border-none focus:outline-none focus:ring-0"
                                />
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </div>
                            </FormControl>
                            <FormDescription />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    {!["S1", "S2", "S3"].includes(
                      edit ? detailData?.process?.id : processCustomer
                    ) && (
                      <>
                        <FormField
                          control={form.control}
                          name="typeWork"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-row items-center mb-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="0" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Báo giá
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0 ml-4">
                                    <FormControl>
                                      <RadioGroupItem value="1" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Yêu cầu báo giá
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="codeWork"
                          render={({ field }) => (
                            <FormItem className="mb-2">
                              <Select
                                onValueChange={(value) => field.onChange(value)}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn mã BG/YCBG" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {returnCodeData(form.watch("typeWork"))
                                    ?.length > 0 ? (
                                    returnCodeData(form.watch("typeWork"))?.map(
                                      (item: any) => (
                                        <SelectItem
                                          key={item?.id}
                                          value={item?.name}
                                        >
                                          {item?.name}
                                        </SelectItem>
                                      )
                                    )
                                  ) : (
                                    <div className=" flex flex-col justify-between items-center">
                                      <img
                                        alt=""
                                        src="https://static.vecteezy.com/system/resources/thumbnails/007/104/553/small/search-no-result-not-found-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg"
                                        width={100}
                                        height={100}
                                      />
                                      <span className="text-[14px]">
                                        Không có dữ liệu
                                      </span>
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    <FormField
                      control={form.control}
                      name="process"
                      render={({ field }) => (
                        <FormItem className="mb-2">
                          <FormLabel>
                            <span className="text-red-500">* </span> Tiến trình
                          </FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn tiến trình" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {processData?.map((item: any) => (
                                <SelectItem key={item?.id} value={item?.name}>
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
                      name="userContact"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-2">
                            <FormLabel className="flex">
                              Người liên hệ
                            </FormLabel>
                            <FormControl>
                              <SelectComponent
                                key="userContact"
                                label=""
                                placeholder="Chọn một trong số người liên hệ"
                                data={listSale?.data?.data?.map(
                                  (item: any) => ({
                                    value: item.id,
                                    fullName: item.fullName,
                                  })
                                )}
                                value={field.value}
                                setValue={(val: number) => {
                                  form.setValue("userContact", val);
                                }}
                                displayProps="fullName"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="typeMeeting"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-2">
                            <FormLabel className="flex">
                              <div className="text-red-600">*</div> Loại hình
                              hẹn
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập loại hình hẹn"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel className="flex">
                              <div className="text-red-600">*</div> Địa chỉ
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập địa chỉ"
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

                  <div>
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-2">
                            <FormLabel className="flex">
                              <div className="text-red-600">*</div> Nội dung làm
                              việc
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập nội dung làm việc"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="result"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-2">
                            <FormLabel className="flex">
                              <div className="text-red-600">*</div> Kết quả
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập kết quả"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <Input
                      type="file"
                      className="mb-2"
                      onChange={handleUploadFile}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-2">
                            <FormLabel className="flex">
                              <div className="text-red-600">*</div> Phân loại
                            </FormLabel>
                            <FormControl>
                              <SelectComponent
                                key="type"
                                label=""
                                placeholder="Chọn phân loại"
                                data={typeData?.map((item) => {
                                  return {
                                    value: item.id,
                                    title: item.title,
                                  };
                                })}
                                value={
                                  typeData.find(
                                    (item) => item.value === field.value
                                  )?.id
                                }
                                setValue={(val: number) => {
                                  const typeItem = typeData?.find(
                                    (item) => item.id === val
                                  );
                                  typeItem &&
                                    form.setValue("type", typeItem?.value);
                                }}
                                displayProps="title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="task"
                      render={({ field }) => {
                        return (
                          <FormItem className="mb-2">
                            <FormLabel className="flex">
                              Phân công/Nhiệm vụ
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập phân công/nhiệm vụ"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel className="flex">Ghi chú</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập ghi chú"
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
                  <Button
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
