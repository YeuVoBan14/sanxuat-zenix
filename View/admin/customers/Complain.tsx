import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomerReport, postStatusComplain } from "@/api/customer";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Paginations } from "@/components/Pagination";
import DateRangePicker from "@/components/datePicker/DateRangePicker";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import LoadingView from "@/components/LoadingView";
import ErrorViews from "@/components/ErrorViews";
import * as XLSX from "xlsx";

const getVariant = (level: string) => {
  if (level === "Cao") {
    return "destructive";
  } else if (level === "Thấp") {
    return "outline";
  } else {
    return "secondary";
  }
};

export default function Complain({ customerId }: { customerId: number }) {
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
    data: listCustomerReport,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listCustomerReport", customerId, memoizedPagination],
    queryFn: () => getCustomerReport(customerId, memoizedPagination),
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
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <div>{format(row.original["createdAt"], "dd/MM/yyyy HH:mm")}</div>
      ),
    },
    {
      accessorKey: "level",
      header: "Mức độ",
      cell: ({ row }) => (
        <Badge variant={`${getVariant(row.original["level"])}`}>
          {row.original["level"]}
        </Badge>
      ),
    },
    {
      accessorKey: "dayReception",
      header: "Ngày tiếp nhận",
      cell: ({ row }) => (
        <div>{format(row.original["dayReception"], "dd/MM/yyyy")}</div>
      ),
    },
    {
      accessorKey: "PO",
      header: "Số P.O",
      cell: ({ row }) => <div>{row.original["PO"]}</div>,
    },
    {
      accessorKey: "salerInfo",
      header: "Người tiếp nhận",
      cell: ({ row }) => <div>{row.original?.salerInfo?.fullName}</div>,
    },
    {
      accessorKey: "contentReport",
      header: "Nội dung",
      cell: ({ row }) => <div>{row.original["contentReport"]}</div>,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        return <UpdateStatusComplain data={row.original} />;
      },
    },
  ];

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      createdAt: format(item?.createdAt, "dd/MM/yyyy HH:mm"),
      level: item?.level,
      dayReception: format(item?.dayReception, "dd/MM/yyyy"),
      PO: item?.PO,
      salerInfo: item?.salerInfo?.fullName,
      contentReport: item?.contentReport,
      status: item?.status === null ? "Đã tạo khiếu nại" : item?.status,
    }));
    const heading = [
      [
        "Ngày tạo",
        "Mức độ",
        "Ngày tiếp nhận",
        "Số P.O",
        "Người tiếp nhận",
        "Nội dung",
        "Trạng thái",
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
    XLSX.utils.book_append_sheet(workbook, ws, "Dữ liệu khiếu nại khách hàng");
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `khieu-nai-khach-hang.xlsx`);
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
        <div className="flex justify-between ">
          <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm khiếu nại"
          />
          <div className="w-52 flex justify-between items-center">
            <div className="font-bold">Tổng số khiếu nại:</div>
            <div>{listCustomerReport?.data?.data?.results?.length}</div>
          </div>
          <div></div>
          <div className="flex">
            <DateRangePicker date={date} setDate={setDate} />
            <Button
              onClick={() =>
                listCustomerReport?.data?.data?.results &&
                handleExportExcel(listCustomerReport?.data?.data?.results)
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
            data={listCustomerReport?.data?.data?.results || []}
            columns={columns}
          />
          <div className="mt-5 flex justify-end">
            <Paginations
              currentPage={pagination.page}
              pageCount={listCustomerReport?.data?.data?.numberPages}
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

export function UpdateStatusComplain({ data }: { data?: any }) {
  const queryClient = useQueryClient();
  const form = useForm();
  const [open, setOpen] = useState(false);
  const id = data?.id;

  const mutation = useMutation({
    mutationFn: (data: any) => postStatusComplain(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomerReport"],
      });
      setOpen(false);
      toast({
        title: "Thành công",
        description: `Sửa trạng thái khiếu nại thành công`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  const handleSubmit = (data: any) => {
    mutation.mutateAsync(data);
  };

  const findStatusColor = (status: string) => {
    const statusItem = statusData.find((item) => item.name === status);
    return statusItem ? statusItem.color : "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Badge
            className="font-bold"
            variant={"secondary"}
            style={{ color: findStatusColor(data?.status) }}
          >
            {data?.status === null ? "Đã tạo khiếu nại" : data?.status}
          </Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] mx-auto overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái khiếu nại</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full flex flex-col gap-4"
            >
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-500">* </span> Trạng thái
                        khiếu nại
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        defaultValue={data?.status || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusData?.map((item: any) => (
                            <SelectItem key={item?.id} value={item?.name}>
                              {item?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="dayReception"
                  defaultValue={data?.dayReception}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type="hidden" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  defaultValue={data?.level}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type="hidden" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contentReport"
                  defaultValue={data?.contentReport}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type="hidden" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salerId"
                  defaultValue={data?.salerId}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type="hidden" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" variant="default">
                Sửa
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const statusData = [
  {
    id: 1,
    name: "Tiếp nhận",
    color: "#3333FF",
  },
  {
    id: 2,
    name: "Từ chối",
    color: "red",
  },
  {
    id: 3,
    name: "Đã xử lí",
    color: "#00CC00",
  },
  {
    id: 4,
    name: "Đang xử lí",
    color: "#FF9900",
  },
];
