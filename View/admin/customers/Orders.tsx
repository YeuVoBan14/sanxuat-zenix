"use client";
import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getTotalOrderCustomer, postComplain } from "@/api/customer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Paginations } from "@/components/Pagination";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/datePicker/DateRangePicker";
import { getListUserByDepartment } from "@/api/quotations";
import { Badge } from "@/components/ui/badge";
import ErrorViews from "@/components/ErrorViews";
import LoadingView from "@/components/LoadingView";
import * as XLSX from "xlsx";

export default function Orders({ customerId }: { customerId: number }) {
  const [searchValue, setSearchValue] = useState<string>("");
  const currentDate = new Date();
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
    data: totalOrderCustomer,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["totalOrderCustomer", customerId, memoizedPagination],
    queryFn: () => getTotalOrderCustomer(customerId, memoizedPagination),
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
      accessorKey: "codeOrder",
      header: "Số báo giá",
      cell: ({ row }) => <div>{row.original["codeOrder"]}</div>,
    },
    {
      accessorKey: "POCustomer",
      header: "Số P.O",
      cell: ({ row }) => <div>{row.original["POCustomer"]}</div>,
    },
    {
      accessorKey: "datePO",
      header: "Ngày P.O",
      cell: ({ row }) =>
        row.original?.OrderProducts[0]?.Quote_History && (
          <div>
            {format(
              row.original?.OrderProducts[0]?.Quote_History["updatedAt"],
              "dd/MM/yyyy HH:mm"
            )}
          </div>
        ),
    },
    {
      accessorKey: "moneyPO",
      header: "Trị giá P.O",
      cell: ({ row }) =>
        row.original?.OrderProducts[0]?.Quote_History && (
          <div>
            {Number(
              row.original?.OrderProducts[0]?.Quote_History["priceSale"]
            ) *
              Number(row.original?.OrderProducts[0]?.Quote_History["quantity"])}
          </div>
        ),
    },
    {
      accessorKey: "dateOrder",
      header: "Ngày giao hàng",
      cell: ({ row }) => {
        return (
          row.original?.OrderProducts[0]?.Quote_History && (
            <div>
              {row.original?.OrderProducts[0]?.Quote_History["deliveryTime"]}
            </div>
          )
        );
      },
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <AddComplain complainData={row.original} />
          </div>
        );
      },
    },
  ];

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      codeOrder: item?.codeOrder,
      POCustomer: item?.POCustomer,
      updatedAt: format(
        item?.OrderProducts[0]?.Quote_History["updatedAt"],
        "dd/MM/yyyy HH:mm"
      ),
      moneyPO:
        Number(item?.OrderProducts[0]?.Quote_History["priceSale"]) *
        Number(item?.OrderProducts[0]?.Quote_History["quantity"]),
      dateOrder: item?.OrderProducts[0]?.Quote_History["deliveryTime"],
    }));
    const heading = [
      ["Số báo giá", "Số P.O", "Ngày P.O", "Trị giá P.O", "Ngày giao hàng"],
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
    XLSX.utils.book_append_sheet(workbook, ws, "Dữ liệu đơn hàng khách hàng");
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `don-hang-khach-hang.xlsx`);
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
      <div className="w-full mb-2">
        <div className="flex justify-between items-center">
          <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm đơn hàng"
          />
          <div className="w-52 flex justify-between items-end">
            <h1 className="font-bold">Tổng số đơn hàng: </h1>
            <p>{totalOrderCustomer?.data?.data?.total}</p>
          </div>
          <div></div>
          <div className="flex">
            <DateRangePicker date={date} setDate={setDate} />
            <Button
              onClick={() =>
                totalOrderCustomer?.data?.data?.results &&
                handleExportExcel(totalOrderCustomer?.data?.data?.results)
              }
              className="ml-2"
              variant={"outline"}
            >
              Xuất Excel
            </Button>
          </div>
        </div>
      </div>
      {isLoading ? (
        <LoadingView />
      ) : (
        <>
          <DataTable
            data={totalOrderCustomer?.data?.data?.results || []}
            columns={columns}
          />
          <div className="mt-5 flex justify-end">
            <Paginations
              currentPage={pagination.page}
              pageCount={totalOrderCustomer?.data?.data?.numberPages}
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

const FormSchema = z.object({
  level: z.string({ required_error: "Vui lòng chọn mức độ !" }),
  dayReception: z.date({ required_error: "Vui lòng chọn ngày tiếp nhận !" }),
  salerId: z.number({ required_error: "Vui lòng chọn người tiếp nhận !" }),
  contentReport: z.string({
    required_error: "Vui lòng nhập nội dung khiếu nại !",
  }),
});

export function AddComplain({ complainData }: { complainData?: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { data: listSale } = useQuery({
    queryKey: ["listSale"],
    queryFn: () => getListUserByDepartment("sale"),
  });

  const orderId = complainData?.id;
  const mutation = useMutation({
    mutationFn: (data: any) => postComplain(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomerReport"],
      });
      setOpen(false);
      toast({
        title: "Thành công",
        description: `Thêm khiếu nại thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  const handleSubmit = async (data: any) => {
    mutation.mutateAsync(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Badge>+ Thêm khiếu nại</Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] mx-auto overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Khiếu nại</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full flex flex-col gap-4"
            >
              <div>
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-500">* </span> Mức độ
                      </FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn mức độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Thấp">Thấp</SelectItem>
                          <SelectItem value="Vừa">Vừa</SelectItem>
                          <SelectItem value="Cao">Cao</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="dayReception"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          <span className="text-red-500">* </span> Ngày tiếp
                          nhận
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field?.value ? (
                                  !isNaN(new Date(field.value).getTime()) ? (
                                    format(new Date(field.value), "dd/MM/yyyy")
                                  ) : (
                                    <span>Chọn ngày tiếp nhận</span>
                                  )
                                ) : (
                                  <span>Chọn ngày tiếp nhận</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const compareDate = new Date(date);
                                compareDate.setHours(0, 0, 0, 0);

                                return (
                                  compareDate < today ||
                                  compareDate < new Date("1900-01-01")
                                );
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <Label>Số PO</Label>
                  <Input disabled value={complainData?.POCustomer} />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="salerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-red-500">* </span> Người tiếp
                          nhận
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn người tiếp nhận" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {listSale?.data?.data?.map((item: any) => (
                              <SelectItem
                                key={item?.id}
                                value={item?.id?.toString()}
                              >
                                {item?.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="contentReport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-red-500">* </span> Nội dung
                          khiếu nại
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập nội dung khiếu nại"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button type="submit" variant="default">
                Thêm
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
