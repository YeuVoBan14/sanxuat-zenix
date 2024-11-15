"use client"
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SelectComponent from "@/components/Select";
import { IoAdd } from "react-icons/io5";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { typeData } from "@/constants/supply_data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BsFileEarmarkExcelFill } from "react-icons/bs";
import { addProduct, addProductExcel } from "@/api/product";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getSupplierList } from "@/api/supply";
import MultiSelect from "@/components/multiSelect/MultiSelect";
import { ReloadIcon } from "@radix-ui/react-icons";

interface DocumentBody {
  producer: string;
  productName: string;
  productCode: string;
  describe: string;
  unit: string;
  type: string;
  MMQ: number;
  image?: File;
  supplierId: number[];
}

const initialState = {
  producer: "",
  productName: "",
  productCode: "",
  describe: "",
  unit: "",
  type: "",
  MMQ: 0,
  image: undefined,
  supplierId: [],
};

interface CreateProductProps {
  refetch: () => void;
}

export default function CreateProduct({ refetch }: CreateProductProps) {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    keySearch: string,
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
  });
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [productData, setProductData] = useState<DocumentBody>(initialState);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const handleChangeInput = (value: string, key: string) => {
    setProductData({ ...productData, [key]: value });
  };
  const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setProductData({ ...productData, image: event.target.files[0] });
    }
  };
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

  const {
    data: supplierList
  } = useQuery({
    queryKey: ["supplierList", pagination],
    queryFn: () => getSupplierList(pagination)
  });

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, page: 0 });
    }, 500);
    return () => clearTimeout(timeId);
  }, []);

  const mutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productsData"],
      });
      toast({
        title: "Thành công",
        description: "Thêm mới sản phẩm thành công",
      });
      refetch();
      setOpen(false);
      setIsLoading(false);
      setProductData(initialState);
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Thất bại",
        description: error?.message,
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

  const handleAddProduct = () => {
    setIsLoading(true);
    const formData = new FormData();

    if (
      !validateField(productData.productName, "Vui lòng nhập tên sản phẩm !") ||
      !validateField(productData.productCode, "Vui lòng nhập mã sản phẩm !") ||
      !validateField(productData?.producer, "Vui lòng nhập nhà sản xuất !") ||
      // !validateField(productData.supplierId?.length, "Vui lòng chọn nhà cung cấp !") ||
      !validateField(productData.unit, "Vui lòng nhập đơn vị tính !") ||
      !validateField(productData.MMQ, "Vui lòng nhập MMQ !") ||
      // !validateField(productData.image, "Vui lòng chọn ảnh sản phẩm !") ||
      !validateField(productData.type, "Vui lòng chọn loại hình !")
      //  !validateField(productData.describe, "Vui lòng nhập mô tả !")
    ) {
      setIsLoading(false);
      return;
    }

    formData.append("producer", productData.producer);
    formData.append("productName", productData.productName);
    formData.append("productCode", productData.productCode);
    formData.append("describe", productData.describe);
    formData.append("unit", productData.unit);
    formData.append("type", productData.type);
    productData.supplierId?.map((i: any) => {
      formData.append("supplierId[]", i);
    })
    formData.append("MMQ", String(productData.MMQ));
    if (productData.image) {
      formData.append("image", productData.image);
    }

    mutation.mutateAsync(formData);
  }

  const mutationExcel = useMutation({
    mutationFn: addProductExcel,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productsData"],
      });
      toast({
        title: "Thành công",
        description: "Thêm nhiều sản phẩm từ file Excel thành công",
      });
      setOpen(false);
      setIsLoading(false);
      refetch();
      setFileUploaded(false);
      setUploadedFileName("");
    },
    onError: (error) => {
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
    formData.append("file", excelFile as Blob);

    mutationExcel.mutateAsync(formData);
  }

  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="shadow-md ml-2" asChild>
        <Button variant="default">
          <IoAdd fill="#ffffff" size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Điền thông tin</TabsTrigger>
            <TabsTrigger value="upload">Tải lên file excel</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <div className="grid grid-cols-2 gap-4">
              <div className=" mb-2">
                <p className="text-[14px] mb-1">Tên sản phẩm</p>
                <Input
                  placeholder="Nhập tên sản phẩm"
                  value={productData["productName"]}
                  onChange={(e) =>
                    handleChangeInput(e.target.value, "productName")
                  }
                />
              </div>
              <div className=" mb-2">
                <p className="text-[14px] mb-1">Mã sản phẩm</p>
                <Input
                  placeholder="Nhập mã sản phẩm"
                  value={productData["productCode"]}
                  onChange={(e) =>
                    handleChangeInput(e.target.value, "productCode")
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="text-[14px] mb-1">Nhà sản xuất</p>
                <Input
                  placeholder="Nhập nhà sản xuất"
                  value={productData["producer"]}
                  onChange={(e) => handleChangeInput(e.target.value, "producer")}
                />
              </div>
              <div>
                <p className="text-[14px] mb-1">Nhà cung cấp</p>
                <MultiSelect
                  className="w-full h-[40px]"
                  options={supplierList?.data?.results?.map((ele: any) => {
                    return {
                      value: ele.id,
                      label: ele["name"],
                    };
                  })}
                  selected={productData["supplierId"]}
                  onChange={(valueArr: any) =>
                    setProductData({ ...productData, ["supplierId"]: valueArr })
                  }
                  placeholder="Chọn nhà cung cấp"
                  title="Nhà cung cấp"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className=" mb-2">
                <p className="text-[14px] mb-1">Đơn vị tính</p>
                <Input
                  placeholder="Nhập đơn vị tính"
                  value={productData["unit"]}
                  onChange={(e) => handleChangeInput(e.target.value, "unit")}
                />
              </div>
              <div className=" mb-2">
                <p className="text-[14px] mb-1">M.O.Q</p>
                <Input
                  type="number"
                  placeholder="Nhập M.O.Q"
                  value={productData["MMQ"]}
                  onChange={(e) => handleChangeInput(e.target.value, "MMQ")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="w-full max-w-sm mb-2">
                <p className="text-[14px] mb-1">Ảnh sản phẩm</p>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleChangeImage}
                />
              </div>
              <div className="mb-2">
                <p className="text-[14px] mb-1">Loại hình</p>
                <SelectComponent
                  value={productData["type"]}
                  setValue={(value: any) =>
                    setProductData({ ...productData, type: value })
                  }
                  label="Loại hình"
                  placeholder="Chọn loại hình"
                  data={typeData}
                  key="id"
                  displayProps="name"
                />
              </div>
            </div>
            <div className=" mb-2">
              <p className="text-[14px] mb-1">Mô tả</p>
              <Textarea
                className="shadow-md"
                placeholder="Nhập mô tả"
                value={productData["describe"]}
                onChange={(e) => handleChangeInput(e.target.value, "describe")}
              />
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Huỷ
                </Button>
              </DialogClose>
              <Button
                type="submit"
                onClick={handleAddProduct}
                disabled={isLoading}
                variant="default"
              >
                {isLoading && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Thêm
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="upload">
            <div className="flex flex-col items-center justify-center w-full h-[360px] ${fileUploaded ? 'hidden' : ''">
              <BsFileEarmarkExcelFill
                onClick={() => inputRef.current && inputRef.current?.click()}
                fill="#117D43"
                className="w-[100px] h-[100px] cursor-pointer"
              />
              <p className="mt-2 text-[18px]">Tải lên file excel</p>
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept="xlsx"
                onChange={handleChangeExcel}
              />
              <div className="mt-10">
                <Link href="/excels/Mẫu thông tin sản phẩm.xlsx" download>
                  <Button variant={"outline"}>
                    Tải xuống File Excel mẫu
                  </Button>
                </Link>
              </div>
              {fileUploaded && (
                <p className="text-center text-gray-600 mt-4">
                  Tệp <strong>{uploadedFileName}</strong> đã được tải lên thành
                  công.
                </p>
              )}
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Huỷ
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isLoading}
                onClick={handleAddProductExcel}
                variant="default"
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
