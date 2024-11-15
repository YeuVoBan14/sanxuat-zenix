import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPaymentMethod } from "@/api/payment";
import Edit from "@/components/icons/Edit";
import { Supplier } from "@/types/type";
import { editSupplier, postSupplier, postSupplierExcel } from "@/api/supply";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BsFileEarmarkExcelFill } from "react-icons/bs";
import Link from "next/link";
import { ReloadIcon } from "@radix-ui/react-icons";
import * as XLSX from "xlsx";

const initialState = {
  paymentMethodId: 0,
  abbreviation: "",
  userContact: "",
  name: "",
  taxCode: "",
  rate: 0,
  address: "",
  phoneNumber: "",
  bankAccount: "",
  fileSupplier: null,
  subEmail: [""],
};

export default function CreateAndUpdateSupplier({
  edit,
  dataList,
}: {
  edit?: boolean;
  dataList?: any;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingExcel, setIsLoadingExcel] = useState<boolean>(false);
  const [supplierData, setSupplierData] = useState<Supplier>(initialState);
  const [supplierInputs, setSupplierInputs] = useState<string[]>([""]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const id = dataList?.id;

  const { data: paymentMethodList } = useQuery({
    queryKey: ["paymentMethodList"],
    queryFn: getPaymentMethod,
  });

  useEffect(() => {
    async function getSupplierData() {
      try {
        setSupplierData({
          paymentMethodId: dataList?.paymentMethodId || null,
          abbreviation: dataList?.abbreviation || "",
          userContact: dataList?.userContact || "",
          address: dataList?.address || "",
          phoneNumber: dataList?.phoneNumber || "",
          name: dataList?.name || "",
          bankAccount: dataList?.bankAccount || "",
          rate: dataList?.rate || 0,
          taxCode: dataList?.taxCode || "",
          fileSupplier: dataList?.fileSupplier || "",
          subEmail: dataList?.Email_Suppliers || [],
        });

        setSupplierInputs(
          dataList.Email_Suppliers.map((email: any) => email.email)
        );
      } catch (error) {
        console.log("Error fetching customer data", error);
      }
    }
    getSupplierData();
  }, [dataList?.id]);

  const handleAddDepartmentInput = () => {
    setSupplierInputs([...supplierInputs, ""]);
  };

  const handleDepartmentInputChange = (value: string, index: number) => {
    const updatedSupplierInputs = [...supplierInputs];
    updatedSupplierInputs[index] = value;
    setSupplierInputs(updatedSupplierInputs);

    if (edit) {
      const subEmail = updatedSupplierInputs
        .filter((input) => typeof input === "string" && input?.trim() !== "")
        .map((input) => ({ email: input?.trim() }));

      setSupplierData({ ...supplierData, subEmail });
    }
  };

  const handleChangeInput = (value: string, key: keyof Supplier) => {
    setSupplierData({ ...supplierData, [key]: value });
  };

  const handleRemoveDepartmentInput = (index: number) => {
    const updatedSupplierInputs = [...supplierInputs];
    updatedSupplierInputs.splice(index, 1);
    setSupplierInputs(updatedSupplierInputs);

    if (edit) {
      setSupplierData({ ...supplierData, subEmail: updatedSupplierInputs });
    }
  };

  const handleChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSupplierData({ ...supplierData, fileSupplier: file });
    }
  };

  const mutation = useMutation({
    mutationFn: (data: Supplier) =>
      edit ? editSupplier(data, id) : postSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supplierList"],
      });
      setSupplierData(initialState);
      setSupplierInputs([""]);
      setOpen(false);
      setIsLoading(false);
      toast({
        title: "Thành công",
        description: `${edit ? "Sửa" : "Thêm mới"} nhà cung cấp thành công`,
      });
    },
    onError: (error: any) => {
      setIsLoading(false);
      toast({
        title: "Thất bại",
        description: error?.response?.data.message,
      });
    },
  });

  const validateField = (field: any, message: string) => {
    if (!field) {
      toast({
        title: "Thất bại",
        description: message,
      });
      return false;
    }
    return true;
  };
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const updatedSubEmails = supplierInputs
      .filter((input) => typeof input === "string" && input.trim() !== "")
      .map((input) => ({ email: input.trim() }));

    const updatedSupplierData = {
      ...supplierData,
      subEmail: updatedSubEmails,
    };

    if (edit) {
      mutation.mutateAsync({ ...updatedSupplierData }, id);
    } else {
      const subEmail = supplierInputs
        .filter((input) => input?.trim() !== "")
        .map((input) => input.trim());

      const updatedSupplierData = {
        ...supplierData,
        subEmail,
      };
      if (
        !validateField(
          supplierData.abbreviation,
          "Vui lòng nhập tên viết tắt !"
        ) ||
        !validateField(supplierData?.taxCode, "Vui lòng nhập mã số thuế !") ||
        !validateField(supplierData.name, "Vui lòng nhập tên nhà cung cấp !") ||
        !validateField(
          supplierData.userContact,
          "Vui lòng nhập người liên hệ !"
        ) ||
        !validateField(
          supplierData.phoneNumber,
          "Vui lòng nhập số điện thoại !"
        ) ||
        !validateField(supplierData.address, "Vui lòng nhập địa chỉ !") ||
        !supplierInputs.every((email) => validateEmail(email)) ||
        !validateField(
          supplierData.bankAccount,
          "Vui lòng nhập tài khoản ngân hàng !"
        )
        // !validateField(
        //   supplierData.paymentMethodId,
        //   "Vui lòng chọn điều kiện thanh toán !"
        // ) ||
        // !validateField(supplierData.fileSupplier, "Vui lòng tải file !")
      ) {
        if (!supplierInputs.every((email) => validateEmail(email))) {
          toast({
            title: "Thất bại",
            description: "Vui lòng nhập email hợp lệ !",
          });
        }
        setIsLoading(false);
        return;
      }
      mutation.mutateAsync(updatedSupplierData);
    }
  };

  const handleChangeExcel = (event: ChangeEvent<HTMLInputElement>) => {
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

  const mutationExcel = useMutation({
    mutationFn: postSupplierExcel,
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({
        queryKey: ["supplierList"],
      });
      setFileUploaded(false);
      setUploadedFileName("");
      setIsLoading(false);
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
    },
    onError: (error: any) => {
      setIsLoading(false);
      toast({
        title: "Thất bại",
        description: error?.message,
      });
    },
  });

  const handleAddProductExcel = () => {
    setIsLoading(true);
    const formData = new FormData();
    if (!excelFile) {
      toast({
        title: "Thất bại",
        description: "Vui lòng chọn File Excel trước",
      });
    }
    formData.append("fileExcel", excelFile as Blob);
    mutationExcel.mutateAsync(formData);
  };

  const fetchExcelTemplate = async () => {
    const response = await fetch("/excels/Mẫu thông tin nhà cung cấp.xlsx");
    const data = await response.arrayBuffer();
    return data;
  };

  const handleDownloadExcel = async () => {
    setIsLoadingExcel(true);
    try {
      const templateData = await fetchExcelTemplate();
      const workbook = XLSX.read(new Uint8Array(templateData), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const paymentMethodsData = paymentMethodList?.data?.map((method: any, index: number) => [
        index + 1,
        method.id,
        method.name
      ]);

      XLSX.utils.sheet_add_aoa(worksheet, [["STT", "Mã phương thức thanh toán", "Tên phương thức thanh toán"]], { origin: "O1" });
      XLSX.utils.sheet_add_aoa(worksheet, paymentMethodsData, { origin: "O2" });

      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, worksheet, "Suppliers");
      XLSX.writeFile(newWorkbook, "Danh_sach_nha_cung_cap_mau.xlsx");

      toast({
        title: "Thành công",
        description: "File Excel mẫu đã được tạo và tải xuống.",
      });
      setIsLoadingExcel(false);
    } catch (error) {
      toast({
        title: "Thất bại",
        description: "Đã xảy ra lỗi khi tạo file Excel mẫu.",
      });
      setIsLoadingExcel(false);
      console.error("Error downloading Excel:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {edit ? (
          <div>
            <Edit width="20" height="20" />
          </div>
        ) : (
          <Button size="sm">Thêm nhà cung cấp</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{edit ? "Sửa" : "Thêm"} nhà cung cấp</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="createSupplier">
          {!edit && (
            <TabsList className="grid w-full grid-cols-2 mb-5">
              <TabsTrigger value="createSupplier">
                Thêm nhà cung cấp
              </TabsTrigger>
              <TabsTrigger value="uploadExcel">Upload Excel</TabsTrigger>
            </TabsList>
          )}
          <TabsContent value="createSupplier" className="w-full">
            <div className="mb-3">
              <div className="grid grid-cols-2 gap-2 w-full mb-2">
                <div>
                  <p>
                    <span className="text-red-500">*</span> Tên viết tắt
                  </p>
                  <Input
                    placeholder={"Nhập tên viết tắt"}
                    value={supplierData["abbreviation"]}
                    onChange={(e) =>
                      handleChangeInput(e.target.value, "abbreviation")
                    }
                  />
                </div>
                <div>
                  <p>
                    <span className="text-red-500">*</span> Mã số thuế
                  </p>
                  <Input
                    placeholder={"Nhập mã số thuế"}
                    value={supplierData["taxCode"]}
                    onChange={(e) =>
                      handleChangeInput(e.target.value, "taxCode")
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full mb-2">
                <div>
                  <p>
                    <span className="text-red-500">*</span> Nhà cung cấp
                  </p>
                  <Input
                    placeholder={"Nhập tên nhà cung cấp"}
                    value={supplierData["name"]}
                    onChange={(e) => handleChangeInput(e.target.value, "name")}
                  />
                </div>
                <div>
                  <p>
                    <span className="text-red-500">*</span> Đánh giá
                  </p>
                  <Input
                    placeholder={"Nhập đánh giá"}
                    type="number"
                    value={supplierData["rate"]}
                    onChange={(e) => handleChangeInput(e.target.value, "rate")}
                  />
                </div>
              </div>
              <div className="mb-2">
                <div>
                  <p>
                    <span className="text-red-500">*</span> Người liên hệ
                  </p>
                  <Input
                    placeholder={"Nhập tên người liên hệ"}
                    value={supplierData["userContact"]}
                    onChange={(e) =>
                      handleChangeInput(e.target.value, "userContact")
                    }
                  />
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2">
                <div>
                  <p>
                    <span className="text-red-500">*</span> Số điện thoại
                  </p>
                  <Input
                    placeholder={"Nhập số điện thoại"}
                    value={supplierData["phoneNumber"]}
                    onChange={(e) =>
                      handleChangeInput(e.target.value, "phoneNumber")
                    }
                  />
                </div>
                <div>
                  <p>
                    <span className="text-red-500">*</span> Địa chỉ
                  </p>
                  <Input
                    placeholder={"Nhập địa chỉ"}
                    value={supplierData["address"]}
                    onChange={(e) =>
                      handleChangeInput(e.target.value, "address")
                    }
                  />
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-end mb-3">
                  <p>
                    <span className="text-red-500">*</span> Email
                  </p>
                  <Badge
                    onClick={handleAddDepartmentInput}
                    className="cursor-pointer"
                  >
                    +
                  </Badge>
                </div>
                {supplierInputs?.map((input: any, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <Input
                      key={index}
                      placeholder="Nhập email"
                      value={input}
                      onChange={(e) =>
                        handleDepartmentInputChange(e.target.value, index)
                      }
                      className={`${index > 0 && "mr-4"} flex-grow`}
                    />
                    {index > 0 && (
                      <Button
                        onClick={() => handleRemoveDepartmentInput(index)}
                        variant={"destructive"}
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <div>
                  <p>
                    <span className="text-red-500 mb-2">*</span> Tài khoản ngân
                    hàng
                  </p>
                  <Input
                    placeholder={"Nhập tài khoản ngân hàng"}
                    value={supplierData["bankAccount"]}
                    onChange={(e) =>
                      handleChangeInput(e.target.value, "bankAccount")
                    }
                  />
                </div>
                <div>
                  <p>
                    {/* <span className="text-red-500 mb-2">*</span> */}
                    Điều kiện thanh toán
                  </p>
                  <Select
                    onValueChange={(e) =>
                      handleChangeInput(e, "paymentMethodId")
                    }
                    defaultValue={dataList?.paymentMethodId}
                  >
                    <SelectTrigger className="shadow-md">
                      <SelectValue placeholder="Chọn điều kiện thanh toán" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {paymentMethodList?.data?.map((i: any) => {
                          return (
                            <SelectItem key={i?.id} value={i?.id}>
                              {i?.id} - {i?.name}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    {/* <span className="text-red-500">*</span> */}
                    Tải file
                  </div>
                  {edit && supplierData["fileSupplier"] && (
                    <a href={`${supplierData["fileSupplier"]}`} target="_blank">
                      <Badge>Xem file</Badge>
                    </a>
                  )}
                </div>
                <Input type="file" onChange={handleChangeFile} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose>
                <Button type="button" variant="secondary">
                  Huỷ
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="default"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {edit ? "Sửa" : "Thêm"}
              </Button>
            </DialogFooter>
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
                {/* <Link href="/excels/Mẫu thông tin nhà cung cấp.xlsx" download> */}
                <Button variant={"outline"} onClick={handleDownloadExcel} disabled={isLoadingExcel}>
                  {isLoadingExcel ? "Đang tải..." : "Tải xuống File Excel mẫu"}
                </Button>
                {/* </Link> */}
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
              <Button
                type="submit"
                variant="default"
                disabled={isLoading}
                onClick={handleAddProductExcel}
              >
                {isLoading && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Thêm
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
