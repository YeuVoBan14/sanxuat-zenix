"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UpdatePayment } from "./components/UpdatePayment";
import { PaymentHistory } from "./components/PaymentHistory";
import { getDebtList, putPaymentDeadline } from "@/api/accounting";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Tab from "@/components/Tab";
import { DataTable } from "@/components/ui/custom/data-table";
import { Paginations } from "@/components/Pagination";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import ErrorViews from "@/components/ErrorViews";
import LoadingView from "@/components/LoadingView";
import * as XLSX from "xlsx";

const statusData = [
  {
    id: 1,
    name: "Đã thanh toán",
    color: "green",
  },
  {
    id: 2,
    name: "Quá hạn",
    color: "red",
  },
  {
    id: 3,
    name: "Chưa thanh toán",
    color: "blue",
  },
];

export default function DebtTabsView() {
  const { data: debtCustomerList } = useQuery({
    queryKey: ["debtListCustomer"],
    queryFn: () =>
      getDebtList({
        page: 0,
        pageSize: 10,
        type: "customer",
      }),
  });
  const { data: debtSupplierList } = useQuery({
    queryKey: ["debtListSupplier"],
    queryFn: () =>
      getDebtList({
        page: 0,
        pageSize: 10,
        type: "supplier",
      }),
  });
  const items = [
    {
      key: 1,
      label: "Công nợ bán hàng",
      children: <DebtManagement type="customer" />,
      quantity: debtCustomerList?.data?.total,
    },
    {
      key: 2,
      label: "Công nợ nhà cung cấp",
      children: <DebtManagement type="supplier" />,
      quantity: debtSupplierList?.data?.total,
    },
  ];

  return <Tab defaults={items} defaultValue={1} />;
}

