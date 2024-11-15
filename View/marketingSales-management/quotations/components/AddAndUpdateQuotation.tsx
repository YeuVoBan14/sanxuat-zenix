import * as React from "react";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPaymentMethod } from "@/api/payment";
import Edit from "@/components/icons/Edit";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Supplier } from "@/types/type";
import { editSupplier, postSupplier } from "@/api/supply";

const formSchema = z.object({
    paymentMethodId: z.number(),
    abbreviation: z.string(),
    userContact: z.string(),
    email: z.string(),
    name: z.string(),
    phoneNumber: z.string(),
    taxCode: z.string(),
    rate: z.string(),
    address: z.string(),
    bankAccount: z.string(),
});

export default function AddAndUpdateQuotation({ edit, dataList }: { edit?: boolean; dataList?: any }) {
    const [open, setOpen] = React.useState(false);
    const [isLoadings, setIsLoading] = React.useState(false);
    const queryClient = useQueryClient();
    const id = dataList?.id;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            paymentMethodId: edit ? dataList?.paymentMethodId || null : null,
            abbreviation: edit ? dataList?.abbreviation || "" : "",
            userContact: edit ? dataList?.userContact || "" : "",
            email: edit ? dataList?.email || "" : "",
            name: edit ? dataList?.name || "" : "",
            phoneNumber: edit ? dataList?.phoneNumber || "" : "",
            address: edit ? dataList?.address || "" : "",
            taxCode: edit ? dataList?.taxCode || "" : "",
            rate: edit ? dataList?.rate || "" : "",
            bankAccount: edit ? dataList?.bankAccount || "" : "",
        },
    });

    const {
        data: paymentMethodList,
    } = useQuery({ queryKey: ["paymentMethodList"], queryFn: getPaymentMethod });

    React.useEffect(() => {
        if (!open) {
            form.reset();
        }
    }, [open, form]);

    const mutation = useMutation({
        mutationFn: (data: Supplier) => (edit ? editSupplier(data, id) : postSupplier(data)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["supplierList"],
            });
            setOpen(false);
            setIsLoading(false);
            form.reset();
            toast({
                title: "Thành công",
                description: `${edit ? "Sửa" : "Thêm mới"} báo giá thành công`,
            });
        },
        onError: (error) => {
            setIsLoading(false);
            const description = `${edit ? "Sửa" : "Thêm mới"} báo giá thất bại`;
            toast({
                title: "Thất bại",
                description: `${edit ? "Sửa" : "Thêm mới"} báo giá Thất bại`,
            });
        },
    });

    const onSubmits = async (data: any) => {
        let result = false;
        try {
            if (edit) {
                await mutation.mutateAsync(data, id);
            } else {
                await mutation.mutateAsync(data);
            }
            result = true;
        } catch (error) {
            console.error("Error submitting form:", error);
        }
        return result;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={edit ? "bg-none bg-transparent hover:bg-none hover:bg-transparent h-3 mt-1" : ""} size="sm">
                    {edit ? <Edit width="20" height="20" /> : "Tạo báo giá"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
                <DialogHeader>
                    <DialogTitle>{edit ? "Sửa" : "Thêm"} báo giá</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form className={cn("grid items-start gap-4")} onSubmit={form.handleSubmit(onSubmits)}>
                        <div>
                            <div className="flex gap-2 w-full mb-2">
                                <FormField
                                    control={form.control}
                                    name="abbreviation"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                <span className="text-red-600">* </span>Tên viết tắt
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tên viết tắt" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="taxCode"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                <span className="text-red-600">* </span>Mã số thuế
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập mã số thuế" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className=" flex gap-2 w-full mb-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="w-2/3">
                                            <FormLabel>
                                                <span className="text-red-600">* </span>Nhà cung cấp
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tên nhà cung cấp" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rate"
                                    render={({ field }) => (
                                        <FormItem className="w-1/3">
                                            <FormLabel>
                                                <span className="text-red-600">* </span>Đánh giá
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập đánh giá" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="mb-2 flex gap-2">
                                <FormField
                                    control={form.control}
                                    name="userContact"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                <span className="text-red-600">* </span>Người liên hệ
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tên người liên hệ" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                <span className="text-red-600">* </span>Địa chỉ
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập địa chỉ" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-2 w-full mb-2">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                <span className="text-red-600">* </span>Email
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                <span className="text-red-600">* </span>Số điện thoại
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập số điện thoại" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-2 w-full">
                                <FormField
                                    control={form.control}
                                    name="bankAccount"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                <span className="text-red-600">* </span>Tài khoản ngân hàng
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tài khoản ngân hàng" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="paymentMethodId"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                <span className="text-red-600">* </span>Điều kiện thanh toán
                                            </FormLabel>
                                            <Select onValueChange={(value) => field.onChange(Number(value))}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                        placeholder={edit ? dataList?.paymentMethod?.name : "Chọn điều kiện thanh toán"}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {paymentMethodList?.data?.map((i: any) => (
                                                            <SelectItem key={i?.id} value={i?.id?.toString()}>
                                                                {i?.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={isLoadings} className="mt-5">
                            {isLoadings && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                            Xác nhận
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
