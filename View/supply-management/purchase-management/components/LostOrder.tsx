"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postLostOrder } from "@/api/purchase";
import { useToast } from "@/components/ui/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const formSchema: z.ZodSchema<any> = z.object({
    reasonFail: z
        .string({ required_error: "Trường này là bắt buộc" })
        .min(5, "Ít nhất 5 kí tự, vui lòng nhập lại!"),
});

export default function LostOrder({ id }: { id: number }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const route = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reasonFail: ""
        }
    });

    const mutation = useMutation({
        mutationFn: (data: any) => postLostOrder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["listPurchaseOrder"],
            });
            route.push("/admin/purchase");
            setOpen(false);
            setIsLoading(false);
            toast({
                title: "Thành công",
                description: `Hủy đơn hàng thành công`,
            });
        },
        onError: (error: any) => {
            setOpen(false);
            setIsLoading(false);
            toast({
                title: "Thất bại",
                description: `${error?.message}`,
            });
        },
    });

    const handleSubmit = (data: any) => {
        setIsLoading(true);
        mutation.mutateAsync(data);
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="destructive"
                    >
                        Mất đơn hàng
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lý do hủy đơn hàng</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-md w-full"  >
                                <FormField
                                    control={form.control}
                                    name="reasonFail"
                                    render={({ field }) => {
                                        return (
                                            <FormItem>
                                                <FormLabel className="flex">
                                                    <div className="text-red-600">*</div> Lý do
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Nhập lý do hủy đơn"
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