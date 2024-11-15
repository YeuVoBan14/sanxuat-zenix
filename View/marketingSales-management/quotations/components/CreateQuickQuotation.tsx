"use client";
import {
  createQuote,
  getListUserByDepartment,
  getListUserByDepartmentAndCustomerId,
  getProductSupplier,
} from "@/api/quotations";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import SelectComponent from "@/components/Select";
import { getBankAccount } from "@/api/payment";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import AddListProducts from "@/View/admin/customers/components/AddListProductsQuote";
import { getListCustomer } from "@/api/customer";
import { MdDelete } from "react-icons/md";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  nameAccount: z.string().min(5, "Bạn phải nhập ít nhất 5 kí tự"),
  numberAccount: z.string().min(5, "Bạn phải nhập ít nhất 5 kí tự"),
  nameBank: z.string().min(5, "Bạn phải nhập ít nhất 5 kí tự"),
  branch: z.string().min(5, "Bạn phải nhập ít nhất 5 kí tự"),
  supplierId: z.number({
    required_error: "Bạn chưa chọn nhà cung cấp",
  }),
});

interface ProductDataType {
  productCode: string;
  producerName: string;
  productId: number;
  supplierId: number;
  priceProduct: number;
  priceSale: number;
  quantity: number;
  unit: string;
  pricePurchase: number;
  VATSale: number;
  VATPurchase: number;
  deliveryTime: string;
  type: string;
  CPVC: number;
  supplierQuoteId: number;
  deliveryTimeCus: string;
  currencySale: string;
  currencyPurchase: string;
  listPriceProduct: any[];
}

const initialState = {
  userContact: "",
  quantity: 1,
  priceTerm: "",
  qualityTerm: "",
  deliveryCondition: "",
  executionTime: "",
  warrantyCondition: "",
  TOP: "",
  paymentBy: "",
  validityQuote: "",
  bankAccountId: 0,
  customerId: 0,
  saleId: 0,
  deliveryAddress: "",
};

