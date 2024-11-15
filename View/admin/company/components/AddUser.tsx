import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaPlus } from "react-icons/fa";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { postNewUser } from "@/api/userManager";
import { DialogClose } from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CollapsibleTrigger,
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ReloadIcon } from "@radix-ui/react-icons";

const listFunctions = [
  { id: 1, label: "Khách hàng" },
  { id: 2, label: "Bán hàng" },
  { id: 3, label: "Sản phẩm" },
  { id: 4, label: "Nhà cung cấp" },
  { id: 5, label: "Mua hàng" },
  { id: 9, label: "Báo giá" },
];

const AddUser = () => {
  const formSchema: z.ZodSchema<any> = z.object({
    userName: z
      .string({ required_error: "Trường này là bắt buộc" })
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    password: z
      .string({ required_error: "Trường này là bắt buộc" })
      .min(3, "Mật khẩu phải có ít nhất 3 ký tự"),
    repassword: z.string().min(3, "Mật khẩu phải có ít nhất 3 ký tự"),
    fullName: z.string().min(1, "Trường này là bắt buộc"),
    phoneNumber: z.string({ required_error: "Trường này là bắt buộc" }).trim(),
    email: z
      .string()
      .email("Email không hợp lệ")
      .min(1, "Trường này là bắt buộc"),
    role: z.string({
      required_error: "Phòng ban không được để trống",
    }),
    department: z
      .string()
      .refine((value) => value !== "" || form.getValues("role") === "admin", {
        message: "Phòng ban không được để trống",
      }),
    functions: z
      .array(z.number())
      .refine(
        (value) => value.length > 0 || form.getValues("role") === "admin",
        {
          message: "Bạn cần chọn ít nhất 1 chức năng",
        }
      ),
  });
  const [isLoading, setIsLoading] = useState(false);

  // State để lưu giá trị của radio button được chọn
  const [selectedRole, setSelectedRole] = useState("staff");

  // Hàm xử lý sự kiện khi radio button thay đổi
  const handleRoleChange = (e: any) => {
    setSelectedRole(e.target.value);
  };

  // xử lý ẩn thông tin khi role là admin
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (selectedRole !== "admin") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [selectedRole]);

  //set functions
  const [functions, setFunctions] = useState<number[]>([]);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      password: "",
      repassword: "",
      fullName: "",
      phoneNumber: "",
      email: "",
      role: "",
      department: "",
      functions: [],
    },
  });

  const resetForm = () => {
    form.reset();
  };

  // kiểm tra password
  const handleCheckRePassword = (e: any) => {
    const repassword = e.target.value;
    const password = form.getValues("password");
    if (password !== repassword) {
      form.setError("repassword", { message: "Mật khẩu không khớp" });
    } else {
      form.clearErrors("repassword");
    }
  };

  async function handleCreate(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const result = await postNewUser(values);
    if (result?.success) {
      setIsLoading(false);
      toast.success("Thêm thành công!");
      resetForm();
    } else {
      setIsLoading(false);
      toast.error(result?.message);
    }
  }

  return (
    <Dialog>
      <ToastContainer />
      <DialogTrigger asChild>
        <Button
          className="bg-blue-500 hover:bg-blue-800 text-white hover:text-white border shadow-lg rounded-xl "
          variant="outline"
        >
          <FaPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] mx-auto justify-center h-[800px] overflow-y-auto scrollbar-thin scrollbar-webkit">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
        </DialogHeader>
        <div className="grid-cols-2 ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreate)}
              // className='space-y-8'
              className="max-w-md w-full flex flex-col gap-6"
            >
              <h3 className="font-bold">Thông tin tài khoản</h3>
              <div className=" items-center py-1">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <div className="">
                      <FormItem>
                        <FormLabel className="flex">
                          <div className="text-red-600">*</div> Tên người dùng
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="userName"
                            placeholder="Nhập tên người dùng"
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                  )}
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        <div className="text-red-600">*</div>Mật khẩu
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập mật khẩu"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        <div className="text-red-600">*</div>Nhập lại mật khẩu
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập mật lại khẩu"
                          type="password"
                          onChange={(e) => {
                            field.onChange(e);
                            handleCheckRePassword(e);
                          }}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <h3 className="font-bold">Thông tin cá nhân</h3>
              <div>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        <div className="text-red-600">*</div>Tên đầy đủ
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tên đầy đủ"
                          id="fullName"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Số điện thoại"
                          id="phoneNumber"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        <div className="text-red-600">*</div>Email
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Email" id="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Collapsible open={isOpen}>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <h3 className="font-bold">Cài đặt chức năng</h3>
                      <FormControl>
                        <div className="grid gap-4 grid-cols-2">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue="user"
                            name="user"
                            onChange={handleRoleChange}
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="admin" id="admin" />
                              </FormControl>
                              <CollapsibleTrigger>
                                <FormLabel>Admin</FormLabel>
                              </CollapsibleTrigger>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="user" id="user" />
                              </FormControl>
                              <FormLabel>Người dùng</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <CollapsibleContent className="mt-5">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phòng ban</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={
                            selectedRole === "admin" ? "director" : field.value
                          }
                        >
                          <div className=" items-center py-2">
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Phòng ban" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Chọn phòng ban</SelectLabel>
                                <SelectItem value="sale">Kinh doanh</SelectItem>
                                <SelectItem value="purchase">Mua</SelectItem>
                                <SelectItem value="director">
                                  kế toán
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </div>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chức vụ</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={
                            selectedRole === "admin" ? "admin" : field.value
                          }
                        >
                          <div className=" items-center py-2">
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chức vụ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Chọn chức vụ</SelectLabel>
                                <SelectItem value="admin">
                                  Trưởng bộ phận
                                </SelectItem>
                                <SelectItem value="manager">Quản lý</SelectItem>
                                <SelectItem value="staff">Nhân viên</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </div>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="functions"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Cài đặt phân quyền</FormLabel>
                        </div>
                        {listFunctions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="functions"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                            ...field.value,
                                            item.id,
                                          ])
                                          : field.onChange(
                                            field.value?.filter(
                                              (value: any) =>
                                                value !== item.id
                                            )
                                          );
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Huỷ
                  </Button>
                </DialogClose>

                <Button
                  disabled={isLoading}
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-800 text-white hover:text-white border shadow-lg"
                >
                  {isLoading && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Tạo mới
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUser;
