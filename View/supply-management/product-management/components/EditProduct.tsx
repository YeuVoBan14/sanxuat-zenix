"use client";
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
import { useEffect, useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import Edit from "@/components/icons/Edit";
import { toast } from "@/components/ui/use-toast";
import { updateProduct } from "@/api/product";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ReloadIcon } from "@radix-ui/react-icons";
import SelectComponent from "@/components/Select";
import { typeData } from "@/constants/supply_data";
import MultiSelect from "@/components/multiSelect/MultiSelect";
import { getSupplierList } from "@/api/supply";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  producer: z.string(),
  productName: z.string(),
  describe: z.string(),
  unit: z.string(),
  type: z.string(),
  MMQ: z.number(),
  supplierId: z.array(z.number()),
  image: z.instanceof(File),
});


interface DocumentBody {
  producer: string;
  productName: string;
  productCode: string;
  describe: string;
  unit: string;
  type: string;
  MMQ: number;
  image?: File;
  suppliers: any[];
  producerInfo: any;
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
  suppliers: [],
  producerInfo: {
    name: "",
  },
};


interface EditProductProps {
  productData: any;
  refetch: () => void;
}

const EditProduct = ({ productData, refetch }: EditProductProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    keySearch: string,
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
  });
  const [product, setProduct] = useState<DocumentBody>(initialState);

  const {
    data: supplierList
  } = useQuery({
    queryKey: ["supplierList", pagination],
    queryFn: () => getSupplierList(pagination)
  });

  useEffect(() => {
    async function getProductData() {
      try {
        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product data: ", error);
      }
    }
    getProductData();
  }, [productData?.id]);

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, page: 0 });
    }, 500);
    return () => clearTimeout(timeId);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      producer: "",
      productName: "",
      describe: "",
      unit: "",
      type: "",
      MMQ: 0,
      supplierId: [],
      image: undefined,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        producer: product.producer,
        productName: product.productName,
        describe: product.describe,
        unit: product.unit,
        type: product.type,
        MMQ: product.MMQ,
        supplierId: product.suppliers.map((supplier) => supplier.id),
        image: product.image,
      });
    }
  }, [product]);

  const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      form.setValue("image", file);
    }
  };

  const handleSupplierChange = (valueArr: any) => {
    const currentFormValues = form.getValues();
    const validValues = valueArr.map((val: any) => {
      const selectedOption = supplierList?.data?.results?.find(
        (ele: any) => ele.id === val
      );
      return selectedOption ? { id: selectedOption.id, name: selectedOption.name } : null;
    }).filter(Boolean);

    setProduct((prevProduct) => ({
      ...prevProduct,
      suppliers: validValues,
      producer: currentFormValues.producer,
      productName: currentFormValues.productName,
      describe: currentFormValues.describe,
      unit: currentFormValues.unit,
      type: currentFormValues.type,
      MMQ: currentFormValues.MMQ,
      image: currentFormValues.image,
    }));
  };

  const mutation = useMutation({
    mutationFn: (data: any) => updateProduct(productData?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productsData"],
      });
      toast({
        title: "Thành công",
        description: "Cập nhật sản phẩm thành công",
      });
      setIsLoading(false);
      refetch();
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Thất bại",
        description: error?.message,
      });
    },
  });

  const handleUpdateProduct = async () => {
    setIsLoading(true);
    const data = form.getValues();

    const formData = new FormData();
    formData.append("producer", data.producer);
    formData.append("productName", data.productName);
    formData.append("describe", data.describe);
    formData.append("unit", data.unit);
    formData.append("type", data.type);
    if (data.MMQ === null) {
      formData.append("MMQ", "");
    } else {
      formData.append("MMQ", String(data.MMQ));
    }
    if (data.supplierId.length === 0) {
      formData.append("supplierId[]", "");
    } else {
      data.supplierId.forEach((supplierId) => {
        formData.append("supplierId[]", supplierId.toString());
      });
    }

    formData.append("image", data.image);

    mutation.mutateAsync(formData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <Edit width="20" height="20" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Sửa sản phẩm</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="w-full flex flex-col gap-4">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Tên sản phẩm</FormLabel>
                    <Input type="text" {...field} />
                  </FormItem>
                );
              }}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="producer"
                defaultValue={product?.producerInfo?.name}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Nhà sản xuất</FormLabel>
                      <Input type="text" {...field} />
                    </FormItem>
                  );
                }}
              />
              <div>
                <p className="text-[14px] mb-1 mt-2">Nhà cung cấp</p>
                <MultiSelect
                  className="w-full h-[40px]"
                  options={supplierList?.data?.results?.map((ele: any) => ({
                    value: ele.id,
                    label: ele.name,
                  })) || []}
                  selected={product?.suppliers?.map((item: any) => item?.id) || []}
                  onChange={handleSupplierChange}
                  placeholder="Chọn nhà cung cấp"
                  title="Nhà cung cấp"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Đơn vị tính</FormLabel>
                      <Input type="text" {...field} />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="MMQ"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>M.O.Q</FormLabel>
                      <Input type="number" {...field} />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5 mb-2">
                <p className="text-[14px] mb-1 font-bold">Ảnh sản phẩm</p>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleChangeImage}
                />
              </div>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Loại hình</FormLabel>
                      <SelectComponent
                        value={field.value}
                        setValue={field.onChange}
                        placeholder="Chọn loại hình"
                        data={typeData}
                        key="id"
                        displayProps="name"
                      />
                    </FormItem>
                  );
                }}
              />
            </div>
            <FormField
              control={form.control}
              name="describe"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <Textarea {...field} className="shadow-md" />
                  </FormItem>
                );
              }}
            />
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Huỷ
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  variant="default"
                  disabled={isLoading}
                  type="submit"
                  onClick={handleUpdateProduct}
                >
                  {isLoading && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Lưu thay đổi
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProduct;