export function DebtManagement({ type }: { type: string }) {
  const findStatusColor = (status: string) => {
    const statusItem = statusData.find((item) => item.name === status);
    return statusItem ? statusItem.color : "";
  };

  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    type: string;
  }>({
    page: 0,
    pageSize: 10,
    type: "",
  });

  const {
    data: debtList,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["debtList", pagination],
    queryFn: () => getDebtList(pagination),
  });

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, type: type, page: 0 });
    }, 500);
    return () => clearTimeout(timeId);
  }, [type]);

  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "STT",
      cell: ({ row }) => (
        <div>{row["index"] + 1 + pagination.page * pagination.pageSize}</div>
      ),
    },
    {
      accessorKey: "customerId",
      header: "Tên KH",
      cell: ({ row }) => <div>{row.original["Customer"]?.customerName}</div>,
    },
    type === "customer"
      ? {
          accessorKey: "orderId",
          header: "Đơn hàng",
          cell: ({ row }) => <div>{row.original["Order"]?.codeOrder}</div>,
        }
      : {
          accessorKey: "PurchaseOrder",
          header: "PO small",
          cell: ({ row }) => <div>{row.original["PurchaseOrder"]?.POCode}</div>,
        },
    {
      accessorKey: "paymentPrice",
      header: "Số tiền thanh toán",
      cell: ({ row }) => <div>{Number(row.original["paymentPrice"])}</div>,
    },
    {
      accessorKey: "paid",
      header: "Đã thanh toán",
      cell: ({ row }) => (
        <div>
          {Number(row.original["paymentPrice"]) -
            Number(row.original["remainingAmount"])}
        </div>
      ),
    },
    {
      accessorKey: "remainingAmount",
      header: "Số tiền còn lại",
      cell: ({ row }) => <div>{Number(row.original["remainingAmount"])}</div>,
    },
    {
      accessorKey: "paymentDeadline",
      header: "Hạn thanh toán",
      cell: ({ row }) => {
        const date = row.original["paymentDeadline"];
        const parsedDate = date ? parseISO(date) : null;
        return (
          <div>
            {type === "customer" ? (
              <div>{parsedDate ? format(parsedDate, "dd/MM/yyyy") : ""}</div>
            ) : (
              <UpdatePaymentDeadline
                id={row.original["id"]}
                parsedDate={parsedDate}
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "DebtPaymentHistories",
      header: "Lịch sử thanh toán",
      cell: ({ row }) => (
        <div>
          <PaymentHistory data={row.original["DebtPaymentHistories"]} />
        </div>
      ),
    },
    {
      accessorKey: "statusDebt",
      header: "Trạng thái",
      cell: ({ row }) => {
        return (
          <div
            className="font-bold"
            style={{ color: findStatusColor(row.original["statusDebt"]?.name) }}
          >
            {row.original["statusDebt"]?.name}
          </div>
        );
      },
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => <UpdatePayment id={row.original["id"]} />,
    },
  ];

  const handleExportExcel = (data: any, type: string) => {
    const dataToExportCustomer = data.map((item: any) => ({
      customerName: item?.Customer?.customerName,
      codeOrder: item?.Order?.codeOrder,
      paymentPrice: Number(item?.paymentPrice),
      paid: Number(item?.paymentPrice) - Number(item?.remainingAmount),
      remaining: Number(item?.remainingAmount),
      paymentDeadline: item?.paymentDeadline
        ? format(item?.paymentDeadline, "dd/MM/yyyy")
        : "",
      status: item?.statusDebt?.name,
    }));
    const dataToExportSupplier = data.map((item: any) => ({
      customerName: item?.Customer?.customerName,
      POCode: item?.PurchaseOrder?.POCode,
      paymentPrice: Number(item?.paymentPrice),
      paid: Number(item?.paymentPrice) - Number(item?.remainingAmount),
      remaining: Number(item?.remainingAmount),
      paymentDeadline: item?.paymentDeadline
        ? format(item?.paymentDeadline, "dd/MM/yyyy")
        : "",
      status: item?.statusDebt?.name,
    }));
    const headingCustomer = [
      [
        "Tên khách hàng",
        "Đơn hàng",
        "Số tiền thanh toán",
        "Đã thanh toán",
        "Số tiền còn lại",
        "Hạn thanh toán",
        "Trạng thái",
      ],
    ];
    const headingSupplier = [
      [
        "Tên khách hàng",
        "PO Small",
        "Số tiền thanh toán",
        "Đã thanh toán",
        "Số tiền còn lại",
        "Hạn thanh toán",
        "Trạng thái",
      ],
    ];
    // Create Excel workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(
      ws,
      type === "customer" ? headingCustomer : headingSupplier
    );
    XLSX.utils.sheet_add_json(
      ws,
      type === "customer" ? dataToExportCustomer : dataToExportSupplier,
      {
        origin: "A2",
        skipHeader: true,
      }
    );
    // const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(
      workbook,
      ws,
      type === "customer"
        ? `Dữ liệu công nợ bán hàng`
        : `Dữ liệu công nợ nhà cung cấp`
    );
    // Save the workbook as an Excel file
    XLSX.writeFile(
      workbook,
      type === "customer"
        ? `cong-no-ban-hang.xlsx`
        : `cong-no-nha-cung-cap.xlsx`
    );
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
      <div className="flex py-2 justify-end items-end">
        <Button
          onClick={() =>
            debtList?.data?.results &&
            handleExportExcel(debtList?.data?.results, type)
          }
          className="ml-2"
          variant={"outline"}
        >
          Xuất Excel
        </Button>
      </div>
      <DataTable data={debtList?.data?.results || []} columns={columns} />
      <div className="mt-5 flex justify-end">
        <Paginations
          currentPage={pagination.page}
          pageCount={debtList?.data?.numberPages}
          pagination={pagination}
          setPagination={setPagination}
          onPageChange={(value: number) =>
            setPagination({ ...pagination, page: value })
          }
        />
      </div>
    </div>
  );
}

export function UpdatePaymentDeadline({
  parsedDate,
  id,
}: {
  parsedDate: any;
  id: number;
}) {
  const queryClient = useQueryClient();

  const FormSchema = z.object({
    paymentDeadline: z.string({
      required_error: "Vui lòng chọn hạn thanh toán",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => putPaymentDeadline(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["debtList"],
      });
      form.reset();
      toast({
        title: "Thành công",
        description: `Sửa hạn thanh toán thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutateAsync(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge>
          {parsedDate ? format(parsedDate, "dd/MM/yyyy") : "Thêm hạn"}
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa hạn thanh toán</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="paymentDeadline"
                defaultValue={`${parsedDate}`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-3">
                      <span className="text-red-500">* </span> Hạn thanh toán
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal shadow-md",
                              !field?.value && "text-muted-foreground"
                            )}
                          >
                            {field?.value ? (
                              !isNaN(new Date(field.value).getTime()) ? (
                                format(new Date(field.value), "dd/MM/yyyy")
                              ) : (
                                <span>Chọn hạn thanh toán</span>
                              )
                            ) : (
                              <span>Chọn hạn thanh toán</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field?.value
                              ? typeof field?.value === "string"
                                ? new Date(field?.value)
                                : field?.value
                              : undefined
                          }
                          onSelect={(value) => field.onChange(String(value))}
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
              <DialogFooter className="sm:justify-end mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Hủy
                  </Button>
                </DialogClose>
                <Button type="submit">Xác nhận</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
