"use client";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  addCustomerExcel,
  createCustomer,
  updateCustomer,
} from "@/api/customer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Customer } from "@/types/type";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BsFileEarmarkExcelFill } from "react-icons/bs";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import Edit from "@/components/icons/Edit";

const processData = [
  { id: 1, name: "S1", title: "S1 - Khách hàng chung" },
  { id: 2, name: "S2", title: "S2 - Khách hàng tiềm năng" },
  { id: 3, name: "S3", title: "S3 - Khách hàng phát triển" },
  { id: 4, name: "S4", title: "S4 - Khách hàng có nhu cầu báo giá" },
  { id: 5, name: "S5", title: "S5 - Khách hàng muốn làm test" },
  { id: 6, name: "S6", title: "S6 - Đã gửi báo giá" },
  { id: 7, name: "S7", title: "S7 - Đang thương thảo" },
  { id: 8, name: "S8", title: "S8 - Đã có đơn hàng" },
  { id: 9, name: "S9", title: "S9 - Chăm sóc phát triển thêm" },
];

interface CreateCustomerProps {
  refetch: () => void;
  customerData: any;
}

const formSchema: z.ZodSchema<any> = z.object({
  customerName: z.string({
    required_error: "Bạn chưa nhập tên khách hàng"
  }),
  abbreviations: z.string().min(1, {
    message: "Bạn chưa nhập tên viết tắt",
  }),
  departments: z.array(z.object({ department: z.string() })),
  process: z.string({
    required_error: "Bạn chưa chọn tiến trình cho khách hàng"
  }),
  email: z.string().nullable().default(""),
  taxCode: z.string().nullable().default(""),
  address: z.string().nullable().default(""),
  phoneNumber: z.string().nullable().default(""),
  typeCustomer: z.string().nullable().default(""),
  notes: z.string().nullable().default(""),
});

