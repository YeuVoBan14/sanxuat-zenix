"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getBankAccount } from "@/api/payment"
import { postDebtPayment } from "@/api/accounting"

const FormSchema = z.object({
    paymentDate: z.date({
        required_error: "Vui lòng chọn ngày thanh toán",
    }),
    paymentPrice: z.number({
        required_error: "Vui lòng điền số tiền thanh toán"
    }),
    bankAccountId: z.number({
        required_error: "Vui lòng chọn tài khoản thanh toán"
    }),
    title: z
        .string({
            required_error: "Vui lòng điền thông tin"
        })
        .min(5, {
            message: "Nhập ít nhất 5 kí tự",
        })
        .max(160, {
            message: "Chỉ có thể nhập 160 kí tự",
        }),
})

export function UpdatePayment({ id }: { id: number }) {
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    const {
        data: bankAccountList,
    } = useQuery({ queryKey: ["bankAccountList"], queryFn: getBankAccount });


    const mutation = useMutation({
        mutationFn: (data: any) => postDebtPayment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["debtList"],
            });
            form.reset();
            toast({
                title: "Thành công",
                description: `Thanh toán công nợ thành công`,
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
    }

    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <Badge>Thanh toán</Badge>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="font-bold">
                        Thanh toán
                    </DialogHeader>
                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="paymentPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel><span className="text-red-500">* </span> Số tiền thanh toán</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Nhập số tiền thanh toán"
                                                    {...field}
                                                    value={field.value ? field.value : ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="paymentDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel><span className="text-red-500">* </span> Ngày thanh toán</FormLabel>
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
                                                                    <span>Chọn ngày thanh toán</span>
                                                                )
                                                            ) : (
                                                                <span>Chọn ngày thanh toán</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => {
                                                            const today = new Date();
                                                            today.setHours(0, 0, 0, 0);
                                                            const compareDate = new Date(date);
                                                            compareDate.setHours(0, 0, 0, 0);

                                                            return compareDate < today || compareDate < new Date("1900-01-01");
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel><span className="text-red-500">* </span> Thông tin</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="shadow-md"
                                                    placeholder="Điền thông tin"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="bankAccountId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel><span className="text-red-500">* </span> Tài khoản thanh toán</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(Number(value))}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn tài khoản thanh toán" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {bankAccountList?.data?.map((item: any) => (
                                                        <SelectItem key={item?.id} value={item?.id?.toString()}>{item?.nameAccount}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <DialogClose>
                                        <Button variant={"outline"} type="button">
                                            Hủy
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit">
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