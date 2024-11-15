import {
  cancelYCBG,
  createQuote,
  getDetailQuotationRequest,
  purchaseConfirm,
} from "@/api/quotations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import AddListProducts from "./AddListProductsQuote";
import { Input } from "@/components/ui/input";
import { CancelForm } from "./CancelForm";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import SelectComponent from "@/components/Select";
import { getBankAccount } from "@/api/payment";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import MultiSelect from "@/components/multiSelect/MultiSelect";
import { getSupplierList } from "@/api/supply";

type YCBGDetailsProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  id: number;
  setOpen: (value: boolean) => void;
  refetchData: any;
  statusKey: string;
  statusQuote?: number;
  statusTimelineId?: number;
};

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
  deliveryTime: number;
  type: string;
  quoteProductId: number;
  CPVC: number;
}

interface ProductReceiveDataType {
  productCode: string;
  itemCode: string;
  producerName: string;
  productId: number;
  supplierId: any[];
  quantity: number;
  unit: string;
  note: string;
  consultationCode: string;
  describe: string;
  file: string;
  refuse: boolean;
  reason: string;
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

export default function YCBGDetails(props: YCBGDetailsProps) {
  const {
    isDialogOpen,
    setIsDialogOpen,
    id,
    setOpen,
    refetchData,
    statusKey,
    statusQuote,
    statusTimelineId,
  } = props;
  const [reason, setReason] = useState<string>("");
  const [reasonArr, setReasonArr] = useState<{ id: number; refuse: boolean }[]>(
    []
  );
  const [openReason, setOpenReason] = useState<boolean>(false);
  const [productId, setProductId] = useState<number>();
  const [productIndex, setProductIndex] = useState<number>(0);
  const [supplierListData, setSupplierListData] = useState([]);
  const [productSelected, setProductSelected] = useState<
    { id: number; productId: number }[]
  >([]);
  const [keyAction, setKeyAction] = useState<string>("ConfirmPurchase");
  const [bodyData, setBodyData] = useState<any>(initialState);
  const [productsData, setProductsData] = useState<ProductDataType[]>([]);
  const [productsReceiveData, setProductsReceiveData] = useState<
    ProductReceiveDataType[]
  >([]);
  const [selectedQuote, setSelectedQuote] = useState<number[]>([]);
  const [accountInfo, setAccountInfo] = useState<any>();
  const queryClient = useQueryClient();
  const { data: detailData, refetch } = useQuery({
    queryKey: ["detailRequest", id],
    queryFn: () => getDetailQuotationRequest(id),
    enabled: id ? true : false,
  });
  const { data: bankAccount } = useQuery({
    queryKey: ["bankAccount"],
    queryFn: () => getBankAccount(),
  });
  const {
    data: supplierList,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["supplierList"],
    queryFn: () =>
      getSupplierList({
        page: 0,
        pageSize: 100,
        keySearch: "",
      }),
  });
  const mutationCancel = useMutation({
    mutationFn: purchaseConfirm,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["purchaseConfirm"],
      });
      refetch();
      toast({
        title: "Thành công",
        description: "Thao tác thành công",
      });
    },
    onError: (error: any) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: error.response.data.message,
      });
    },
  });
  const mutationCancelYCBG = useMutation({
    mutationFn: cancelYCBG,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cancelYCBG"],
      });
      refetch();
      toast({
        title: "Thành công",
        description: "Thao tác thành công",
      });
    },
    onError: (error) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: "Thao tác thất bại",
      });
    },
  });
  const mutationCreateBG = useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["createQuote"],
      });
      refetch();
      toast({
        title: "Thành công",
        description: "Tạo báo giá thành công",
      });
    },
    onError: (error) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: "Tạo báo giá thất bại",
      });
    },
  });
  const calculateTime = (startDate: string, endDate: string) => {
    const start_date = new Date(startDate).getTime();
    const end_date = new Date(endDate).getTime();
    var differenceInHoursValue = end_date - start_date;
    if (differenceInHoursValue > 0) {
      const days = Math.floor(differenceInHoursValue / 1000 / 60 / 60 / 24);
      differenceInHoursValue -= days * 1000 * 60 * 60 * 24;
      const hours = Math.floor(differenceInHoursValue / 1000 / 60 / 60);
      return `Còn ${days} ngày ${hours} giờ`;
    } else {
      return "Hết hạn";
    }
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
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
      dataProductReceive: productsReceiveData,
    },
  });

  useEffect(() => {
    if (supplierList && !supplierList?.data?.results?.find((item: any) => item.id === null)) {
      supplierList?.data?.results.push({
        id: null,
        name: "Chưa xác định",
      });
      setSupplierListData(supplierList?.data?.results);
    }
  }, [supplierList]);
  useEffect(() => {
    if (openReason === false) {
      //setReason("");
      setKeyAction("");
      setProductIndex(0);
    }
  }, [openReason]);

  useEffect(() => {
    if (detailData) {
      const newArr: any[] = [];
      detailData?.data?.data?.quoteProducts.forEach((item: { id: number }) => {
        newArr.push({ id: item?.id, refuse: false });
      });
      setReasonArr(newArr);
      const listQuoteProduct: ProductDataType[] = [];
      const listReceiveProduct: ProductReceiveDataType[] = [];
      if (statusTimelineId === 1) {
        detailData?.data?.data?.quoteProducts.forEach((item: any) => {
          const newItem = {
            productCode: item?.Product?.productCode,
            itemCode: item?.itemCode,
            producerName: item?.Product?.producerInfo?.name,
            productId: item?.id,
            supplierId: [],
            quantity: item?.quantity,
            unit: item?.unit,
            note: item?.note,
            consultationCode: item?.consultationCode,
            describe: item?.Product?.describe,
            file: item?.file,
            refuse: false,
            reason: "",
          };
          listReceiveProduct.push(newItem);
        });
      } else if (statusTimelineId === 3) {
        const newDetailDataQuote =
          detailData?.data?.data?.quoteProducts?.filter(
            (item: { refuse: boolean; reason: string }) =>
              !item.refuse && item.reason
          );
        newDetailDataQuote.forEach((item: any) => {
          const newItem = {
            productCode: item?.Product?.productCode,
            itemCode: item?.itemCode,
            producerName: item?.Product?.producerInfo?.name,
            productId: item?.id,
            supplierId: [],
            quantity: item?.quantity,
            unit: item?.unit,
            note: item?.note,
            consultationCode: item?.consultationCode,
            describe: item?.Product?.describe,
            file: item?.file,
            refuse: false,
            reason: "",
          };
          listReceiveProduct.push(newItem);
        });
      }
      if (detailData?.data?.data?.statusQuote === 4) {
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
              CPVC: 0,
              quoteProductId: el?.id,
              productCode: item.Product.productCode,
              producerName: item.Product.producerInfo?.name,
              productId: item?.Product.id,
              supplierId: el.supplierId,
              priceSale: el.priceSale,
              quantity: el.quantity,
              unit: el.unit,
              pricePurchase: el.pricePurchase,
              VATSale: el.VATSale,
              VATPurchase: el.VATPurchase,
              deliveryTime: el.deliveryTime,
              type: "",
            });
          });
        });
        setProductSelected(newProductsList);
      }
      setProductsData(listQuoteProduct);
      setProductsReceiveData(listReceiveProduct);
      setValue("dataProduct", listQuoteProduct);
      setValue("dataProductReceive", listReceiveProduct);
    }
  }, [detailData, statusTimelineId]);

  const { fields } = useFieldArray({
    control,
    name: "dataProduct",
  });

  const { fields: fieldsReceive } = useFieldArray({
    control,
    name: "dataProductReceive",
  });

  const handleCancelSubmit = (reason: string, index: number) => {
    if (reason) {
      setValue(`dataProductReceive.${index}.reason`, reason);
      setValue(`dataProductReceive.${index}.refuse`, true);
      setOpenReason(false);
    } else {
      toast({
        title: "Thất bại",
        description: "Bạn cần nhập lí do trước khi từ chối sản phẩm này !!!",
      });
    }
  };
  const handleConfirmSubmit = (data: any) => {
    const newData = data?.dataProductReceive?.map(
      (item: ProductReceiveDataType) => {
        return item?.refuse
          ? {
            id: item?.productId,
            refuse: item?.refuse,
            reason: item?.reason,
            supplierId:
              item?.supplierId?.length > 0 ? item?.supplierId : [null],
          }
          : {
            id: item?.productId,
            refuse: item?.refuse,
            supplierId:
              item?.supplierId?.length > 0 ? item?.supplierId : [null],
          };
      }
    );
    mutationCancel.mutate({ id: id, data: newData });
    setTimeout(() => {
      setIsDialogOpen(false);
      setOpen(false);
      refetchData();
    }, 500);
  };
  const handleCancelYCBG = (quoteId: number, reason: string) => {
    mutationCancelYCBG.mutate({ quoteId: quoteId, note: reason });
    setTimeout(() => {
      setIsDialogOpen(false);
      setOpen(false);
      refetchData();
    }, 500);
  };

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

  const renderProductRow = (item: any, reasonArr: any, index: number) => {
    const newReasonArr: any[] = reasonArr;
    return (
      <div
        key={item.id}
        className="flex items-center justify-between gap-1 mb-2"
      >
        <p
          onClick={() => {
            setProductIndex(index);
            if (watch(`dataProductReceive.${index}.refuse`)) {
              setValue(`dataProductReceive.${index}.refuse`, false);
            } else {
              setOpenReason(true);
            }
          }}
          className="underline cursor-pointer text-red-500 text-[12px] ml-[0px] w-[45px]"
        >
          {watch(`dataProductReceive.${index}.refuse`) ? "Đồng ý" : "Từ chối"}
        </p>
        <Input
          className="w-[100px]"
          value={item?.productCode}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          value={item?.consultationCode}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          value={item?.itemCode}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          value={item?.describe}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          value={item?.quantity}
          contentEditable={false}
          disabled={true}
          type="number"
        />
        <Input
          className="w-[100px]"
          value={item?.unit}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className={`w-[100px]`}
          value={item?.producerName}
          contentEditable={false}
          disabled={true}
        />
        <Controller
          name={`dataProductReceive.${index}.supplierId`}
          control={control}
          render={({ field, fieldState }) => (
            <MultiSelect
              options={supplierList?.data?.results.map((ele: any) => {
                return {
                  value: ele.id,
                  label: ele["name"],
                };
              })}
              selected={field.value}
              onChange={(valueArr: any) => {
                setValue(`dataProductReceive.${index}.supplierId`, valueArr);
              }}
              width={200}
              placeholder={"Chọn nhà cung cấp"}
              title={"Chọn nhà cung cấp"}
            />
          )}
        />
        <Input
          className={`w-[100px]`}
          value={item?.note}
          contentEditable={false}
          disabled={true}
        />
        <Button
          onClick={() => window.open(item?.file, "_blank")}
          type="button"
          disabled={!item?.file}
          variant={"outline"}
        >
          Xem file
        </Button>
      </div>
    );
  };

  let count = 1;
  let newIndex = 1;

  const calculatePrice = (
    quantity: number,
    price: number,
    vat: number,
    cpvc: number
  ) => {
    if (quantity && price && vat && cpvc) {
      return quantity * price * (100 + vat) + cpvc;
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
    return (
      <div
        key={`${count}.${newIndex}`}
        className="flex items-center justify-between gap-1 mb-2"
      >
        <Button
          variant={
            selectedProducts?.findIndex(
              (el: any) =>
                el.id === watch(`dataProduct.${index}.quoteProductId`)
            ) > -1
              ? "default"
              : "outline"
          }
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
        <Input
          className="w-[100px]"
          value={newIndex === 1 ? item?.productCode : ""}
          contentEditable={false}
        />
        <Input
          className="w-[100px]"
          value={newIndex === 1 ? item?.producerName : ""}
          contentEditable={false}
        />
        <Controller
          name={`dataProduct.${index}.quantity`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              className="w-[100px]"
              type="number"
              defaultValue={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name={`dataProduct.${index}.unit`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              className="w-[100px]"
              defaultValue={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name={`dataProduct.${index}.priceSale`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              className="w-[100px]"
              defaultValue={field.value}
              onChange={(e) => {
                setValue(
                  `dataProduct.${index}.priceSale`,
                  Number(e.target.value)
                );
                setValue(
                  `dataProduct.${index}.pricePurchase`,
                  Number(e.target.value)
                );
              }}
            />
          )}
        />
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
        <Input
          className="w-[100px]"
          value={calculatePrice(
            Number(watch(`dataProduct.${index}.quantity`)),
            Number(watch(`dataProduct.${index}.priceSale`)),
            Number(watch(`dataProduct.${index}.VATSale`)),
            Number(watch(`dataProduct.${index}.CPVC`))
          )}
          contentEditable={false}
        />
        <Controller
          name={`dataProduct.${index}.deliveryTime`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              className="w-[50px]"
              defaultValue={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name={`dataProduct.${index}.type`}
          control={control}
          render={({ field, fieldState }) => (
            <Checkbox
              value={"D"}
              onCheckedChange={(checked: boolean) => {
                if (checked) {
                  if (getValues(`dataProduct.${index}.type`) === "T") {
                    setValue(`dataProduct.${index}.type`, "DT");
                  } else {
                    setValue(`dataProduct.${index}.type`, "D");
                  }
                } else {
                  if (getValues(`dataProduct.${index}.type`) === "DT") {
                    setValue(`dataProduct.${index}.type`, "T");
                  } else {
                    setValue(`dataProduct.${index}.type`, "");
                  }
                }
              }}
              id="D"
            />
          )}
        />
        <Controller
          name={`dataProduct.${index}.type`}
          control={control}
          render={({ field, fieldState }) => (
            <Checkbox
              value={"T"}
              onCheckedChange={(checked: boolean) => {
                if (checked) {
                  if (getValues(`dataProduct.${index}.type`) === "D") {
                    setValue(`dataProduct.${index}.type`, "DT");
                  } else {
                    setValue(`dataProduct.${index}.type`, "T");
                  }
                } else {
                  if (getValues(`dataProduct.${index}.type`) === "DT") {
                    setValue(`dataProduct.${index}.type`, "D");
                  } else {
                    setValue(`dataProduct.${index}.type`, "");
                  }
                }
              }}
              id="T"
            />
          )}
        />
      </div>
    );
  };

  const onSubmit = (data: any) => {
    data["typeQuotation"] = statusKey;
    data["quoteRequirementId"] = id;
    data["saleId"] = detailData?.data?.data?.saleId;
    data["purchaseId"] = detailData?.data?.data?.purchaseId;
    data["customerId"] = detailData?.data?.data?.customerId;
    const newDataProduct: any[] = [];
    productSelected.forEach((item: { id: number }) => {
      const product = data["dataProduct"]?.find(
        (el: ProductDataType) => el.quoteProductId === item.id
      );
      newDataProduct.push(product);
    });
    data["dataProduct"] = newDataProduct;
    mutationCreateBG.mutate(data);
    setTimeout(() => {
      setIsDialogOpen(false);
      setOpen(false);
      refetchData();
    }, 500);
  };

  const checkDisableButton = (
    statusQuote: number | undefined,
    statusId: number | undefined
  ) => {
    if (statusQuote && statusId) {
      if (statusQuote === 1) {
        return false;
      } else {
        if (statusId === 3) return false;
        else return true;
      }
    } else {
      return false;
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[800px] sm:max-h-[700px] lg:max-h-[800px] lg:max-w-[1224px]">
        <DialogHeader>
          <DialogTitle>
            {statusKey === "Receive" ? "Yêu cầu báo giá" : "Tạo báo giá"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="h-[480px] overflow-y-auto overflow-x-hidden">
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
                {/* <div className="flex justify-between mb-1 w-full">
                  <p className="font-semibold text-[14px]">Số điện thoại:</p>
                  <span className="text-[14px]">
                    {detailData?.data?.data?.Customer?.phoneNumber}
                  </span>
                </div> */}
                <div className="flex justify-between mb-1 w-full">
                  <p className="font-semibold text-[14px]">Email:</p>
                  <span className="text-[14px]">
                    {detailData?.data?.data?.Customer?.email}
                  </span>
                </div>
                <div className="flex justify-between mb-1 w-full">
                  <p className="font-semibold text-[14px]">
                    Địa chỉ nhận hàng:
                  </p>
                  <span className="text-[14px]">
                    {detailData?.data?.data?.address}
                  </span>
                </div>
                <div className="flex justify-between mb-1 w-full">
                  <p className="font-semibold text-[14px]">End-User:</p>
                  <span className="text-[14px]">
                    {detailData?.data?.data?.endUser}
                  </span>
                </div>
                {statusKey === "Receive" ? (
                  detailData?.data?.data?.file ? (
                    <Button
                      onClick={() =>
                        window.open(detailData?.data?.data?.file, "_blank")
                      }
                      type="button"
                      variant={"outline"}
                      className="mt-4"
                    >
                      Xem tệp đính kèm
                    </Button>
                  ) : (
                    ""
                  )
                ) : (
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
                      <p className="font-semibold text-[14px]">
                        Người liên hệ:
                      </p>
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
                      {/* <Input
                      className="w-[140px]"
                      value={bodyData["userContact"]}
                      onChange={(e) =>
                        setBodyData({
                          ...bodyData,
                          ["userContact"]: e.target.value,
                        })
                      }
                    /> */}
                    </div>
                  </>
                )}
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
                  <p className="font-semibold text-[14px]">
                    Số lần điều chỉnh:
                  </p>
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
                {/* <div className="flex justify-between mb-1 w-full">
                  <p className="font-semibold text-[14px]">SĐT:</p>
                  <span className="text-[14px]">
                    {detailData?.data?.data?.salerInfo?.phoneNumber}
                  </span>
                </div> */}
                {statusKey === "Receive" && (
                  <div className="grid grid-cols-2   gap-6">
                    {/*<div className="w-full flex flex-col justify-center">
                      <p className="font-semibold text-[14px]">
                        Thời gian báo giá:
                      </p>
                      <div className="flex justify-between w-full items-center">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="text-[14px]">
                          {detailData?.data?.data?.durationQuoteForCustomer &&
                            format(
                              detailData?.data?.data?.durationQuoteForCustomer,
                              "dd/MM/yyyy kk:mm"
                            )}
                        </span>
                      </div>
                    </div>*/}
                    <div className="">
                      <p className="font-semibold text-[14px]">
                        Thời gian phản hồi:
                      </p>
                      <div className="flex w-full items-center">
                        <CalendarIcon className=" h-4 w-4" />
                        <span className="text-[14px] ml-2">
                          {detailData?.data?.data?.durationFeedback &&
                            format(
                              detailData?.data?.data?.durationFeedback,
                              "dd/MM/yyyy kk:mm"
                            )}
                        </span>
                      </div>
                    </div>
                    <div className="">
                      <p className="font-semibold text-[14px]">
                        Thời gian còn lại:
                      </p>
                      <div className="flex w-full items-center">
                        <CalendarIcon className=" h-4 w-4" />
                        <span className="text-[14px] ml-2">
                          {calculateTime(
                            new Date().toISOString(),
                            detailData?.data?.data?.durationFeedback
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-center mt-3">
                <div className="cursor-pointer w-[45px]">
                  {/* <AddListProducts
                    onAddProducts={() => { }}
                    productCodes={[]}
                    selectedRows={[]}
                    setSelectedRows={() => { }}
                  /> */}
                </div>
                <div className="w-[100px] flex text-center justify-center">
                  <p className="text-[14px]">Mã sản phẩm</p>
                </div>
                {statusKey === "Receive" ? (
                  <>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Mã tham vấn KH</p>
                    </div>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Mã vật tư KH</p>
                    </div>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Mô tả</p>
                    </div>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Số lượng yêu cầu</p>
                    </div>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Đơn vị tính</p>
                    </div>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Nhà sản xuất</p>
                    </div>
                    <div className="w-[200px] text-center flex justify-center">
                      <p className="text-[14px]">Nhà cung cấp</p>
                    </div>
                    <div className="w-[100px] text-center flex justify-center">
                      <p className="text-[14px]">Ghi chú</p>
                    </div>
                    <div className="w-[85px]"></div>
                  </>
                ) : (
                  <>
                    <p className="w-[120px] text-[14px] translate-x-3">
                      Nhà sản xuất
                    </p>
                    <p className="w-[100px] text-[14px] translate-x-3">
                      Số lượng
                    </p>
                    <p className="w-[100px] text-[14px] translate-x-3">
                      Đơn vị tính
                    </p>
                    <p className="w-[130px] text-[14px] translate-x-3">
                      Đơn giá
                    </p>
                    <p className="w-[100px] text-[14px] translate-x-[-10px]">
                      VAT (%)
                    </p>
                    <p className="w-[70px] text-[14px] translate-x-[-15px]">
                      Chi phí vận chuyển
                    </p>
                    <p className="w-[150px] text-[14px] ml-[-40px] translate-x-4">
                      Thành tiền
                    </p>
                    <p className="w-[70px] text-[14px] translate-x-[-5px]">
                      Thời gian giao hàng
                    </p>
                    <p className="w-[20px] text-[14px] translate-x-[-5px]">
                      Dự án
                    </p>
                    <p className="w-[20px] text-[14px] translate-x-[-5px]">
                      Tiêu hao
                    </p>
                  </>
                )}
              </div>
              {statusKey !== "Receive"
                ? fields?.map((item: ProductDataType, index: number) =>
                  renderProductSupplierRow(
                    item,
                    index,
                    productsData,
                    productSelected
                  )
                )
                : fieldsReceive?.map((item: any, index: number) =>
                  renderProductRow(item, reasonArr, index)
                )}
            </div>
            {statusKey !== "Receive" && (
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
                  <span style={{ color: "#EF4444" }} className="italic text-sm">
                    * không bao gồm ngày nghỉ, lễ, Tết và có thể thay đổi tuỳ
                    theo thời điểm xác nhận đặt hàng
                  </span>
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
                    <Controller
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
                    />
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
                      nameAccount: item.nameAccount,
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
                          <h5 className="font-bold">
                            {accountInfo?.nameAccount}
                          </h5>
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
            )}
          </div>
          <div className="mt-4 flex justify-between w-full">
            <div>
              <Button
                onClick={() => {
                  setOpenReason(true);
                  setKeyAction("CancelYCBG");
                }}
                type="button"
                variant="destructive"
              >
                {statusKey === "Receive" ? "Hủy YCBG" : "Huỷ báo giá"}
              </Button>
            </div>
            <div>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Thoát
                </Button>
              </DialogClose>
              {mutationCancel.isPending || mutationCreateBG.isPending ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Xin chờ
                </Button>
              ) : statusKey === "Receive" ? (
                <Button
                  onClick={handleSubmit(handleConfirmSubmit)}
                  className="ml-2"
                  variant="default"
                  type="button"
                  disabled={checkDisableButton(statusQuote, statusTimelineId)}
                >
                  Nhận YCBG
                </Button>
              ) : (
                <Button className="ml-2" variant="default" type="submit">
                  Gửi báo giá
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
      <CancelForm
        value={reason}
        setValue={setReason}
        open={openReason}
        setOpen={setOpenReason}
        title="Lí do từ chối"
        description="Lí do"
        loading={
          keyAction === "CancelYCBG"
            ? mutationCancelYCBG.isPending
            : mutationCancel.isPending
        }
        handleCancel={() =>
          keyAction === "CancelYCBG"
            ? handleCancelYCBG(id, reason)
            : handleCancelSubmit(reason, productIndex)
        }
      />
    </Dialog>
  );
}