export default function CreateCustomer({
  refetch,
  customerData,
}: CreateCustomerProps) {
  const [departmentInputs, setDepartmentInputs] = useState<string[]>([""]);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      abbreviations: "",
      taxCode: "",
      address: "",
      email: "",
      phoneNumber: "",
      typeCustomer: "",
      notes: "",
      process: "",
      departments: [{ department: "" }],
    },
  });

  const control = form.control;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "departments",
  });

  const handleChangeExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setExcelFile(event.target.files[0]);
      setUploadedFileName(event.target.files[0].name);
      setFileUploaded(true);
    } else {
      setExcelFile(null);
      setUploadedFileName("");
      setFileUploaded(false);
    }
  };

  async function handleAddProductExcel() {
    const formData = new FormData();
    if (!excelFile) {
      toast({
        title: "Thất bại",
        description: "Vui lòng chọn File Excel trước",
      });
    }
    formData.append("file", excelFile as Blob);
    const result = await addCustomerExcel(formData);
    if (result?.success) {
      toast({
        title: result?.data?.data?.message,
        description: (
          <div>
            {result?.data?.data?.failAt?.map(
              (item: { rows: number; message: string }) => {
                return (
                  <p>
                    Hàng: {item.rows} - Chi tiết: {item.message}
                  </p>
                );
              }
            )}
          </div>
        ),
      });
      refetch();
      setFileUploaded(false);
      setUploadedFileName("");
    } else {
      toast({
        title: "Thất bại",
        description: result?.message,
      });
    }
  }

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomer"],
      });
      setOpenPopup(false);
      toast({
        title: "Thành công",
        description: `Thêm khách hàng thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: (data: any) => updateCustomer(customerData["id"], data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomer"],
      });
      toast({
        title: "Thành công",
        description: `Cập nhập thông tin khách hàng thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error?.message,
      });
    },
  });

  const typeCustomerData = [
    { value: "D", title: "Dự án" },
    { value: "T", title: "Tiêu hao" },
    { value: "DT", title: "Dự án / Tiêu hao" },
  ];

  useEffect(() => {
    if (customerData) {
      form.setValue("customerName", customerData["customerName"]);
      form.setValue("abbreviations", customerData["abbreviations"]);
      form.setValue("taxCode", customerData["taxCode"] ? customerData["taxCode"] : "");
      form.setValue("address", customerData["address"] ? customerData["address"] : "");
      form.setValue("email", customerData["email"] ? customerData["email"] : "");
      form.setValue("phoneNumber", customerData["phoneNumber"] ? customerData["phoneNumber"] : "");
      form.setValue("typeCustomer", customerData["typeCustomer"] ? customerData["typeCustomer"] : "");
      form.setValue("notes", customerData["notes"] ? customerData["notes"] : "");
      form.setValue("process", customerData["process"]["id"]);
      form.setValue(
        "departments",
        customerData["departments"]?.map((item: { department: string }) => {
          return {
            department: item.department,
          };
        })
      );
    } else {
      form.reset();
    }
  }, [customerData]);

  const onSubmit = async (data: any) => {
    // const departments = departmentInputs
    //   .filter((input) => input.trim() !== "")
    //   .map((input) => ({ department: input.trim() }));

    // const updatedCustomerData = {
    //   ...customerData,
    //   departments,
    // };
    if (customerData) {
      mutationUpdate.mutateAsync(data);
    } else {
      mutation.mutateAsync(data);
    }
  };

  return (
    <Dialog open={openPopup} onOpenChange={setOpenPopup}>
      <DialogTrigger asChild>
        {customerData ? (
          <div>
            <Edit width="20" height="20" />
          </div>
        ) : (
          <Button variant="default">Thêm khách hàng</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] h-[650px] mx-auto overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>
            {customerData ? "Sửa thông tin khách hàng" : "Thêm mới khách hàng"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="createCustomer">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="createCustomer">
              {customerData ? "Sửa" : "Thêm"}
            </TabsTrigger>
            <TabsTrigger
              disabled={customerData ? true : false}
              value="uploadExcel"
            >
              Upload Excel
            </TabsTrigger>
          </TabsList>
          <TabsContent value="createCustomer" className="w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <div className="mb-2">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-2">
                          <FormLabel className="flex">
                            <div className="text-red-500">*</div> Tên khách hàng
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={"Nhập tên khách hàng"}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="abbreviations"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-2">
                          <FormLabel className="flex">
                            <div className="text-red-500">*</div> Tên viết tắt
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập tên viết tắt"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="taxCode"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-2">
                          <FormLabel className="flex">Mã số thuế</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập mã số thuế"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="mb-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-2">
                          <FormLabel className="flex">Địa chỉ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập địa chỉ"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-2">
                          <FormLabel className="flex">Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập email"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="typeCustomer"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-2">
                          <FormLabel className="flex">
                            Loại hình khách hàng
                          </FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại khách hàng" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {typeCustomerData?.map((item: any) => (
                                <SelectItem
                                  key={item?.value}
                                  value={item?.value}
                                >
                                  {item?.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-2">
                          <FormLabel className="flex">Số điện thoại</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập số điện thoại"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="process"
                    render={({ field }) => (
                      <FormItem className="mt-[-5px]">
                        <FormLabel>
                          <div className="mt-[5px]">
                            <span className="text-red-500">* </span> Tiến trình
                          </div>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tiến trình" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {processData?.map((item: any) => (
                              <SelectItem key={item?.id} value={item?.name}>
                                {item?.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="my-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => {
                      return (
                        <FormItem className="mb-2">
                          <FormLabel className="flex">Ghi chú</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập ghi chú khách hàng"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                {/* Các phần input */}
                <div className="mb-2 flex flex-col w-full">
                  <p className="text-[14px] mb-1 font-medium">
                    Bộ phận liên hệ
                  </p>
                  {fields?.map((item, index) => (
                    <div key={index} className="flex items-center mb-2 w-full">
                      <FormField
                        control={form.control}
                        name={`departments.${index}.department`}
                        key={item.id}
                        render={({ field }) => {
                          return (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input
                                  placeholder="Tên - Số điện thoại - Email"
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormDescription />
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      {index > 0 && (
                        <Button
                          onClick={() => remove(index)}
                          variant={"destructive"}
                          className="ml-2 mb-2"
                        >
                          {/* <CloseIcon /> */} Xóa
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => append({ department: "" })}
                    type="button"
                    className="mt-3"
                  >
                    + Thêm dòng
                  </Button>
                </div>
                <div className="w-full flex justify-end">
                  <DialogClose>
                    <Button type="button" variant="secondary">
                      Huỷ
                    </Button>
                  </DialogClose>
                  {[mutation.isPending, mutationUpdate.isPending].includes(
                    true
                  ) ? (
                    <Button disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Xin chờ
                    </Button>
                  ) : (
                    <Button className="ml-2" variant="default" type="submit">
                      {customerData ? "Sửa" : "Thêm"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="uploadExcel">
            <div
              className={`flex flex-col items-center justify-center w-full h-[470px] `}
            >
              <BsFileEarmarkExcelFill
                onClick={() => inputRef.current && inputRef.current?.click()}
                fill="#117D43"
                className="w-[100px] h-[100px] cursor-pointer"
              />
              <p className="mt-2">Tải lên file excel</p>
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept="xlsx"
                onChange={handleChangeExcel}
              />
              <div className="mt-10">
                <Link href="/excels/Mẫu thông tin khách hàng.xlsx" download>
                  <Button variant="outline">
                    Tải xuống File Excel mẫu
                  </Button>
                </Link>
              </div>
              {fileUploaded && (
                <p className="text-center text-gray-600 mt-10">
                  Tệp <strong>{uploadedFileName}</strong> đã được tải lên thành
                  công.
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose>
                <Button type="button" variant="secondary">
                  Huỷ
                </Button>
              </DialogClose>
              <DialogClose>
                <Button
                  type="submit"
                  variant="default"
                  onClick={handleAddProductExcel}
                >
                  Thêm
                </Button>
              </DialogClose>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