export default function CreateQuotationQuick() {
  const [customerId, setCustomerId] = useState<number>(0);
  const [saleId, setSaleId] = useState<number>();
  const [bodyData, setBodyData] = useState<any>(initialState);
  const [productsData, setProductsData] = useState<ProductDataType[]>([]);
  const [accountInfo, setAccountInfo] = useState<any>();
  const [indexProduct, setIndexProduct] = useState<number>(0);
  const [saleInfo, setSaleInfo] = useState<any>();
  const [productCodes, setProductCodes] = useState<string[]>([]);
  const [productQuery, setProductQuery] = useState<{
    productId: number;
    supplierId: number;
  }>();
  const [customerInfo, setCustomerInfo] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const { data: bankAccount } = useQuery({
    queryKey: ["bankAccount"],
    queryFn: () => getBankAccount(),
  });
  const {
    data: listCustomer,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["listCustomer"],
    queryFn: () =>
      getListCustomer({
        page: 0,
        pageSize: 100,
        keySearch: "",
        process: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"],
      }),
  });
  const { data: listSale } = useQuery({
    queryKey: ["listSale", customerId],
    queryFn: () => getListUserByDepartmentAndCustomerId("sale", customerId),
    enabled: customerId > 0 ? true : false,
  });
  const { data: listProductSupplier } = useQuery({
    queryKey: ["listProductSupplier", productQuery],
    queryFn: () => getProductSupplier(productQuery),
  });
  const mutationCreateBG = useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["createQuote"],
      });
      toast({
        title: "Thành công",
        description: "Gửi báo giá thành công",
      });
      router.push("/admin/quotation");
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
    setValue,
    getValues,
    watch,
    register,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      userContact: "",
      quantity: 1,
      priceTerm: "",
      qualityTerm: "",
      deliveryCondition: "",
      executionTime: "",
      warrantyCondition: "",
      TOP: "",
      paymentBy: "",
      validityQuote: "",
      bankAccountId: 0,
      customerId: 0,
      saleId: 0,
      deliveryAddress: "",
      dataProduct: productsData,
    },
  });

  const handleAddProduct = (products: any[]) => {
    const productsList: any[] = getValues("dataProduct");
    products?.forEach((item: any) => {
      productsList.push({
        productId: item.id,
        producerName: item.producerInfo.name,
        supplierId: item.supplierId,
        priceSale: item.priceSale,
        pricePurchase: item.pricePurchase,
        quantity: item?.quantity,
        unit: item?.unit,
        VATSale: item.VATPurchase,
        deliveryTime: item.deliveryTime,
        deliveryTimeCus: item.deliveryTimeCus,
        type: item.type,
        suppliers: item.suppliers,
        productCode: item.productCode,
        supplierQuoteId: null,
        currencySale: "VND",
        currencyPurchase: "VND",
        priceProduct: undefined,
        listPriceProduct: [],
      });
    });
    setValue("dataProduct", productsList);
  };

  const { fields, remove } = useFieldArray({
    control,
    name: "dataProduct",
  });

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

  useEffect(() => {
    setValue(
      `dataProduct.${indexProduct}.listPriceProduct`,
      listProductSupplier?.data?.data
    );
  }, [listProductSupplier]);

  const renderProductSupplierRow = (
    item: any,
    index: number,
    productData: any
  ) => {
    return (
      <div key={index}>
        <div className="flex">
          <div
            onClick={() => {
              setProductCodes(
                productData.map(
                  (eleItem: { productCode: string }) => eleItem.productCode
                )
              );
            }}
            className="cursor-pointer"
          >
            <AddListProducts
              onAddProducts={handleAddProduct}
              productCodes={productCodes}
              option={"create_quick_quoted"}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
            />
          </div>
          <div className="flex w-[200px] items-center ml-4">
            <h5 className="mr-1 font-semibold text-[14px]">Mã sản phẩm:</h5>
            <span className="text-[13px]">{item?.productCode}</span>
          </div>
          <div className="flex items-center">
            <h5 className="mr-1 font-semibold text-[14px]">Nhà sản xuất:</h5>
            <span className="text-[13px]">{item?.producerName}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-center mt-1 relative">
          <MdDelete
            onClick={() => remove(index)}
            className="cursor-pointer ml-[-9px] absolute left-2 top-3"
            color="red"
            size={18}
          />
          <div className="w-[120px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Nhà cung cấp</p>
          </div>
          <div className="w-[80px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Số lượng</p>
          </div>
          <div className="w-[80px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Đơn vị tính</p>
          </div>
          <div className="w-[100px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Giá đầu vào</p>
          </div>
          <div className="w-[100px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Đơn giá</p>
          </div>
          <div className="w-[60px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">VAT (%)</p>
          </div>
          <div className="w-[100px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Chi phí vận chuyển</p>
          </div>
          <div className="w-[130px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Thành tiền</p>
          </div>
          <div className="w-[50px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Tiền tệ đầu vào</p>
          </div>
          <div className="w-[50px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Tiền tệ đầu ra</p>
          </div>
          <div className="w-[80px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Thời gian giao hàng tới kho</p>
          </div>
          <div className="w-[80px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Hạn giao hàng tới khách</p>
          </div>
          <div className="w-[25px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Dự án</p>
          </div>
          <div className="w-[25px] flex justify-center text-center">
            <p className="w-[120px] text-[14px]">Tiêu hao</p>
          </div>
        </div>
        <div
          key={`${item.id}`}
          className="flex items-center justify-between gap-1 mb-[24px]"
        >
          <div className="w-[120px] relative flex flex-col items-center">
            <Controller
              name={`dataProduct.${index}.supplierId`}
              control={control}
              rules={{ required: "Bạn chưa chọn nhà cung cấp" }}
              render={({ field, fieldState }) => (
                <SelectComponent
                  key="id"
                  label=""
                  placeholder="Nhà cung cấp"
                  data={item?.suppliers?.map((item: any) => ({
                    value: item.id,
                    department: item.name,
                  }))}
                  value={field.value}
                  setValue={(val: number) => {
                    setValue(`dataProduct.${index}.supplierId`, val);
                    setProductQuery({
                      productId: item.productId,
                      supplierId: val,
                    });
                    setIndexProduct(index);
                  }}
                  displayProps="department"
                  {...register(`dataProduct.${index}.supplierId`, {
                    required: true,
                  })}
                />
              )}
            />
            {errors.dataProduct && errors.dataProduct[index]?.supplierId && (
              <p className="text-red-500 text-[10px] absolute top-11">
                Chọn nhà cung cấp!!!
              </p>
            )}
          </div>
          <Controller
            name={`dataProduct.${index}.quantity`}
            control={control}
            render={({ field, fieldState }) => (
              <Input
                className="w-[80px]"
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
                className="w-[80px]"
                defaultValue={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="w-[100px] flex flex-col items-center relative">
            <Controller
              name={`dataProduct.${index}.priceProduct`}
              control={control}
              render={({ field, fieldState }) => (
                <SelectComponent
                  key="id"
                  label=""
                  placeholder="Giá đầu vào"
                  data={watch(`dataProduct.${index}.listPriceProduct`)?.map(
                    (item: { pricePurchase: string; id: number }) => ({
                      value: item.id,
                      name: item.pricePurchase,
                    })
                  )}
                  value={field.value}
                  setValue={(val: number) => {
                    setValue(`dataProduct.${index}.priceProduct`, val);
                    const newEle = watch(
                      `dataProduct.${index}.listPriceProduct`
                    )?.find((el: { id: number }) => el.id === val);
                    [
                      "pricePurchase",
                      "priceSale",
                      "VATSale",
                      "VATPurchase",
                      "CPVC",
                      "deliveryTimeCus",
                      "currencySale",
                      "currencyPurchase",
                    ].forEach((elItem: any) => {
                      const hiệp: any = `dataProduct.${index}.${elItem}`;
                      setValue(hiệp, newEle[elItem]);
                      setValue(
                        `dataProduct.${index}.VATSale`,
                        newEle["VATPurchase"]
                      );
                    });
                  }}
                  displayProps="name"
                  {...register(`dataProduct.${index}.priceProduct`, {
                    required: true,
                  })}
                />
              )}
            />
            {errors.dataProduct && errors.dataProduct[index]?.priceProduct && (
              <p className="text-red-500 text-[10px] absolute top-11">
                Chọn giá đầu vào!!!
              </p>
            )}
          </div>
          <div className="w-[100px] flex flex-col items-center relative">
            <Controller
              name={`dataProduct.${index}.priceSale`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[100px]"
                  defaultValue={field.value}
                  type="number"
                  min={0}
                  {...register(`dataProduct.${index}.priceSale`, {
                    required: true,
                  })}
                  onChange={(e) => {
                    setValue(
                      `dataProduct.${index}.priceSale`,
                      Number(e.target.value)
                    );
                  }}
                />
              )}
            />
            {errors.dataProduct && errors.dataProduct[index]?.priceSale && (
              <p className="text-red-500 text-[10px] absolute top-11">
                Nhập đơn giá!!!
              </p>
            )}
          </div>
          <Controller
            name={`dataProduct.${index}.VATSale`}
            control={control}
            render={({ field, fieldState }) => (
              <Input
                className="w-[60px]"
                type="number"
                min={0}
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
                type="number"
                min={0}
                onChange={field.onChange}
              />
            )}
          />
          <Input
            className="w-[130px]"
            value={calculatePrice(
              Number(watch(`dataProduct.${index}.quantity`)),
              Number(watch(`dataProduct.${index}.priceSale`)),
              Number(watch(`dataProduct.${index}.VATSale`)),
              Number(watch(`dataProduct.${index}.CPVC`))
            )}
            contentEditable={false}
          />
          <Input
            className="w-[50px] text-xs"
            value={item?.currencyPurchase}
            contentEditable={false}
          />
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
          <Controller
            name={`dataProduct.${index}.deliveryTime`}
            control={control}
            render={({ field, fieldState }) => (
              <Input
                className="w-[80px]"
                defaultValue={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="w-[80px] flex flex-col items-center relative">
            <Controller
              name={`dataProduct.${index}.deliveryTimeCus`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-[80px]"
                  defaultValue={field.value}
                  {...register(`dataProduct.${index}.deliveryTimeCus`, {
                    required: true,
                  })}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.dataProduct &&
              errors.dataProduct[index]?.deliveryTimeCus && (
                <p className="text-red-500 text-[10px] absolute top-11">
                  Nhập hạn giao hàng!!!
                </p>
              )}
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
                    watch(`dataProduct.${index}.type`)
                  )}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      if (watch(`dataProduct.${index}.type`) === "T") {
                        setValue(`dataProduct.${index}.type`, "DT");
                      } else if (watch(`dataProduct.${index}.type`) === "") {
                        setValue(`dataProduct.${index}.type`, "D");
                      }
                    } else {
                      if (watch(`dataProduct.${index}.type`) === "DT") {
                        setValue(`dataProduct.${index}.type`, "T");
                      } else if (watch(`dataProduct.${index}.type`) === "D") {
                        setValue(`dataProduct.${index}.type`, "");
                      }
                    }
                    setValue(
                      `dataProduct.${index}.type`,
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
                    watch(`dataProduct.${index}.type`)
                  )}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      if (watch(`dataProduct.${index}.type`) === "D") {
                        setValue(`dataProduct.${index}.type`, "DT");
                      } else if (watch(`dataProduct.${index}.type`) === "") {
                        setValue(`dataProduct.${index}.type`, "T");
                      }
                    } else {
                      if (watch(`dataProduct.${index}.type`) === "DT") {
                        setValue(`dataProduct.${index}.type`, "D");
                      } else if (watch(`dataProduct.${index}.type`) === "T") {
                        setValue(`dataProduct.${index}.type`, "");
                      }
                    }
                    setValue(
                      `dataProduct.${index}.type`,
                      watch(`dataProduct.${index}.type`)
                    );
                  }}
                  id="T"
                />
              )}
            />
          </div>
        </div>
      </div>
    );
  };

  const onSubmit = (data: any) => {
    data["typeQuotation"] = params.slug[0] === "da" ? "D" : "T";
    data["quoteRequirementId"] = null;

    data["dataProduct"]?.splice(0, 1);

    if (data["bankAccountId"]) {
      mutationCreateBG.mutate(data);
    } else {
      alert("Bạn chưa chọn thông tin tài khoản ngân hàng !!!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-2 gap-4">
          <div className="w-full">
            <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
              Thông tin khách hàng:
            </h5>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Tên khách hàng:</p>
            </div>
            <SelectComponent
              key="id"
              label=""
              placeholder="Chọn khách hàng"
              data={listCustomer?.data?.data?.customers.map((item: any) => ({
                value: item.id,
                customerName: item.customerName,
              }))}
              value={customerId}
              setValue={(val: number) => {
                setCustomerId(val);
                setValue("customerId", val);
                setCustomerInfo(
                  listCustomer?.data?.data?.customers.find(
                    (ele: any) => ele.id === val
                  )
                );
              }}
              displayProps="customerName"
            />
            <div className="flex justify-between mb-1 w-full mt-2">
              <p className="font-semibold text-[14px]">Địa chỉ nhận hàng:</p>
            </div>
            <div className="">
              <Controller
                name={`deliveryAddress`}
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    className="w-full mb-2"
                    // defaultValue={field.value}
                    value={field.value}
                    {...register("deliveryAddress", { required: true })}
                    onChange={field.onChange}
                    placeholder="Nhập địa chỉ nhận hàng"
                  />
                )}
              />
              {errors.deliveryAddress && (
                <p className="text-red-500 text-[10px]">
                  Nhập địa chỉ nhận hàng!!!
                </p>
              )}
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Địa chỉ khách hàng:</p>
              <span className="text-[14px]">
                {customerId
                  ? customerInfo.address
                  : "Địa chỉ khách hàng sẽ hiển thị tại đây"}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Số điện thoại:</p>
              <span className="text-[14px]">
                {customerId
                  ? customerInfo.phoneNumber
                  : "Số điện thoại sẽ hiển thị tại đây"}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Email:</p>
              <span className="text-[14px]">
                {customerId
                  ? customerInfo.email
                  : "Email khách hàng sẽ hiển thị tại đây"}
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
                  />
                )}
              />
            </div>
          </div>

          <div className="w-full">
            <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
              Thông tin báo giá:
            </h5>
            {/* <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Số báo giá:</p>
              <span className="text-[14px]">{`Qx-ABCD-xxxx.00`}</span>
            </div> */}
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Ngày tạo BG:</p>
              <span className="text-[14px]">
                {format(new Date(), "dd/MM/yyyy")}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Sale phụ trách</p>
            </div>
            <SelectComponent
              key="id"
              label=""
              placeholder="Chọn sale phụ trách"
              data={listSale?.data?.data?.map((item: any) => ({
                value: item.id,
                fullName: item.fullName,
              }))}
              value={saleId}
              setValue={(val: number) => {
                setSaleId(val);
                setValue("saleId", val);
                setSaleInfo(
                  listSale?.data?.data?.find((ele: any) => ele.id === val)
                );
              }}
              displayProps="fullName"
            />
            <div className="flex justify-between mb-1 w-full mt-2">
              <p className="font-semibold text-[14px]">Email:</p>
              <span className="text-[14px]">
                {saleId ? saleInfo.email : "Email sale sẽ hiển thị tại đây"}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">SĐT:</p>
              <span className="text-[14px]">
                {saleId ? saleInfo.phoneNumber : "Sđt sale sẽ hiển thị tại đây"}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2">
          {fields?.length === 0 && (
            <div className="flex items-center justify-between text-center mt-3">
              <div className="cursor-pointer">
                <AddListProducts
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  option={"create_quick_quoted"}
                  onAddProducts={handleAddProduct}
                  productCodes={productCodes}
                />
              </div>
              <p className="w-[100px] text-[14px] translate-x-[-20px]">
                Mã sản phẩm
              </p>
              <p className="w-[120px] text-[14px]">Nhà cung cấp</p>
              <p className="w-[100px] text-[14px] ml-[-4px] translate-x-[30px]">
                Số lượng
              </p>
              <p className="w-[80px] text-[14px] ml-[-15px] translate-x-[15px]">
                Đơn vị tính
              </p>
              <p className="w-[130px] text-[14px] ml-[-25px] translate-x-[0px]">
                Đơn giá
              </p>
              <p className="w-[100px] text-[14px] ml-[-30px] translate-x-[-15px]">
                VAT (%)
              </p>
              <p className="w-[70px] text-[14px] translate-x-[-25px]">
                Chi phí vận chuyển
              </p>
              <p className="w-[150px] text-[14px] ml-[-40px] translate-x-[15px]">
                Thành tiền
              </p>
              <p className="w-[70px] text-[14px] ml-[-30px] translate-x-[25px]">
                Thời gian giao hàng
              </p>
              <p className="w-[20px] text-[14px] translate-x-[15px]">Dự án</p>
              <p className="w-[20px] text-[14px] translate-x-[-5px]">
                Tiêu hao
              </p>
            </div>
          )}
          {fields
            ?.filter((ele: { productCode: string }) => ele.productCode)
            ?.map((item: ProductDataType, index: number) =>
              renderProductSupplierRow(item, index + 1, fields)
            )}
        </div>
        {
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
              </div>
              <span style={{ color: "#EF4444" }} className="italic text-sm">
                * không bao gồm ngày nghỉ, lễ, Tết và có thể thay đổi tuỳ theo
                thời điểm xác nhận đặt hàng
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
                <span className="text-[14px]">
                  Bằng tiền mặt hoặc chuyển khoản qua TKNH
                </span>
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
        }
      </div>
      <div className="mt-4 flex justify-end w-full">
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
            <Button
              onClick={() => {}}
              className="ml-2"
              variant="default"
              type="submit"
            >
              Tạo báo giá
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
