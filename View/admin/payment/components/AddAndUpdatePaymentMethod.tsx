import React, { useEffect } from "react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReloadIcon } from "@radix-ui/react-icons";
import Edit from "@/components/icons/Edit";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editPaymentMethod, postPaymentMethod } from "@/api/payment";

const formSchema = z.object({
  name: z.string().min(1, "Bạn phải nhập ít nhất 1 kí tự"),
});

export default function AddAndUpdatePaymentMethod({
  edit,
  dataList
}: {
  edit?: boolean;
  dataList?: any
}) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const queryClient = useQueryClient();
  const id = dataList?.id;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: edit ? dataList.name || "" : "",
    },
  });

  useEffect(() => {
    if (edit && dataList) {
      form.reset({
        name: dataList?.name,
      });
    } else if (!open) {
      form.reset();
    }
  }, [edit, dataList, form, open]);

  const mutation = useMutation({
    mutationFn: (data: { name: string }) => (edit ? editPaymentMethod(data, id) : postPaymentMethod(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["paymentMethodList"],
      });
      setOpen(false);
      setIsLoading(false);
      form.reset();
      toast({
        title: "Thành công",
        description: `${edit ? "Sửa" : "Thêm mới"} điều kiện thanh toán thành công`,
      });
    },
    onError: (error) => {
      setIsLoading(false);
      const description = `${edit ? "Sửa" : "Thêm mới"} điều kiện thanh toán thất bại`;
      toast({
        title: "Thất bại",
        description: `${edit ? "Sửa" : "Thêm mới"} điều kiện thanh toán thất bại`,
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
        <Button className={edit ? "bg-none bg-transparent hover:bg-none hover:bg-transparent h-3 mt-1" : ""}>
          {edit ? <Edit width="20" height="20" /> : "Thêm điều kiện"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{edit ? "Sửa" : "Thêm"} điều kiện thanh toán</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className={cn("grid items-start gap-4")} onSubmit={form.handleSubmit(onSubmits)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="text-red-600">* </span>Nội dung
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập nội dung" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="mt-5">
              {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}