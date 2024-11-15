
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editBankAccount, postBankAccount } from "@/api/payment";
import Edit from "@/components/icons/Edit";

const formSchema = z.object({
  nameAccount: z.string().min(5, "Bạn phải nhập ít nhất 5 kí tự"),
  numberAccount: z.string().min(5, "Bạn phải nhập ít nhất 5 kí tự"),
  nameBank: z.string().min(5, "Bạn phải nhập ít nhất 5 kí tự"),
  branch: z.string().min(5, "Bạn phải nhập ít nhất 5 kí tự"),

});

export default function AddAndUpdateBankAccount({
  edit,
  dataList,
  refetch,
}: {
  edit?: boolean;
  dataList?: any;
  refetch: any;
}) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [isLoadings, setIsLoading] = React.useState(false);
  const queryClient = useQueryClient();
  const id = dataList?.id;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameAccount: edit ? dataList?.nameAccount || "" : "",
      numberAccount: edit ? dataList?.numberAccount || "" : "",
      nameBank: edit ? dataList?.nameBank || "" : "",
      branch: edit ? dataList?.branch || "" : "",
    },
  });

  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);


  const mutation = useMutation({
    mutationFn: (data: { nameAccount: string; numberAccount: string; namebank: string; branch: string }) => (edit ? editBankAccount(data, id) : postBankAccount(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bankAccountList"],
      });
      setOpen(false);
      toast({
        title: "Thành công",
        description: `${edit ? "Sửa" : "Thêm mới"} tài khoản thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error?.message,
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
          {edit ? <Edit width="20" height="20" /> : "Tạo tài khoản"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{edit ? "Sửa" : "Thêm"} tài khoản</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className={cn("grid items-start gap-4")} onSubmit={form.handleSubmit(onSubmits)}>
            <div>
              <FormField
                control={form.control}
                name="nameAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="text-red-600">* </span>Tên tài khoản
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên tài khoản" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-3">
                <FormField
                  control={form.control}
                  name="numberAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-600">* </span>Số tài khoản
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số tài khoản" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-3">
                <FormField
                  control={form.control}
                  name="nameBank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-600">* </span>Ngân hàng
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên ngân hàng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-3">
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-600">* </span>Chi nhánh
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên chi nhánh" {...field} />
                      </FormControl>
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
