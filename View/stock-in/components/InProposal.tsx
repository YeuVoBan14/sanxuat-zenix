"use client";
import {
  exportQuotation,
  getDetailQuotation,
  processQuotation,
} from "@/api/quotations";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  getDetailPurchaseOrder,
  postInputProposal,
  postOutputProposal,
} from "@/api/purchase";
import BreadcrumbFunction from "@/components/Breadcrumb";
import ErrorViews from "@/components/ErrorViews";

interface ProductDataType {
  productCode: string;
  producerName: string;
  POPId: number;
  supplier: string;
  quantity: number;
  unit: string;
  quantityWH: number;
  quantityStock: number;
  quantityInput: number;
  quantityInStock: number;
  quantityExport: number;
}

export default function InputProposal() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [productsData, setProductsData] = useState<ProductDataType[]>([]);
  const [valueStatus, setValueStatus] = useState<number>();
  const [exportStatus, setExportStatus] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<{ role: string, department: string }>();
  const {
    data: detailDataPurchase,
    refetch,
    error,
  } = useQuery({
    queryKey: ["detailDataPurchase", params.slug[1]],
    queryFn: () => getDetailPurchaseOrder(Number(params.slug[1])),
    enabled: params.slug[1] ? true : false,
  });
  const warehouseSuggests: any[] =
    detailDataPurchase?.data?.data?.WarehouseSuggests;
  const { data: fileData, isLoading: loadFileData } = useQuery({
    queryKey: ["exportQuotation", exportStatus],
    queryFn: () => exportQuotation(Number(params.slug[1])),
    enabled: params.slug[1] && exportStatus ? true : false,
  });
  const mutationInputProposal = useMutation({
    mutationFn: postInputProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["postInputProposal"],
      });
      toast({
        title: "Thành công",
        description: "Đề xuất nhập kho thành công",
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error?.message,
      });
    },
  });
  const mutationOutputProposal = useMutation({
    mutationFn: postOutputProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["postOutputProposal"],
      });
      toast({
        title: "Thành công",
        description: "Đề xuất xuất kho thành công",
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error?.message,
      });
    },
  });
  // useEffect(() => {
  //   if (error) {
  //     toast({
  //       title: "Thất bại",
  //       description: error?.message,
  //     });
  //   }
  // }, [error]);
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      documentNumber: "",
      file: null,
      dataProduct: productsData,
    },
  });

  useEffect(() => {
    if (detailDataPurchase && params.slug[1]) {
      const listQuoteProduct: any[] = [];
      detailDataPurchase?.data?.data?.OrderProducts?.forEach((item: any) => {
        listQuoteProduct.push({
          productCode: item.Quote_History.Product.productCode,
          producerName: item.Quote_History.Product.productName,
          quantity: item.Quote_History.quantity,
          unit: item.Quote_History.unit,
          quantityWH: item.PurchaseOrderProduct.quantityWH,
          quantityStock: item.Quote_History.Warehouse.quantity,
          quantityInput: 1,
          supplier: item.Quote_History.Supplier.name,
          POPId: item.PurchaseOrderProduct.id,
          quantityExport: item.PurchaseOrderProduct.quantityExport,
          quantityInStock:
            params?.slug[0] === "input-proposal"
              ? 1
              : item.Quote_History?.Warehouse
                ? item.Quote_History?.Warehouse?.quantity
                : 1,
        });
      });
      setProductsData(listQuoteProduct);
      setValue("dataProduct", listQuoteProduct);
      warehouseSuggests?.length > 0
        ? setValue(
          "documentNumber",
          warehouseSuggests[warehouseSuggests?.length - 1]?.documentNumber
        )
        : setValue("documentNumber", "");
    }
  }, [detailDataPurchase, params.slug[1]]);
  const { fields } = useFieldArray({
    control,
    name: "dataProduct",
  });
  const renderProductSupplierRow = (
    item: any,
    index: number,
    productsData: ProductDataType[]
  ) => {
    return (
      <div
        key={`${index + 1}`}
        className="flex items-center justify-between gap-1 mb-2"
      >
        <Input
          className="w-[300px] text-xs"
          value={item?.producerName}
          contentEditable={false}
          disabled
        />
        <Input
          className="w-[150px] text-xs"
          value={item?.productCode}
          contentEditable={false}
          disabled
        />
        <Input
          className="w-[120px] text-xs"
          value={item?.supplier}
          contentEditable={false}
          disabled
        />
        <Input
          className="w-[100px]"
          type="number"
          value={item.quantity}
          contentEditable={false}
          disabled
        />
        <Input
          className="w-[100px] text-xs"
          value={item.unit}
          contentEditable={false}
          disabled
        />
        {params?.slug[0] === "input-proposal" ? (
          <>
            <Input
              className="w-[100px] text-xs"
              value={item.quantityWH}
              contentEditable={false}
              disabled
            />
            <Input
              className="w-[100px] text-xs"
              value={item.quantityStock}
              contentEditable={false}
              disabled
            />
          </>
        ) : (
          <>
            <Input
              className="w-[100px] text-xs"
              value={item.quantityInStock}
              contentEditable={false}
              disabled
            />
            <Input
              className="w-[100px] text-xs"
              value={item.quantityExport}
              contentEditable={false}
              disabled
            />
          </>
        )}
        <Controller
          name={`dataProduct.${index}.quantityInput`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              className="w-[100px] text-xs"
              defaultValue={field.value}
              onChange={field.onChange}
              min={1}
              type="number"
            />
          )}
        />
      </div>
    );
  };

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("purchaseOrderId", detailDataPurchase?.data?.data?.id);
    formData.append("documentNumber", data["documentNumber"]);
    data["dataProduct"].forEach((item: { POPId: number }) => {
      formData.append("POPId[]", JSON.stringify(item.POPId));
    });
    data["dataProduct"].forEach((item: { quantityInput: number }) => {
      // if (!item.quantityInput) {
      //   toast({
      //     title: "Thất bại",
      //     description: "Vui lòng nhập số lượng !",
      //   });
      //   return false;
      // }

      const formattedQuantity = Number(item.quantityInput).toString();
      formData.append("quantity[]", formattedQuantity);
    });
    if (
      warehouseSuggests?.length > 0 &&
      warehouseSuggests[warehouseSuggests?.length - 1]?.deliveryRecordFile
    ) {
      formData.append("file", data["file"]);
      formData.append(
        "deliveryRecordFile",
        warehouseSuggests?.length > 0
          ? warehouseSuggests[warehouseSuggests?.length - 1]?.deliveryRecordFile
          : ""
      );
      if (params?.slug[0] === "input-proposal") {
        mutationInputProposal.mutate(formData);
      } else {
        mutationOutputProposal.mutate(formData);
      }
    } else {
      // if (data["file"]) {
      formData.append("file", data["file"]);
      if (params?.slug[0] === "input-proposal") {
        mutationInputProposal.mutate(formData);
      } else {
        mutationOutputProposal.mutate(formData);
      }
      // } else {
      //   toast({
      //     title: "Thất bại",
      //     description: "Bạn chưa chọn file !!!",
      //   });
      // }
    }
  };

  const renderRouter = (department?: string) => {
    if (department === "sale") {
      router.push("/admin/orders");
    } else if (department === "purchase") {
      router.push("/admin/purchase");
    } else if (department === "warehouse") {
      router.push("/admin/output");
    } else {
      router.back();
    }
  }

  if (error instanceof Error && "response" in error) {
    const status = (error as any).response?.status;
    const type = (error as any).response?.type;
    const statusText = (error as any).response?.statusText;
    const message = (error as any).response?.data?.message;
    return (
      <ErrorViews status={status} statusText={statusText} message={message} type={type} />
    );
  }

  return (
    <>
      <BreadcrumbFunction
        functionName="Kho vận"
        title={`Tạo đề xuất ${params?.slug[0] === "input-proposal" ? "nhập" : "xuất"
          } kho`}
        hasChildFunc={false}
        link={
          params?.slug[0] === "input-proposal" ? "admin/input" : "admin/output"
        }
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-2 gap-8">
            <div className="w-full">
              <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
                Thông tin đơn hàng:
              </h5>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Ngày đặt hàng:</p>
                <span className="text-[14px]">
                  {detailDataPurchase?.data?.data?.createdAt &&
                    format(
                      detailDataPurchase?.data?.data?.createdAt,
                      "yyyy/MM/dd"
                    )}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">P.O Code(ID):</p>
                <span className="text-[14px]">
                  {detailDataPurchase?.data?.data?.POCode}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Số báo giá:</p>
                <span className="text-[14px]">
                  {detailDataPurchase?.data?.data?.Order?.Quotation?.code}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Pur phụ trách:</p>
                <span className="text-[14px]">
                  {
                    detailDataPurchase?.data?.data?.Order?.purchaseInfo
                      ?.fullName
                  }
                </span>
              </div>
              <>
                <div className="flex justify-between mb-1 w-full">
                  <p className="font-semibold text-[14px]">Email:</p>
                  <span className="text-[14px]">
                    {detailDataPurchase?.data?.data?.Order?.purchaseInfo?.email}
                  </span>
                </div>
                <div className="flex justify-between mb-1 w-full">
                  <p className="font-semibold text-[14px]">Số điện thoại:</p>
                  <span className="text-[14px]">
                    {
                      detailDataPurchase?.data?.data?.Order?.purchaseInfo
                        ?.phoneNumber
                    }
                  </span>
                </div>
              </>
            </div>

            <div className="w-full">
              <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
                Thông tin nhà cung cấp:
              </h5>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Công ty:</p>
                <span className="text-[14px]">
                  {detailDataPurchase?.data?.data?.Supplier?.name}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Địa chỉ:</p>
                <span className="text-[14px]">
                  {detailDataPurchase?.data?.data?.Supplier?.address}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Mã số thuế:</p>
                <span className="text-[14px]">
                  {detailDataPurchase?.data?.data?.Supplier?.taxCode}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Người liên hệ:</p>
                <span className="text-[14px]">
                  {detailDataPurchase?.data?.data?.Supplier?.userContact}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Email:</p>
                <span className="text-[14px]">
                  {detailDataPurchase?.data?.data?.emailSupplier}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Số điện thoại:</p>
                <span className="text-[14px]">
                  {detailDataPurchase?.data?.data?.Supplier?.phoneNumber}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-center mt-3">
              <div className="w-[300px] text-center flex justify-center">
                <p className="w-[100px] text-[14px] translate-x-[-5px]">
                  Tên sản phẩm
                </p>
              </div>
              <div className="w-[150px] text-center flex justify-center">
                <p className="w-[100px] text-[14px] translate-x-[-5px]">
                  Mã sản phẩm
                </p>
              </div>
              <>
                <div className="w-[100px] text-center flex justify-center">
                  <p className="text-[14px]">Nhà cung cấp</p>
                </div>
                <div className="w-[100px] text-center flex justify-center">
                  <p className="text-[14px]">Số lượng</p>
                </div>
                <div className="w-[100px] text-center flex justify-center">
                  <p className="text-[14px]">Đơn vị tính</p>
                </div>
                {params?.slug[0] === "input-proposal" ? (
                  <>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Số lượng đã nhập kho</p>
                    </div>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Số lượng tồn kho</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Số lượng trong kho</p>
                    </div>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Số lượng đã xuất</p>
                    </div>
                  </>
                )}
                <div className="w-[100px] text-center flex justify-center">
                  <p className="text-[14px]">
                    {params?.slug[0] === "input-proposal"
                      ? "Số lượng nhập kho"
                      : "Số lượng xuất kho"}
                  </p>
                </div>
              </>
            </div>
            {fields?.map((item: ProductDataType, index: number) =>
              renderProductSupplierRow(item, index, productsData)
            )}
          </div>
          <div className="flex items-center mt-5">
            <div className="flex items-center w-[300px]">
              <p className="font-semibold text-[14px]">Số chứng từ:</p>
              <Controller
                name={`documentNumber`}
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    className="w-[200px] ml-2"
                    defaultValue={
                      warehouseSuggests?.length > 0
                        ? warehouseSuggests[warehouseSuggests?.length - 1]
                          ?.documentNumber
                        : ""
                    }
                    // value={
                    //   warehouseSuggests?.length > 0
                    //     ? warehouseSuggests[warehouseSuggests?.length - 1]
                    //       ?.documentNumber
                    //     : ""
                    // }
                    contentEditable={
                      warehouseSuggests?.length > 0 &&
                        warehouseSuggests[warehouseSuggests?.length - 1]
                          ?.documentNumber
                        ? false
                        : true
                    }
                    {...field}
                    onChange={field.onChange}
                    placeholder="Nhập số chứng từ"
                  />
                )}
              />
            </div>
            <div className="flex ml-3 items-center">
              <p className="font-semibold text-[14px]">
                File biên bản giao hàng:
              </p>
              <Controller
                control={control}
                name={`file`}
                render={({ field: { value, onChange, ...field } }) => {
                  return (
                    <Input
                      type="file"
                      id={`picture`}
                      className="hidden"
                      // accept="image/*"
                      ref={(el) => (fileInputRef.current = el)}
                      onChange={(event: any) => {
                        const file = event.target.files[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                    />
                  );
                }}
              />
              <Button
                className=" bg-blue-100 text-black border-none hover:bg-blue-200 ml-2"
                style={{
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
                type="button"
                disabled={
                  warehouseSuggests?.length > 0 &&
                    warehouseSuggests[warehouseSuggests?.length - 1]
                      ?.deliveryRecordFile
                    ? true
                    : false
                }
                onClick={() => fileInputRef.current?.click()}
              >
                {watch(`file`) ? "Đã tải file" : "Tải file"}
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end w-full">
          <div>
            <Button
              onClick={() => {
                if (params.slug[0] === "input-proposal") {
                  // router.push("/admin/purchase");
                  router.back();
                } else {
                  // renderRouter(user?.department);
                  router.back();
                }
              }}
              type="button"
              variant="outline"
            >
              Quay lại
            </Button>
          </div>
          <div>
            {[
              mutationInputProposal.isPending,
              mutationOutputProposal.isPending,
            ].includes(true) ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Xin chờ
              </Button>
            ) : (
              <Button className="ml-2" variant="default" type="submit">
                {params.slug[0] === "input-proposal"
                  ? "Đề xuất nhập kho"
                  : "Đề xuất xuất kho"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
