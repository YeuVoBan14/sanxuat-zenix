"use client";
import {
  cancelYCBG,
  createQuote,
  getDetailQuotationRequest,
} from "@/api/quotations";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import SelectComponent from "@/components/Select";
import { getBankAccount } from "@/api/payment";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import AddListProducts from "@/View/admin/customers/components/AddListProductsQuote";
import { CancelForm } from "@/View/admin/customers/components/CancelForm";

interface ProductDataType {
  productCode: string;
  producerName: string;
  productId: number;
  supplierId: number;
  priceSale: number;
  quantity: number;
  unit: string;
  pricePurchase: number;
  VATSale: number;
  VATPurchase: number;
  deliveryTime: string;
  type: string;
  quoteProductId: number;
  CPVC: number;
  deliveryTimeCus: string;
  currencyPurchase: string;
  currencySale: string;
  supplierQuoteId: number;
  note: string;
  supplierName: string;
  productName: string;
  createdAt: string;
}

const initialState = {
  userContact: "",
  priceTerm: "",
  qualityTerm: "",
  deliveryCondition: "",
  executionTime: "",
  warrantyCondition: "",
  TOP: "",
  paymentBy: "",
  validityQuote: "",
  bankAccountId: 0,
};

export default function CreateQuotation() {
  const [reasonArr, setReasonArr] = useState<{ id: number; refuse: boolean }[]>(
    []
  );
  const [reason, setReason] = useState<string>("");
  const [openReason, setOpenReason] = useState<boolean>(false);
  const [productSelected, setProductSelected] = useState<
    { id: number; productId: number }[]
  >([]);
  const [keyAction, setKeyAction] = useState<string>("ConfirmPurchase");
  const [bodyData, setBodyData] = useState<any>(initialState);
  const [productsData, setProductsData] = useState<ProductDataType[]>([]);
  const [accountInfo, setAccountInfo] = useState<any>();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: detailData, refetch } = useQuery({
    queryKey: ["detailRequest", params.slug[1]],
    queryFn: () => getDetailQuotationRequest(Number(params.slug[1])),
    enabled: params.slug[1] ? true : false,
  });
  const { data: bankAccount } = useQuery({
    queryKey: ["bankAccount"],
    queryFn: () => getBankAccount(),
  });
  const mutationCreateBG = useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["createQuote"],
      });
      toast({
        title: "Thành công",
        description: "Tạo báo giá thành công",
      });
      router.push("/admin/quote-requirement");
    },
    onError: (error: any) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: error?.response?.data?.message,
      });
    },
  });

  const mutationCancelYCBG = useMutation({
    mutationFn: cancelYCBG,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cancelYCBG"],
      });
      toast({
        title: "Thành công",
        description: "Thao tác thành công",
      });
      router.push("/admin/quote-requirement");
    },
    onError: (error: any) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: error?.response?.data?.message,
      });
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
    register,
  } = useForm({
    defaultValues: {
      userContact: "",
      priceTerm: "",
      qualityTerm: "",
      deliveryCondition: "",
      executionTime: "",
      warrantyCondition: "",
      TOP: "",
      paymentBy: "",
      validityQuote: "",
      bankAccountId: 0,
      dataProduct: productsData,
    },
  });

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (detailData && params.slug[1]) {
      const newArr: any[] = [];
      detailData?.data?.data?.quoteProducts.forEach((item: { id: number }) => {
        newArr.push({ id: item?.id, refuse: false });
      });
      setReasonArr(newArr);
      const listQuoteProduct: ProductDataType[] = [];
      if (
        detailData?.data?.data?.Timelines?.find(
          (sta: any) => sta.status === "4"
        )
      ) {
        const newProductsList: any[] = [];
        detailData?.data?.data?.quoteProducts.forEach((item: any) => {
          if (item.List_Supplier_Quotes?.length > 0) {
            newProductsList.push({
              id: item.List_Supplier_Quotes[0]?.id,
              productId: item?.Product.id,
            });
          }
          item.List_Supplier_Quotes?.forEach((el: any) => {
            listQuoteProduct.push({
              CPVC: el?.CPVC,
              quoteProductId: el?.id,
              productCode: item.Product.productCode,
              producerName: item.Product.producerInfo?.name,
              productId: item?.Product.id,
              supplierId: el.supplierId,
              priceSale: el.priceSale,
              quantity: el.quantity ? el.quantity : 1,
              unit: el.unit,
              pricePurchase: el.pricePurchase,
              VATSale: el.VATPurchase,
              VATPurchase: el.VATPurchase,
              deliveryTime: el.deliveryTime,
              type: item?.type,
              deliveryTimeCus: "",
              currencySale: el?.currencySale,
              currencyPurchase: el?.currencyPurchase,
              supplierQuoteId: el?.id,
              note: el?.note,
              supplierName: el?.Supplier?.name,
              productName: item?.Product?.productName,
              createdAt: el?.createdAt,
            });
          });
        });
        setProductSelected(newProductsList);
      }
      setProductsData(listQuoteProduct);
      setValue("dataProduct", listQuoteProduct);
    }
  }, [detailData, params.slug[1]]);

  const { fields } = useFieldArray({
    control,
    name: "dataProduct",
  });

  const handleSelectProductRow = (
    id: number,
    productId: number,
    selectedProducts: any[]
  ) => {
    const newArr: any[] = selectedProducts;
    const productIndex = newArr?.findIndex(
      (item: any) => item.productId === productId
    );
    if (productIndex > -1) {
      newArr[productIndex] = { id: id, productId: productId };
    }
    setProductSelected(newArr);
  };

  let count = 1;
  let newIndex = 1;

  const calculatePrice = (
    quantity: number,
    price: number,
    vat: number,
    cpvc: number
  ) => {
    if (quantity >= 0 && price >= 0) {
      return quantity * price;
    }
  };

  const renderProductSupplierRow = (
    item: any,
    index: number,
    productsData: ProductDataType[],
    selectedProducts: any[]
  ) => {
    const newProductId = item.productId;
    if (index > 0 && productsData[index - 1]?.productId !== newProductId) {
      count = count + 1;
      newIndex = 1;
    } else {
      if (index === 0) {
        newIndex = 1;
      } else {
        newIndex = newIndex + 1;
      }
    }

    const selectedProductIndex = selectedProducts?.findIndex(
      (el: any) => el.id === watch(`dataProduct.${index}.quoteProductId`)
    );

    return (
      <div className="flex flex-col">
        {newIndex === 1 && (
          <div className="mt-5">
            <div className="flex w-full">
              <div className="cursor-pointer">
                <AddListProducts
                  onAddProducts={() => { }}
                  productCodes={[]}
                  selectedRows={[]}
                  setSelectedRows={() => { }}
                />
              </div>
              <div className="ml-4 flex flex-col w-full">
                <div className="flex">
                  <div className="flex w-[200px] items-center">
                    <h5 className="mr-1 font-semibold text-[14px]">
                      Mã sản phẩm:
                    </h5>
                    <span className="text-[13px]">{item?.productCode}</span>
                  </div>
                  <div className="flex items-center">
                    <h5 className="mr-1 font-semibold text-[14px]">
                      Nhà sản xuất:
                    </h5>
                    <span className="text-[13px]">{item?.producerName}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-center">
              <div className="w-[27px]"></div>
              <div className="w-[80px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Số lượng</p>
              </div>
              <div className="w-[70px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Đơn vị tính</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Đơn giá</p>
              </div>
              <div className="w-[60px] text-center flex justify-center">
                <p className="text-[14px] font-bold">VAT (%)</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Chi phí vận chuyển</p>
              </div>
              <div className="w-[120px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Thành tiền</p>
              </div>
              <div className="w-[50px] flex justify-center text-center">
                <p className="font-bold text-[14px]">Đơn vị tiền tệ</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Thời gian giao {/*nhận*/} hàng</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Hạn giao hàng</p>
              </div>
              <div className="w-[80px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Ghi chú</p>
              </div>
              <div className="w-[25px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Dự án</p>
              </div>
              <div className="w-[25px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Tiêu hao</p>
              </div>
            </div>
          </div>
        )}
        <div
          key={`${count}.${newIndex}`}
          className={`flex items-start justify-between gap-1 mb-3 ${newIndex > 1 ? "mt-4" : ""
            }`}
        >
          <Button
            variant={selectedProductIndex > -1 ? "default" : "outline"}
            size="sm"
            type="button"
            className="px-[2px] py-[1px] ml-[0px]"
            onClick={() => {
              setValue(
                `dataProduct.${index}.quoteProductId`,
                item.quoteProductId
              );
              handleSelectProductRow(
                item.quoteProductId,
                item.productId,
                selectedProducts
              );
            }}
          >
            <p className="text-[12px] ml-1">{`${count}.${newIndex}`}</p>
          </Button>
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.quantity`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[80px]"
                  type="number"
                  min={0}
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.unit`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[70px]"
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="flex flex-col items-center relative">
              <Controller
                name={`dataProduct.${index}.priceSale`}
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    className="w-[100px]"
                    defaultValue={field.value}
                    {...register(`dataProduct.${index}.priceSale`, {
                      required: selectedProductIndex > -1 ? true : false,
                    })}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.dataProduct && errors.dataProduct[index]?.priceSale && (
                <p className="text-red-500 text-[10px] absolute top-11">
                  Nhập đơn đã
                </p>
              )}
            </div>
            {selectedProductIndex > -1 && (
              <p className="mt-1 text-xs opacity-50">{item?.priceSale}</p>
            )}
          </div>
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.VATSale`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[60px]"
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.CPVC`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[100px]"
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <Input
            className="w-[120px]"
            value={calculatePrice(
              Number(watch(`dataProduct.${index}.quantity`)),
              Number(watch(`dataProduct.${index}.priceSale`)),
              Number(watch(`dataProduct.${index}.VATSale`)),
              Number(watch(`dataProduct.${index}.CPVC`))
            )}
            contentEditable={false}
          />
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.currencySale`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[50px] text-xs"
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.deliveryTime`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[100px]"
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex flex-col items-center relative">
            <Controller
              name={`dataProduct.${index}.deliveryTimeCus`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[100px]"
                  defaultValue={field.value || ""}
                  // {...register(`dataProduct.${index}.deliveryTimeCus`, {
                  //   required: selectedProductIndex > -1 ? true : false,
                  // })}
                  onChange={field.onChange}
                />
              )}
            />
            {/* {errors.dataProduct &&
              errors.dataProduct[index]?.deliveryTimeCus && (
                <p className="text-red-500 text-[10px] absolute top-11">
                  Nhập hạn đã
                </p>
              )} */}
          </div>
          <div className="flex flex-col items-center relative">
            <Controller
              name={`dataProduct.${index}.note`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[80px]"
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="w-[25px] flex justify-center">
            <Controller
              name={`dataProduct.${index}.type`}
              control={control}
              render={({ field, fieldState }) => (
                <Checkbox
                  value={field.value}
                  defaultValue={field.value}
                  defaultChecked={["D", "DT"].includes(
                    getValues(`dataProduct.${index}.type`)
                  )}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      if (watch(`dataProduct.${index}.type`) === "T") {
                        setValue(`dataProduct.${index}.type`, "DT");
                      } else if (watch(`dataProduct.${index}.type`) === "") {
                        setValue(`dataProduct.${index}.type`, "D");
                      }
                      setValue(
                        `dataProduct.${index}.type`,
                        watch(`dataProduct.${index}.type`)
                      );
                    } else {
                      if (watch(`dataProduct.${index}.type`) === "DT") {
                        setValue(`dataProduct.${index}.type`, "T");
                      } else if (watch(`dataProduct.${index}.type`) === "D") {
                        setValue(`dataProduct.${index}.type`, "");
                      }
                      setValue(
                        `dataProduct.${index}.type`,
                        watch(`dataProduct.${index}.type`)
                      );
                    }
                    console.log(
                      "typeProduct",
                      watch(`dataProduct.${index}.type`)
                    );
                  }}
                  id="D"
                />
              )}
            />
          </div>
          <div className="w-[25px] flex justify-center">
            <Controller
              name={`dataProduct.${index}.type`}
              control={control}
              render={({ field, fieldState }) => (
                <Checkbox
                  value={field.value}
                  defaultValue={field.value}
                  defaultChecked={["T", "DT"].includes(
                    getValues(`dataProduct.${index}.type`)
                  )}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      if (watch(`dataProduct.${index}.type`) === "D") {
                        setValue(`dataProduct.${index}.type`, "DT");
                      } else if (watch(`dataProduct.${index}.type`) === "") {
                        setValue(`dataProduct.${index}.type`, "T");
                      }
                      setValue(
                        `dataProduct.${index}.type`,
                        watch(`dataProduct.${index}.type`)
                      );
                    } else {
                      if (watch(`dataProduct.${index}.type`) === "DT") {
                        setValue(`dataProduct.${index}.type`, "D");
                      } else if (watch(`dataProduct.${index}.type`) === "T") {
                        setValue(`dataProduct.${index}.type`, "");
                      }
                      setValue(
                        `dataProduct.${index}.type`,
                        watch(`dataProduct.${index}.type`)
                      );
                    }
                    console.log(
                      "typeProduct",
                      watch(`dataProduct.${index}.type`)
                    );
                  }}
                  id="T"
                />
              )}
            />
          </div>
        </div>
        <div className="flex items-center mb-2">
          <p className="text-red-500 underline text-[14px]">
            Thông tin đầu vào:
          </p>
          <div className="flex ml-4">
            <p className="text-xs">Nhà cung cấp:</p>
            <p className="ml-1 text-xs">{item?.supplierName}</p>
          </div>
          <div className="ml-2 mr-2">-</div>
          <div className="flex">
            <p className="text-xs">Ngày tạo TTHH:</p>
            <p className="ml-1 text-xs">{item?.createdAt}</p>
          </div>
        </div>
        <div className="flex items-start justify-between gap-1 mb-3 ml-8">
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.quantity`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[80px]"
                  type="number"
                  min={0}
                  defaultValue={field.value}
                  onChange={field.onChange}
                  disabled
                />
              )}
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.unit`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[70px]"
                  defaultValue={field.value}
                  onChange={field.onChange}
                  disabled
                />
              )}
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.pricePurchase`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[100px]"
                  value={field.value}
                  contentEditable={false}
                  disabled={true}
                />
              )}
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.VATSale`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[60px]"
                  defaultValue={field.value}
                  onChange={field.onChange}
                  disabled
                />
              )}
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.CPVC`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[100px]"
                  defaultValue={field.value}
                  onChange={field.onChange}
                  disabled
                />
              )}
            />
          </div>
          <Input
            className="w-[120px]"
            value={calculatePrice(
              Number(watch(`dataProduct.${index}.quantity`)),
              Number(watch(`dataProduct.${index}.priceSale`)),
              Number(watch(`dataProduct.${index}.VATSale`)),
              Number(watch(`dataProduct.${index}.CPVC`))
            )}
            contentEditable={false}
            disabled
          />
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.currencyPurchase`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[50px] text-xs"
                  value={field.value}
                  contentEditable={false}
                  disabled={true}
                />
              )}
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <Controller
              name={`dataProduct.${index}.deliveryTime`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[100px]"
                  defaultValue={field.value}
                  onChange={field.onChange}
                  disabled
                />
              )}
            />
          </div>
          <div className="flex flex-col items-center relative">
            <Controller
              name={`dataProduct.${index}.deliveryTimeCus`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[100px]"
                  defaultValue={field.value || ""}
                  // {...register(`dataProduct.${index}.deliveryTimeCus`, {
                  //   required: selectedProductIndex > -1 ? true : false,
                  // })}
                  onChange={field.onChange}
                  disabled
                />
              )}
            />
          </div>
          <div className="flex flex-col items-center relative">
            <Controller
              name={`dataProduct.${index}.note`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[80px]"
                  defaultValue={field.value}
                  onChange={field.onChange}
                  disabled
                />
              )}
            />
          </div>
          <div className="w-[25px] flex justify-center">
            <Controller
              name={`dataProduct.${index}.type`}
              control={control}
              render={({ field, fieldState }) => (
                <Checkbox
                  value={field.value}
                  defaultValue={field.value}
                  checked={["D", "DT"].includes(item?.type)}
                  id="D"
                />
              )}
            />
          </div>
          <div className="w-[25px] flex justify-center">
            <Controller
              name={`dataProduct.${index}.type`}
              control={control}
              render={({ field, fieldState }) => (
                <Checkbox
                  value={field.value}
                  defaultValue={field.value}
                  checked={["T", "DT"].includes(item?.type)}
                  id="T"
                />
              )}
            />
          </div>
        </div>
      </div>
    );
  };

  const handleCancelYCBG = (quoteId: number, reason: string) => {
    mutationCancelYCBG.mutate({ quoteId: quoteId, note: reason });
    setTimeout(() => {
      setOpenReason(false);
    }, 500);
  };

  const onSubmit = (data: any) => {
    data["typeQuotation"] = params.slug[0] === "da" ? "D" : "T";
    data["quoteRequirementId"] = Number(params.slug[1]);
    data["saleId"] = detailData?.data?.data?.saleId;
    data["purchaseId"] = detailData?.data?.data?.purchaseId;
    data["customerId"] = detailData?.data?.data?.customerId;
    data["deliveryAddress"] = detailData?.data?.data.address;
    const newDataProduct: any[] = [];
    productSelected.forEach((item: { id: number }) => {
      const product = data["dataProduct"]?.find(
        (el: ProductDataType) => el.quoteProductId === item.id
      );
      newDataProduct.push(product);
    });
    data["dataProduct"] = newDataProduct;
    if (data["bankAccountId"] > 0) {
      mutationCreateBG.mutate(data);
    } else {
      alert("Bạn cần chọn tài khoản thanh toán!!!");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-2 gap-8">
            <div className="w-full">
              <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
                Thông tin khách hàng:
              </h5>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Tên khách hàng:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.Customer?.customerName}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Số điện thoại:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.Customer?.phoneNumber}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Email:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.Customer?.email}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Địa chỉ nhận hàng:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.address}
                </span>
              </div>
              <>
                <div className="flex justify-between mb-1 w-full">
                  <p className="font-semibold text-[14px]">
                    Địa chỉ khách hàng:
                  </p>
                  <span className="text-[14px]">
                    {detailData?.data?.data?.Customer?.address}
                  </span>
                </div>
                <div className="flex justify-between mb-1 w-full">
                  <p className="font-semibold text-[14px]">Người liên hệ:</p>
                  <Controller
                    name={`userContact`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        className="w-[200px]"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Nhập tên người liên hệ"
                      />
                    )}
                  />
                </div>
              </>
            </div>

            <div className="w-full">
              <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
                Thông tin báo giá:
              </h5>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Số YCBG:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.RFQ}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Ngày tạo YCBG:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.createdAt &&
                    format(detailData?.data?.data?.createdAt, "dd/MM/yyyy")}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Số lần điều chỉnh:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.editNumber}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Sale phụ trách:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.salerInfo?.fullName}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Email:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.salerInfo?.email}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">SĐT:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.salerInfo?.phoneNumber}
                </span>
              </div>
            </div>
          </div>
          <div>
            {fields?.map((item: ProductDataType, index: number) =>
              renderProductSupplierRow(
                item,
                index,
                productsData,
                productSelected
              )
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <h5 className="font-semibold text-[16px] opacity-80 underline">
                Điều khoản
              </h5>
              <div className="flex w-full items-center mb-2">
                <div className="flex items-center w-1/3">
                  <Checkbox id="priceTerm" />
                  <label
                    htmlFor="priceTerm"
                    className="text-sm ml-3 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Giá
                  </label>
                </div>
                <Controller
                  name={`priceTerm`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      className="w-2/3"
                      defaultValue={field.value}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {/* <Input
                        className="w-2/3"
                        value={bodyData["priceTerm"]}
                        onChange={(e) => handleOnchange(e, "priceTerm")}
                      /> */}
              </div>
              <div className="flex w-full items-center mb-2">
                <div className="flex items-center w-1/3">
                  <Checkbox id="qualityTerm" />
                  <label
                    htmlFor="qualityTerm"
                    className="text-sm ml-3 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Chất lượng
                  </label>
                </div>
                <Controller
                  name={`qualityTerm`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      className="w-2/3"
                      // defaultValue={field.value}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {/* <Input
                        className="w-2/3"
                        value={bodyData["qualityTerm"]}
                        onChange={(e) => handleOnchange(e, "qualityTerm")}
                      /> */}
              </div>
              <div className="flex w-full items-center mb-2">
                <div className="flex items-center w-1/3">
                  <Checkbox id="deliveryCondition" />
                  <label
                    htmlFor="deliveryCondition"
                    className="text-sm ml-3 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Điều kiện giao nhận
                  </label>
                </div>
                <Controller
                  name={`deliveryCondition`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      className="w-2/3"
                      // defaultValue={field.value}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {/* <Input
                        className="w-2/3"
                        value={bodyData["deliveryCondition"]}
                        onChange={(e) => handleOnchange(e, "deliveryCondition")}
                      /> */}
              </div>
              <div className="flex w-full items-center mb-2">
                <div className="flex items-center w-1/3">
                  <Checkbox id="executionTime" />
                  <label
                    htmlFor="executionTime"
                    className="text-sm ml-3 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Thời gian thực hiện
                  </label>
                </div>
                <Controller
                  name={`executionTime`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      className="w-2/3"
                      // defaultValue={field.value}
                      placeholder="Không bao gồm ngày nghỉ, lễ, Tết và có thể thay đổi tuỳ theo thời điểm xác nhận đặt hàng"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {/* <Input
                        className="w-2/3"
                        value={bodyData["executionTime"]}
                        onChange={(e) => handleOnchange(e, "executionTime")}
                      /> */}
              </div>
              {/* <span style={{ color: "#EF4444" }} className="italic text-sm">
                * không bao gồm ngày nghỉ, lễ, Tết và có thể thay đổi tuỳ theo
                thời điểm xác nhận đặt hàng
              </span> */}
              <div className="flex w-full items-center mb-2">
                <div className="flex items-center w-1/3">
                  <Checkbox id="warrantyCondition" />
                  <label
                    htmlFor="warrantyCondition"
                    className="text-sm ml-3 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Điều kiện bảo hành
                  </label>
                </div>
                <Controller
                  name={`warrantyCondition`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      className="w-2/3"
                      // defaultValue={field.value}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {/* <Input
                        className="w-2/3"
                        value={bodyData["warrantyCondition"]}
                        onChange={(e) => handleOnchange(e, "warrantyCondition")}
                      /> */}
              </div>
              <div className="flex w-full items-center mb-2">
                <div className="flex items-center w-1/3">
                  <Checkbox id="TOP" />
                  <label
                    htmlFor="TOP"
                    className="text-sm ml-3 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Điều kiện thanh toán
                  </label>
                </div>
                <Controller
                  name={`TOP`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      className="w-2/3"
                      // defaultValue={field.value}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {/* <Input
                        className="w-2/3"
                        value={bodyData["TOP"]}
                        onChange={(e) => handleOnchange(e, "TOP")}
                      /> */}
              </div>
              <div className="flex w-full items-center mb-2">
                <div className="flex items-center w-1/3">
                  <Checkbox id="paymentBy" />
                  <label
                    htmlFor="paymentBy"
                    className="text-sm ml-3 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Hình thức thanh toán
                  </label>
                </div>
                {/* <Controller
                  name={`paymentBy`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      className="w-2/3"
                      // defaultValue={field.value}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                /> */}
                <span className="text-[14px]">
                  Bằng tiền mặt hoặc chuyển khoản qua TKNH
                </span>
                {/* <Input
                        className="w-2/3"
                        value={bodyData["paymentBy"]}
                        onChange={(e) => handleOnchange(e, "paymentBy")}
                      /> */}
              </div>
              <div className="flex w-full items-center mb-2">
                <div className="flex items-center w-1/3">
                  <Checkbox id="validityQuote" />
                  <label
                    htmlFor="validityQuote"
                    className="text-sm ml-3 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Hiệu lực báo giá
                  </label>
                </div>
                <Controller
                  name={`validityQuote`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      className="w-2/3"
                      // defaultValue={field.value}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {/* <Input
                        className="w-2/3"
                        value={bodyData["validityQuote"]}
                        onChange={(e) => handleOnchange(e, "validityQuote")}
                      /> */}
              </div>
            </div>
            <div className="w-full">
              <h5 className="mb-3 font-semibold text-[16px] opacity-80 underline">
                Thông tin thanh toán
              </h5>
              <SelectComponent
                key="id"
                label=""
                placeholder="Chọn tài khoản thanh toán"
                data={bankAccount?.data?.map((item: any) => ({
                  value: item.id,
                  nameAccount: item.nameBank + " (" + item.numberAccount + ")",
                }))}
                value={bodyData["bankAccountId"]}
                setValue={(val: number) => {
                  setValue("bankAccountId", val);
                  setBodyData((prevState: any) => ({
                    ...prevState,
                    bankAccountId: val,
                  }));
                  setAccountInfo(
                    bankAccount?.data?.find((ele: any) => ele.id === val)
                  );
                }}
                displayProps="nameAccount"
              />
              <div
                style={{ background: "#D9D9D9", borderRadius: "4px" }}
                className="w-full h-[300px] mt-4 flex flex-col justify-center px-8 py-5 items-center"
              >
                {bodyData["bankAccountId"] > 0 ? (
                  <div className="w-full h-1/3 flex flex-col justify-between">
                    <div className="flex w-full justify-between items-center">
                      <p>Tên tài khoản</p>
                      <h5 className="font-bold">{accountInfo?.nameAccount}</h5>
                    </div>
                    <div className="flex w-full justify-between items-center">
                      <p>Số tài khoản</p>
                      <h5 className="font-bold">
                        {accountInfo?.numberAccount}
                      </h5>
                    </div>
                    <div className="flex w-full justify-between items-center">
                      <p>Ngân hàng</p>
                      <h5 className="font-bold">
                        {accountInfo?.nameBank} - Chi nhánh{" "}
                        {accountInfo?.branch}
                      </h5>
                    </div>
                  </div>
                ) : (
                  <h5>Thông tin tài khoản sẽ hiển thị ở đây</h5>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between w-full">
          <div>
            <Button
              onClick={() => {
                setOpenReason(true);
              }}
              type="button"
              variant="destructive"
            >
              Huỷ báo giá
            </Button>
          </div>
          <div>
            <Button
              onClick={() => router.back()}
              type="button"
              variant="secondary"
            >
              Thoát
            </Button>
            {mutationCreateBG.isPending ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Xin chờ
              </Button>
            ) : (
              <Button className="ml-2" variant="default" type="submit">
                Gửi báo giá
              </Button>
            )}
          </div>
        </div>
      </form>
      <CancelForm
        value={reason}
        setValue={setReason}
        open={openReason}
        setOpen={setOpenReason}
        title="Lí do từ chối"
        description="Lí do"
        loading={mutationCancelYCBG.isPending}
        handleCancel={() => handleCancelYCBG(Number(params.slug[1]), reason)}
      />
    </>
  );
}
