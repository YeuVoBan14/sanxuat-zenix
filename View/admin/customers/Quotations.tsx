
import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Paginations } from "@/components/Pagination";
import { format } from "date-fns";
import { putCalendar } from "@/api/quotations";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getTotalQuoteCustomer } from "@/api/customer";
import { Badge } from "@/components/ui/badge";
import DateRangePicker from "@/components/datePicker/DateRangePicker";
import { DateRange } from "react-day-picker";
import ErrorViews from "@/components/ErrorViews";
import LoadingView from "@/components/LoadingView";
import * as XLSX from "xlsx";

export default function Quotations({ customerId }: { customerId: number }) {
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
        data: totalQuoteCustomer,
        error,
        isLoading,
    } = useQuery({
        queryKey: ["totalQuoteCustomer", customerId, memoizedPagination],
        queryFn: () => getTotalQuoteCustomer(customerId, memoizedPagination),
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
            header: "Ngày báo giá",
            cell: ({ row }) => <div>{format(new Date(row.original["createdAt"]), "dd/MM/yyyy")}</div>,
        },
        {
            accessorKey: "code",
            header: "Số báo giá",
            cell: ({ row }) => <div>{row.original["code"]}</div>,
        },
        {
            accessorKey: "statusQuotationName",
            header: "Trạng thái",
            cell: ({ row }) => <div>{row.original["statusQuotationName"]}</div>,
        },
        {
            accessorKey: "total",
            header: "Tổng giá trị",
            cell: ({ row }) => <div>{row.original["totalPriceSale"]}</div>,
        },
        // {
        //     accessorKey: "deliveryAddress",
        //     header: "Địa chỉ",
        //     cell: ({ row }) => <div>{row.original["deliveryAddress"]}</div>,
        // },
        // {
        //     accessorKey: "calendar",
        //     header: "Lịch làm việc KH",
        //     cell: ({ row }) => {
        //         return <UpdateCalendarQuotation id={row.original?.id} data={row.original?.calendar} />;
        //     },
        // },
    ];

    const handleExportExcel = (data: any) => {
        const dataToExport = data.map((item: any) => ({
          createdAt: format(new Date(item?.createdAt), "dd/MM/yyyy"),
          code: item?.code,
          statusQuotationName: item?.statusQuotationName,
          totalPriceSale: item?.totalPriceSale
        }),);
        const heading = [["Ngày báo giá", "Số báo giá", "Trạng thái", "Tổng giá trị"]];
        // Create Excel workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(ws, heading);
        XLSX.utils.sheet_add_json(ws, dataToExport, { origin: 'A2', skipHeader: true });
        // const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(workbook, ws, "Dữ liệu báo giá khách hàng");
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `bao-gia-khach-hang.xlsx`);
      }

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
        <>
            <div className=" w-full mb-2">
                <div className="flex justify-between items-center">
                    <div> </div>
                    <div className="w-52 flex justify-between items-end">
                        <h1 className="font-bold">Tổng số báo giá: </h1>
                        <p>{totalQuoteCustomer?.data?.data?.total}</p>
                    </div>
                    <div className="flex">
                     <DateRangePicker date={date} setDate={setDate} />
                     <Button
                        onClick={() =>
                            totalQuoteCustomer?.data?.data?.results &&
                            handleExportExcel(totalQuoteCustomer?.data?.data?.results)
                        }
                        className="ml-2"
                        variant={"outline"}
                        >
                        Xuất Excel
                    </Button>
                    </div>
                </div>
            </div>
            {isLoading ? <LoadingView /> : (
                <>
                    <DataTable
                        data={totalQuoteCustomer?.data?.data?.results || []}
                        columns={columns}
                    />
                    <div className="mt-5 flex justify-end">
                        <Paginations
                            currentPage={pagination.page}
                            pageCount={totalQuoteCustomer?.data?.data?.numberPages}
                            pagination={pagination}
                            setPagination={setPagination}
                            onPageChange={(value: number) => setPagination({ ...pagination, page: value })}
                        />
                    </div>
                </>
            )}
        </>
    );
}

const formSchema: z.ZodSchema<any> = z.object({
    calendar: z
        .string({ required_error: "Trường này là bắt buộc" })
        .min(5, "Ít nhất 5 kí tự, vui lòng nhập lại!"),
});

export function UpdateCalendarQuotation({ id, data }: { id: number; data: any }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            calendar: data || ""
        }
    });

    const mutation = useMutation({
        mutationFn: (data: any) => putCalendar(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["totalQuoteCustomer"],
            });
            setIsLoading(false);
            setOpen(false);
            toast({
                title: "Thành công",
                description: "Cập nhật lịch làm việc với khách hàng thành công",
            });
        },
        onError: (error) => {
            setIsLoading(false);
            toast({
                title: "Thất bại",
                description: error.message,
            });
        },
    });

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        await mutation.mutateAsync(data);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <div>
                        <Badge>
                            {data ? data : "+ Thêm lịch"}
                        </Badge>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lịch làm việc với khách hàng</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-md w-full"  >
                                <FormField
                                    control={form.control}
                                    name="calendar"
                                    render={({ field }) => {
                                        return (
                                            <FormItem>
                                                <FormLabel className="flex">
                                                    <div className="text-red-600">*</div> Thêm mới lịch làm việc
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Nhập lịch làm việc"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
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
                                        disabled={isLoading}
                                    >
                                        {isLoading && (
                                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Xác nhận
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog >
        </>
    )
}