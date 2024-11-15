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
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

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

export default function HistoryQuotation() {
  const [productSelected, setProductSelected] = useState<
    { id: number; productId: number }[]
  >([]);
  const [bodyData, setBodyData] = useState<any>(initialState);
  const [productsData, setProductsData] = useState<ProductDataType[]>([]);
  const [accountInfo, setAccountInfo] = useState<any>();
  const [valueStatus, setValueStatus] = useState<number>();
  const [exportStatus, setExportStatus] = useState<boolean>(false);
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: detailData, refetch } = useQuery({
    queryKey: ["detailRequest", params.id],
    queryFn: () => getDetailQuotation(Number(params.id)),
    enabled: params.id ? true : false,
  });
  const { data: fileData, isLoading: loadFileData } = useQuery({
    queryKey: ["exportQuotation", exportStatus],
    queryFn: () => exportQuotation(Number(params.id)),
    enabled: params.id && exportStatus ? true : false,
  });
  const mutationProcessBG = useMutation({
    mutationFn: processQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["createQuote"],
      });
      toast({
        title: "Thành công",
        description: `${valueStatus === 0 ? "Từ chối" : "Chấp thuận"
          } báo giá thành công`,
      });
      router.push("/admin/quotation");
    },
    onError: (error) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: `${valueStatus === 0 ? "Từ chối" : "Chấp thuận"
          } báo giá thất bại`,
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
    if (detailData && params.id) {
      const listQuoteProduct: any[] = [];
      detailData?.data?.data?.Quote_Histories?.forEach((item: any) => {
        listQuoteProduct.push({
          CPVC: item.CPVC,
          productCode: item.Product.productCode,
          producerName: item.Product.producerInfo?.name,
          priceSale: item.priceSale,
          quantity: item.quantity,
          unit: item.unit,
          pricePurchase: item.pricePurchase,
          VATSale: item.VATSale,
          VATPurchase: item.VATPurchase,
          deliveryTime: item.deliveryTime,
          type: item.type,
        });
      });
      setProductsData(listQuoteProduct);
      setValue("dataProduct", listQuoteProduct);
      [
        "userContact",
        "priceTerm",
        "qualityTerm",
        "deliveryCondition",
        "executionTime",
        "warrantyCondition",
        "TOP",
        "paymentBy",
        "validityQuote",
        "bankAccountId",
      ].forEach((el: any) => {
        setValue(el, detailData?.data?.data ? detailData?.data?.data[el] : "");
      });
      setBodyData((prevState: any) => ({
        ...prevState,
        bankAccountId: detailData?.data?.data?.bankAccountId,
      }));
      setAccountInfo(detailData?.data?.data?.bankAccountInfo);
    }
  }, [detailData, params.id]);

  const { fields } = useFieldArray({
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
        key={`${index + 1}`}
        className="flex items-center justify-between gap-1 mb-2"
      >
        <div className="w-[21px]">
          <p className="text-[12px] ml-1">{`${index + 1}`}</p>
        </div>
        <Input
          className="w-[150px]"
          value={item?.productCode}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[200px]"
          value={item?.producerName}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          type="number"
          value={item.quantity}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          value={item.unit}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          value={item.priceSale}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          value={item.VATSale}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          value={item.CPVC}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          value={calculatePrice(
            Number(item.quantity),
            Number(item.priceSale),
            Number(item.VATSale),
            Number(item.CPVC)
          )}
          contentEditable={false}
          disabled={true}
        />
        <Input
          className="w-[100px]"
          value={item.deliveryTime}
          contentEditable={false}
          disabled={true}
        />
        <div className="w-[25px] flex justify-center">
          <Checkbox
            value={"D"}
            checked={["D", "DT"].includes(item.type)}
            id="D"
          />
        </div>
        <div className="w-[25px] flex justify-center">
          <Checkbox
            value={"T"}
            checked={["T", "DT"].includes(item.type)}
            id="T"
          />
        </div>
      </div>
    );
  };

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleProcessQuotation = (value: number) => {
    mutationProcessBG.mutate({ value: value, id: Number(params.id) });
  };

  const handleDownloadFile = (url: string) => {
    // Thực hiện request để tải file
    if (url) {
      const urlArr = url.split("mega/");
      axios({
        url: url, // URL endpoint để tải file
        method: "GET",
        responseType: "blob", // Chỉ định kiểu dữ liệu là blob
      }).then((response) => {
        // Tạo một đường dẫn URL từ blob và tải xuống
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", urlArr[1]); // Tên file muốn tải xuống
        document.body.appendChild(link);
        link.click();
      });
    }
  };

  const handleExportQuotation = (url: any) => {
    if (url) {
      handleDownloadFile(url);
    } else {
      setExportStatus(true);
    }
  };

  return (
    <>
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
                <p className="font-semibold text-[14px]">Địa chỉ khách hàng:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.Customer?.address}
                </span>
              </div>
              <div className="flex justify-between mb-1 w-full">
                <p className="font-semibold text-[14px]">Người liên hệ:</p>
                <span className="text-[14px]">
                  {detailData?.data?.data?.userContact}
                </span>
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
                {detailData?.data?.data?.quoteRequirement?.RFQ}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Số báo giá:</p>
              <span className="text-[14px]">
                {detailData?.data?.data?.code}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Ngày tạo báo giá:</p>
              <span className="text-[14px]">
                {detailData?.data?.data?.createdAt &&
                  format(detailData?.data?.data?.createdAt, "dd/MM/yyyy")}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Sale phụ trách:</p>
              <span className="text-[14px]">
                {detailData?.data?.data?.saleInfo?.fullName}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Email:</p>
              <span className="text-[14px]">
                {detailData?.data?.data?.saleInfo?.email}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">SĐT:</p>
              <span className="text-[14px]">
                {detailData?.data?.data?.saleInfo?.phoneNumber}
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-center mt-3">
            <p className="text-[14px]">Stt</p>
            <div className="w-[150px] text-center flex justify-center">
              <p className="w-[150px] text-[14px] translate-x-[-5px]">
                Mã sản phẩm
              </p>
            </div>
            <>
              <div className="w-[200px] text-center flex justify-center">
                <p className="text-[14px]">Nhà sản xuất</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px]">Số lượng</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px]">Đơn vị tính</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px]">Đơn giá</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px]">VAT (%)</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px]">Chi phí vận chuyển</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px]">Thành tiền</p>
              </div>
              <div className="w-[100px] text-center flex justify-center">
                <p className="text-[14px]">Thời gian giao hành</p>
              </div>
              <div className="w-[25px] text-center flex justify-center">
                <p className="text-[14px]">Dự án</p>
              </div>
              <div className="w-[25px] text-center flex justify-center">
                <p className="text-[14px]">Tiêu hao</p>
              </div>
            </>
          </div>
          {fields?.map((item: ProductDataType, index: number) =>
            renderProductSupplierRow(item, index, productsData, productSelected)
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="w-full">
            <h5 className="font-semibold text-[16px] opacity-80 underline">
              Điều khoản
            </h5>
            <div className="flex w-full items-center mb-2">
              <div className="flex items-center w-1/3">
                <Checkbox checked={!!getValues("priceTerm")} id="priceTerm" />
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
                    value={field.value}
                    contentEditable={false}
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
                <Checkbox
                  checked={!!getValues("qualityTerm")}
                  id="qualityTerm"
                />
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
                    contentEditable={false}
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
                <Checkbox
                  checked={!!getValues("deliveryCondition")}
                  id="deliveryCondition"
                />
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
                    contentEditable={false}
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
                <Checkbox
                  checked={!!getValues("executionTime")}
                  id="executionTime"
                />
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
                    contentEditable={false}
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
              * không bao gồm ngày nghỉ, lễ, Tết và có thể thay đổi tuỳ theo
              thời điểm xác nhận đặt hàng
            </span>
            <div className="flex w-full items-center mb-2">
              <div className="flex items-center w-1/3">
                <Checkbox
                  checked={!!getValues("warrantyCondition")}
                  id="warrantyCondition"
                />
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
                    contentEditable={false}
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
                <Checkbox checked={!!getValues("TOP")} id="TOP" />
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
                    contentEditable={false}
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
                <Checkbox checked={true} id="paymentBy" />
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
                <Checkbox
                  checked={!!getValues("validityQuote")}
                  id="validityQuote"
                />
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
                    contentEditable={false}
                  />
                )}
              />
            </div>
          </div>
          <div className="w-full">
            <h5 className="mb-3 font-semibold text-[16px] opacity-80 underline">
              Thông tin thanh toán
            </h5>
            {/* <SelectComponent
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
            /> */}
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
                    <h5 className="font-bold">{accountInfo?.numberAccount}</h5>
                  </div>
                  <div className="flex w-full justify-between items-center">
                    <p>Ngân hàng</p>
                    <h5 className="font-bold">
                      {accountInfo?.nameBank} - Chi nhánh {accountInfo?.branch}
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
      <div className="mt-4 flex justify-end w-full">
        <div>
          <Button
            onClick={() => {
              router.push("/admin/quotation");
            }}
            type="button"
            variant="outline"
          >
            Thoát
          </Button>
        </div>
        {user?.role === "admin" && (
          <>
            <div>
              {mutationProcessBG.isPending && valueStatus === 0 ? (
                <Button className="ml-2" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Xin chờ
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setValueStatus(0);
                    handleProcessQuotation(0);
                  }}
                  className="ml-2"
                  variant="destructive"
                  type="submit"
                >
                  Từ chối
                </Button>
              )}
            </div>
            <div>
              {mutationProcessBG.isPending && valueStatus === 1 ? (
                <Button className="ml-2" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Xin chờ
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setValueStatus(1);
                    handleProcessQuotation(1);
                  }}
                  className="ml-2 bg-blue-500 hover:bg-blue-300"
                  type="submit"
                >
                  Chấp thuận
                </Button>
              )}
            </div>
          </>
        )}
        {loadFileData ? (
          <Button disabled>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            Xin chờ
          </Button>
        ) : (
          <Button
            onClick={() => handleExportQuotation(fileData?.data?.data)}
            className="ml-2"
            variant="default"
            type="button"
          >
            {fileData ? "Tải xuống" : "Xuất báo giá"}
          </Button>
        )}
      </div>
    </>
  );
}
