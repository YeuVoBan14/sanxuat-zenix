import * as React from "react";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Edit from "@/components/icons/Edit";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/types/type";
import { returnTextDepartment, returnTextRole } from "@/lib/return-text";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { editNewUser, postNewUser } from "@/api/user";

const departmentData = [
  {
    id: 1,
    key: "purchase",
    value: "Phòng mua",
  },
  {
    id: 2,
    key: "sale",
    value: "Phòng kinh doanh",
  },
  {
    id: 3,
    key: "warehouse",
    value: "Phòng kho",
  },
  {
    id: 4,
    key: "accounting",
    value: "Phòng kế toán",
  },
];

const roleData = [
  {
    id: 1,
    key: "manager",
    value: "Quản lý",
  },
  {
    id: 2,
    key: "staff",
    value: "Nhân viên",
  },
];

const listFunctions = [
  { id: 1, label: "Khách hàng" },
  { id: 2, label: "Bán hàng" },
  { id: 3, label: "Sản phẩm" },
  { id: 4, label: "Nhà cung cấp" },
  { id: 5, label: "Mua hàng" },
  { id: 6, label: "YCBG" },
  // { id: 7, label: "Công ty" },
  // { id: 8, label: "Thanh toán" },
  { id: 9, label: "Báo giá" },
  { id: 10, label: "Nhập kho" },
  { id: 11, label: "Xuất kho" },
  { id: 12, label: "Quản lý công nợ" },
  { id: 13, label: "Quản lý chi phí" },
  { id: 14, label: "Lịch sử" },
];

const departmentFunctionMap: any = {
  purchase: [2, 3, 4, 5, 6],
  sale: [1, 2, 3, 6, 9],
  warehouse: [10, 11, 14],
  accounting: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
};

export default function CreateAndUpdateUser({
  edit,
  dataList,
}: {
  edit?: boolean;
  dataList?: any;
}) {
  const [open, setOpen] = React.useState(false);
  const [isLoadings, setIsLoading] = React.useState(false);
  const queryClient = useQueryClient();
  const id = dataList?.id;

  const [selectRole, setSelectRole] = React.useState(
    dataList && dataList?.role === "admin" ? "admin" : "user"
  );

  const formSchema: z.ZodSchema<any> = z.object({
    userName: z
      .string({ required_error: "Trường này là bắt buộc" })
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    password: z
      .string({ required_error: "Trường này là bắt buộc" })
      .min(3, "Mật khẩu phải có ít nhất 3 ký tự"),
    fullName: z.string().min(1, "Trường này là bắt buộc"),
    phoneNumber: z.string({ required_error: "Trường này là bắt buộc" }).trim(),
    email: z
      .string()
      .email("Email không hợp lệ")
      .min(1, "Trường này là bắt buộc"),
    role: z.string(),
    department: z.string(),

    functions: z.array(z.number()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: edit ? dataList?.userName || "" : "",
      password: edit ? dataList?.password : "",
      fullName: edit ? dataList?.fullName || "" : "",
      phoneNumber: edit ? dataList?.phoneNumber || "" : "",
      email: edit ? dataList?.email || "" : "",
      role: edit ? dataList?.role || "" : "",
      department: edit ? dataList?.department || "" : "",
      functions: edit
        ? dataList?.Functions.map((item: { id: number }) => item.id) || []
        : [],
    },
  });

  React.useEffect(() => {
    form.setValue("role", selectRole);
  }, [selectRole, form]);

  React.useEffect(() => {
    const department = form.watch("department");
    if (department) {
      form.setValue("functions", departmentFunctionMap[department] || []);
    }
  }, [form.watch("department")]);

  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: (data: User) =>
      edit ? editNewUser(data, id) : postNewUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allUser"],
      });
      setOpen(false);
      setIsLoading(false);
      form.reset();
      toast({
        title: "Thành công",
        description: `${edit ? "Sửa" : "Thêm mới"} tài khoản thành công`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Thất bại",
        description: error.response?.data?.message,
      });
    },
  });

  const onSubmits = async (data: any) => {
    let result = false;
    // if (data["functions"]?.includes(9)) {
    //   data["functions"].push(6);
    // }
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
        <Button
          className={
            edit
              ? "bg-none bg-transparent hover:bg-none hover:bg-transparent h-3 mt-1"
              : ""
          }
          size="sm"
        >
          {edit ? <Edit width="20" height="20" /> : "Thêm tài khoản"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[650px] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{edit ? "Sửa" : "Thêm"} tài khoản</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className={cn("grid items-start gap-4")}
            onSubmit={form.handleSubmit(onSubmits)}
          >
            <div>
              <div className={`gap-2 ${!edit && "flex"} w-full mb-2`}>
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        <span className="text-red-600">* </span>Tài khoản
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên tài khoản" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!edit && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          <span className="text-red-600">* </span>Mật khẩu
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={edit ? "hidden" : "password"}
                            placeholder="Nhập mật khẩu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="w-full mb-2">
                {" "}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        <span className="text-red-600">* </span>Họ và tên
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập họ và tên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className=" flex gap-2 w-full mb-2">
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
              </div>
              <div className="my-4">
                <RadioGroup
                  defaultValue={dataList?.role === "admin" ? "admin" : "user"}
                  onValueChange={(value) => setSelectRole(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="r1" />
                    <Label htmlFor="r1">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="r2" />
                    <Label htmlFor="r2">Người dùng</Label>
                  </div>
                </RadioGroup>
              </div>

              {selectRole === "admin" && (
                <>
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input {...field} type="hidden" value="admin" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectRole === "user" && (
                <>
                  <div className="flex gap-2 w-full">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>
                            <span className="text-red-600">* </span>Phòng ban
                          </FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  edit
                                    ? returnTextDepartment(dataList?.department)
                                    : "Chọn phòng ban"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {departmentData?.map((i: any) => (
                                  <SelectItem
                                    key={i?.id}
                                    value={i?.key.toString()}
                                  >
                                    {i?.value}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>
                            <span className="text-red-600">* </span>Chức vụ
                          </FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  edit
                                    ? returnTextRole(dataList?.role)
                                    : "Chọn chức vụ"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {roleData?.map((i: any) => (
                                  <SelectItem key={i?.id} value={i?.key}>
                                    {i?.value}
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
                  <div>
                    <FormField
                      control={form.control}
                      name="functions"
                      render={({ field }) => {
                        // Truy cập trực tiếp vào field.value vì nó đã được đảm bảo là một mảng số ở defaultValues
                        return (
                          <FormItem className="grid grid-cols-3 mt-4 items-end">
                            {listFunctions.map((item) => (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        // Thêm id vào mảng nếu được chọn
                                        field.onChange([
                                          ...field.value,
                                          item.id,
                                        ]);
                                      } else {
                                        // Loại bỏ id khỏi mảng nếu bỏ chọn
                                        field.onChange(
                                          field.value.filter(
                                            (v: any) => v !== item.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            ))}
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            <Button type="submit" disabled={isLoadings} className="mt-5">
              {isLoadings && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
