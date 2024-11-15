"use client";
import {
  cancelYCBG,
  createGoodsInfo,
  createQuote,
  getDetailQuotationRequest,
} from "@/api/quotations";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import AddListProducts from "@/View/admin/customers/components/AddListProductsQuote";
import { MdDelete } from "react-icons/md";
import AddListProductsSupplier from "./AddListProductsSupplier";
import { Checkbox } from "@/components/ui/checkbox";
import { CancelForm } from "@/View/admin/customers/components/CancelForm";

interface ProductDataType {
  productCode: string;
  producerName: string;
  productId: number;
  supplierId: number;
  quantity: number;
  unit: string;
  pricePurchase: number;
  VATPurchase: number;
  deliveryTime: string;
  note: string;
  supplier: string;
  CPVC: number;
  hasFile: number;
  images: any;
  quoteProductId: number;
  describe: string;
  currencyPurchase: string;
}

export default function CreateGoods() {
  const [productId, setProductId] = useState<number>(0);
  const [productIdArr, setProductIdArr] = useState<number[]>([]);
  const [openReason, setOpenReason] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [productSelected, setProductSelected] = useState<
    { id: number; productId: number }[]
  >([]);
  const [keyAction, setKeyAction] = useState<string>("ConfirmPurchase");
  const [productsData, setProductsData] = useState<ProductDataType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [supplierSelected, setSupplierSelected] = useState<number[]>([]);
  const [accountInfo, setAccountInfo] = useState<any>();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { data: detailData, refetch } = useQuery({
    queryKey: ["detailRequest", params?.id],
    queryFn: () => getDetailQuotationRequest(Number(params?.id)),
    enabled: params?.id ? true : false,
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
      dataProduct: productsData,
    },
  });

  useEffect(() => {
    if (detailData && params?.id) {
      const listQuoteProduct: ProductDataType[] = [];
      detailData?.data?.data?.quoteProducts.forEach((item: any) => {
        !item?.refuse &&
          listQuoteProduct.push({
            quoteProductId: item.id,
            CPVC: 0,
            productCode: item.Product.productCode,
            producerName: item.Product.producerInfo?.name,
            productId: item?.Product.id,
            supplierId: 0,
            quantity: item?.quantity,
            unit: item?.unit,
            pricePurchase: 0,
            VATPurchase: 0,
            deliveryTime: "1 ngày",
            note: item?.note,
            supplier: "",
            hasFile: 0,
            images: undefined,
            describe: item?.Product?.describe,
            currencyPurchase: "VND",
          });
      });
      setProductsData(listQuoteProduct);
      setValue("dataProduct", listQuoteProduct);
    }
  }, [detailData, params?.id]);

  const { fields, remove } = useFieldArray({
    control,
    name: "dataProduct",
  });

  let count = 1;
  let newIndex = 1;

  const calculatePrice = (
    quantity: number,
    price: number,
    vat: number,
    cpvc: number
  ) => {
    if (quantity >= 0 && price >= 0 && vat >= 0 && cpvc >= 0) {
      return (quantity * price * (100 + vat)) / 100 + cpvc;
    }
  };

  const handleCancelYCBG = (quoteId: number, reason: string) => {
    mutationCancelYCBG.mutate({ quoteId: quoteId, note: reason });
    setTimeout(() => {
      router.back();
    }, 500);
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
      <div className="flex flex-col">
        {newIndex === 1 && (
          <>
            <div className="flex w-full">
              <MdDelete
                onClick={() => {
                  const newFields = fields.filter(
                    (fieldItem: ProductDataType) => {
                      if (
                        fieldItem.productId === item.productId &&
                        fieldItem.supplierId
                      ) {
                        return false;
                      } else {
                        return true;
                      }
                    }
                  );
                  setProductsData(newFields);
                  setValue("dataProduct", newFields);
                }}
                className="cursor-pointer ml-[-9px] translate-x-2"
                color="red"
                size={18}
              />
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
                <div className="mt-2 flex items-start">
                  {/* <div className="flex w-[200px] items-center">
                    <h5 className="mr-1 font-semibold text-[14px]">
                      Đơn vị tính:
                    </h5>
                    <span className="text-[13px]">{item?.unit}</span>
                  </div> */}
                  <div className="flex items-start">
                    <h5 className="mr-1 font-semibold text-[14px]">Mô tả:</h5>
                    <div className="w-[600px] translate-y-[-2px]">
                      <span className="text-[13px]">{item?.describe}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-center mt-3">
              <div className="w-[150px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Nhà cung cấp</p>
              </div>
              <div className="w-[80px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Số lượng</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Đơn vị</p>
              </div>
              <div className="w-[80px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Đơn giá</p>
              </div>
              <div className="w-[150px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Thành tiền</p>
              </div>
              <div className="w-[70px] text-center flex justify-center">
                <p className="text-[14px] font-bold">VAT (%)</p>
              </div>
              <div className="w-[120px] text-center flex justify-center">
                <p className="text-[14px] font-bold">{`CPVC(nếu có)`}</p>
              </div>
              <div className="w-[50px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Tiền tệ</p>
              </div>
              <div className="w-[120px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Thời gian nhận hàng</p>
              </div>
              <div className="w-[200px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Ghi chú</p>
              </div>
              <div className="w-[80px] text-center flex justify-center">
                <p className="text-[14px] font-bold">Hình ảnh</p>
              </div>
              <div className="w-[30px]"></div>
            </div>
          </>
        )}
        {newIndex > 1 && (
          <div className="flex justify-between items-center mt-1">
            <Input
              className="w-[150px] text-xs"
              value={item?.supplier}
              contentEditable={false}
              disabled={true}
            />
            <Controller
              name={`dataProduct.${index}.quantity`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[80px] text-xs"
                  type="number"
                  min={1}
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
                  className="w-[100px] text-xs"
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="flex flex-col items-center relative">
              <Controller
                name={`dataProduct.${index}.pricePurchase`}
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    className="w-[80px] text-xs"
                    defaultValue={field.value}
                    {...register(`dataProduct.${index}.pricePurchase`, {
                      required: true,
                      min: 1,
                    })}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.dataProduct &&
                errors.dataProduct[index]?.pricePurchase && (
                  <p className="text-red-500 text-[10px] absolute top-11">
                    Nhập giá đã
                  </p>
                )}
            </div>
            <Input
              className="w-[150px] text-xs"
              value={calculatePrice(
                Number(watch(`dataProduct.${index}.quantity`)),
                Number(watch(`dataProduct.${index}.pricePurchase`)),
                Number(watch(`dataProduct.${index}.VATPurchase`)),
                Number(watch(`dataProduct.${index}.CPVC`))
              )}
              contentEditable={false}
            />
            <div className="flex flex-col items-center relative">
              <Controller
                name={`dataProduct.${index}.VATPurchase`}
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    className="w-[70px] text-xs"
                    defaultValue={field.value}
                    {...register(`dataProduct.${index}.VATPurchase`, {
                      required: true,
                      min: 0,
                    })}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.dataProduct && errors.dataProduct[index]?.VATPurchase && (
                <p className="text-red-500 text-[10px] absolute top-11">
                  Nhập VAT đã
                </p>
              )}
            </div>
            <div className="flex flex-col items-center relative">
              <Controller
                name={`dataProduct.${index}.CPVC`}
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    className="w-[120px] text-xs"
                    defaultValue={field.value}
                    {...register(`dataProduct.${index}.CPVC`, {
                      required: true,
                      min: 0,
                    })}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.dataProduct && errors.dataProduct[index]?.CPVC && (
                <p className="text-red-500 text-[10px] absolute top-11">
                  Nhập CPVC đã
                </p>
              )}
            </div>
            <Controller
              name={`dataProduct.${index}.currencyPurchase`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[50px] text-xs"
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="flex flex-col items-center relative">
              <Controller
                name={`dataProduct.${index}.deliveryTime`}
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    className="w-[120px] text-xs"
                    defaultValue={field.value}
                    {...register(`dataProduct.${index}.deliveryTime`, {
                      required: true,
                    })}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.dataProduct &&
                errors.dataProduct[index]?.deliveryTime && (
                  <p className="text-red-500 text-[10px] absolute top-11">
                    Nhập thời gian đã
                  </p>
                )}
            </div>
            <Controller
              name={`dataProduct.${index}.note`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[200px] text-xs"
                  placeholder="Ghi chú"
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name={`dataProduct.${index}.images`}
              render={({ field: { value, onChange, ...field } }) => {
                return (
                  <Input
                    type="file"
                    id={`picture`}
                    className="hidden"
                    accept="image/*"
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    onChange={(event: any) => {
                      const file = event.target.files[0];
                      if (file) {
                        onChange(file);
                        setValue(`dataProduct.${index}.hasFile`, 1);
                      }
                    }}
                  />
                );
              }}
            />
            <Button
              className=" bg-blue-100 text-black border-none hover:bg-blue-200"
              style={{
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
              type="button"
              onClick={() => fileInputRefs.current[index]?.click()}
            >
              {watch(`dataProduct.${index}.images`)
                ? "Đã tải file"
                : "Tải file"}
            </Button>
            <MdDelete
              onClick={() => {
                remove(index);
                setSupplierSelected(
                  supplierSelected.filter(
                    (supEl: number) => supEl !== item.supplierId
                  )
                );
              }}
              className="cursor-pointer mr-2"
              color="red"
              size={18}
            />
          </div>
        )}
        {productsData[index + 1]?.productId !== newProductId && (
          <Button
            onClick={() => {
              setProductId(item?.productId);
              setIsDialogOpen(true);
              const newProductData = productsData?.filter(
                (eleItem: { productId: number; supplierId: number }) =>
                  eleItem.productId === item?.productId &&
                  eleItem.supplierId > 0
              );
              const newSupplierSelected = newProductData.map(
                (itemEle: { supplierId: number }) => itemEle.supplierId
              );
              setSupplierSelected(newSupplierSelected);
            }}
            className="w-full mb-2 mt-2"
            variant="outline"
            type="button"
          >
            Thêm loại sản phẩm
          </Button>
        )}
      </div>
    );
  };

  const handleAddProductsSupplier = (suppliers: any) => {
    const listQuoteProduct = getValues("dataProduct");
    const productFieldIndex = listQuoteProduct?.findLastIndex(
      (item: { productId: number }) => item.productId === productId
    );
    if (productFieldIndex > -1) {
      var count = 0;
      suppliers.forEach((item: any) => {
        const newItem: any = {
          quoteProductId: listQuoteProduct[productFieldIndex]?.quoteProductId
            ? listQuoteProduct[productFieldIndex]?.quoteProductId
            : 0,
          CPVC: 0,
          productCode: "",
          producerName: "",
          productId: listQuoteProduct[productFieldIndex]?.productId
            ? listQuoteProduct[productFieldIndex]?.productId
            : 0,
          supplierId: item?.id,
          quantity: listQuoteProduct[productFieldIndex]?.quantity,
          unit: listQuoteProduct[productFieldIndex]?.unit,
          pricePurchase: 0,
          VATPurchase: 0,
          deliveryTime: "0 ngày",
          note: "",
          supplier: item.name,
          hasFile: 0,
          images: undefined,
          currencyPurchase: "VND",
        };
        listQuoteProduct.splice(productFieldIndex + 1 + count, 0, newItem);
        count = count + 1;
      });
      setProductsData(listQuoteProduct);
      setValue("dataProduct", listQuoteProduct);
      setProductIdArr([...productIdArr, productId]);
    }
  };

  const mutationCreateGoods = useMutation({
    mutationFn: createGoodsInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["createGoodsInfo"],
      });
      toast({
        title: "Thành công",
        description: "Tạo thông tin hàng hoá thành công",
      });
      router.push("/admin/quote-requirement");
    },
    onError: (error) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: "Tạo thông tin hàng hoá thất bại",
      });
    },
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    Object.keys(data["dataProduct"][0]).forEach((item: any) => {
      data["dataProduct"]
        .filter((product: ProductDataType) => product.supplierId > 0)
        .forEach((el: any) => {
          if (
            ![
              "id",
              "productCode",
              "producerName",
              "productId",
              "supplier",
            ].includes(item)
          ) {
            formData.append(
              `${item}${item === "images" ? "" : "[]"}`,
              el[item]
            );
          }
        });
    });
    mutationCreateGoods.mutate({ formData: formData, id: Number(params?.id) });
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
                <p className="font-semibold text-[14px]">Địa chỉ khách hàng:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.Customer?.address}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">End-User:</p>
                <Input
                  className="w-[250px] text-xs"
                  value={detailData?.data?.data?.endUser}
                  contentEditable={false}
                />
              </div>
            </div>

            <div className="w-full">
              <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
                Thông tin hàng hoá:
              </h5>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Số RFQ:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.RFQ}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Ngày tạo:</p>
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
                <p className="font-semibold text-[14px]">Người tạo yêu cầu:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.creatorInfo?.fullName}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Sale phụ trách:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.salerInfo?.fullName}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Pur phụ trách:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.purchaserInfo?.fullName}
                </span>
              </div>
            </div>
          </div>
          <div>
            {fields?.map((item: ProductDataType, index: number) =>
              renderProductSupplierRow(item, index, fields, productSelected)
            )}
          </div>
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
              Mất đơn hàng
            </Button>
          </div>
          <div>
            <Button
              onClick={() => router.back()}
              type="button"
              variant="secondary"
            >
              Quay lại
            </Button>
            {mutationCreateGoods.isPending ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Xin chờ
              </Button>
            ) : (
              <Button className="ml-2" variant="default" type="submit">
                Gửi
              </Button>
            )}
          </div>
        </div>
        <AddListProductsSupplier
          onAddProducts={handleAddProductsSupplier}
          productId={productId}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          supplierSelected={supplierSelected}
        />
      </form>
      <CancelForm
        value={reason}
        setValue={setReason}
        open={openReason}
        setOpen={setOpenReason}
        title="Lí do từ chối"
        description="Lí do"
        loading={mutationCancelYCBG.isPending}
        handleCancel={() => handleCancelYCBG(Number(params?.id), reason)}
      />
    </>
  );
}
