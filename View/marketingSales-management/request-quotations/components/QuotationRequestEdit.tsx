"use client";
import {
  getDetailQuotationRequest,
  getListUserByDepartment,
  updateYCBG,
} from "@/api/quotations";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import SelectComponent from "@/components/Select";
import { getBankAccount } from "@/api/payment";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { MdDelete } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams, useRouter } from "next/navigation";

type YCBGDetailsProps = {};

interface ProductDataType {
  productCode: string;
  consultationCode: string;
  itemCode: string;
  describe: string;
  departmentId: number;
  quantity: number;
  unit: string;
  producer: number;
  type: string;
  hasFile: number;
  reason: string;
  note: string;
  productFile: any;
}

const initialState = {
  userContact: "",
  quantity: 0,
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

export default function QuotationRequestEdit(props: YCBGDetailsProps) {
  const [purchaseId, setPurchaseId] = useState<number>();
  const [saleId, setSaleId] = useState<number>();
  const [bodyData, setBodyData] = useState<any>(initialState);
  const [productsData, setProductsData] = useState<ProductDataType[]>([]);
  const quoteDatePickerRef = useRef<DatePicker>(null);
  const responseDatePickerRef = useRef<DatePicker>(null);
  const [quoteDeadline, setQuoteDeadline] = useState<Date>(new Date());
  const [responseTime, setResponseTime] = useState<Date>(new Date());
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: bankAccount } = useQuery({
    queryKey: ["bankAccount"],
    queryFn: () => getBankAccount(),
  });
  const { data: detailData, refetch } = useQuery({
    queryKey: ["detailRequest"],
    queryFn: () => getDetailQuotationRequest(Number(id)),
    enabled: id ? true : false,
  });
  const { data: listSale } = useQuery({
    queryKey: ["listSale"],
    queryFn: () => getListUserByDepartment("sale"),
  });
  const { data: listPurchase } = useQuery({
    queryKey: ["listPurchase"],
    queryFn: () => getListUserByDepartment("purchase"),
  });
  const mutationUpdateYCBG = useMutation({
    mutationFn: updateYCBG,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["updateYCBG"],
      });
      toast({
        title: "Thành công",
        description: "Cập nhật yêu cầu báo giá thành công",
      });
      router.push("/admin/quote-requirement");
    },
    onError: (error) => {
      console.error("Đã xảy ra lỗi khi gửi:", error);
      toast({
        title: "Thất bại",
        description: "Cập nhật yêu cầu báo giá thất bại",
      });
    },
  });

  const quoteDetailData = detailData?.data?.data;

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      durationQuoteForCustomer: quoteDetailData?.durationQuoteForCustomer,
      durationFeedback: quoteDetailData?.durationFeedback,
      saleId: quoteDetailData?.saleId,
      purchaseId: quoteDetailData?.purchaseId,
      address: quoteDetailData?.address,
      endUser: quoteDetailData?.endUser,
      fileQuote: null,
      dataProduct: productsData,
    },
  });

  const { fields, remove } = useFieldArray({
    control,
    name: "dataProduct",
  });

  useEffect(() => {
    if (quoteDetailData) {
      setPurchaseId(quoteDetailData?.purchaseId);
      setSaleId(quoteDetailData?.saleId);
      setQuoteDeadline(new Date(quoteDetailData?.durationQuoteForCustomer));
      setResponseTime(new Date(quoteDetailData?.durationFeedback));
      const newQuoteProduct: any[] = [];
      detailData?.data?.data?.quoteProducts.forEach((item: any) => {
        if (item?.refuse) {
          newQuoteProduct.push({
            productCode: item?.Product.productCode,
            consultationCode: item?.consultationCode,
            itemCode: item?.itemCode,
            describe: item?.Product.describe,
            departmentId: item?.departmentId,
            quantity: item?.quantity,
            unit: item?.unit,
            producer: item?.Product.producerInfo.name,
            note: item?.note,
            type: item?.type,
            hasFile: 0,
            departments: detailData?.data?.data?.Customer?.departments,
            reason: item?.reason,
            productFile: undefined,
          });
          fileInputRefs.current.push(null);
        }
      });
      setProductsData(newQuoteProduct);
      setValue("dataProduct", newQuoteProduct);
    }
  }, [quoteDetailData]);

  const renderProductSupplierRow = (item: any, index: number) => {
    return (
      <div
        key={`${item.id}`}
        className="flex items-center justify-between gap-1 mb-2"
      >
        <MdDelete
          onClick={() => remove(index)}
          className="cursor-pointer ml-[-9px] translate-x-2"
          color="red"
          size={18}
        />
        <Input
          className="w-[100px]"
          value={item?.productCode}
          contentEditable={false}
        />
        <Input
          className="w-[100px]"
          value={item?.consultationCode}
          contentEditable={false}
        />
        <Input
          className="w-[100px]"
          value={item?.itemCode}
          contentEditable={false}
        />
        <Controller
          name={`dataProduct.${index}.describe`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              className="w-[150px]"
              defaultValue={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <div className="w-[150px]">
          <Controller
            name={`dataProduct.${index}.departmentId`}
            control={control}
            render={({ field, fieldState }) => (
              <SelectComponent
                key="id"
                label=""
                placeholder="Bộ phận liên hệ"
                data={item?.departments?.map((item: any) => ({
                  value: item.id,
                  department: item.department,
                }))}
                value={field.value}
                setValue={(val: number) => {
                  setValue(`dataProduct.${index}.departmentId`, val);
                }}
                displayProps="department"
              />
            )}
          />
        </div>
        <Controller
          name={`dataProduct.${index}.quantity`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              className="w-[80px]"
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
              className="w-[50px]"
              defaultValue={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name={`dataProduct.${index}.producer`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              className="w-[80px]"
              defaultValue={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name={`dataProduct.${index}.note`}
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
              }}
              id="T"
            />
          )}
        />
        <Controller
          control={control}
          name={`dataProduct.${index}.productFile`}
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
          {watch(`dataProduct.${index}.productFile`)
            ? "Đã tải file"
            : "Tải file"}
        </Button>
        <Controller
          name={`dataProduct.${index}.reason`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              className="w-[100px]"
              value={field.value}
              contentEditable={false}
            />
          )}
        />
      </div>
    );
  };

  const handleQuoteDivClick = () => {
    if (quoteDatePickerRef.current) {
      quoteDatePickerRef.current.setFocus();
    }
  };

  const handleResponseDivClick = () => {
    if (responseDatePickerRef.current) {
      responseDatePickerRef.current.setFocus();
    }
  };

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("saleId", JSON.stringify(saleId));
    formData.append("purchaseId", JSON.stringify(purchaseId));
    formData.append(
      "durationQuoteForCustomer",
      format(quoteDeadline, "yyyy-MM-dd kk:mm:ss")
    );
    formData.append(
      "durationFeedback",
      format(responseTime, "yyyy-MM-dd kk:mm:ss")
    );
    formData.append("endUser", quoteDetailData?.endUser);
    formData.append("address", quoteDetailData?.address);
    if (!detailData?.data?.data?.file) {
      formData.append("fileQuote", data["fileQuote"]);
    }
    formData.append("RFQCustomer", detailData?.data.data.RFQCustomer);
    detailData?.data?.data?.quoteProducts.forEach((item: any) => {
      item?.refuse && formData.append("quoteProductId[]", item.id);
    });
    Object.keys(data["dataProduct"][0]).forEach((item: any) => {
      data["dataProduct"].forEach((el: any) => {
        if (item !== "departments") {
          if (item !== "productFile") {
            formData.append(`${item}[]`, el[item]);
          } else {
            if (el["productFile"]) {
              formData.append("productFile", el["productFile"]);
            }
          }
        }
      });
    });
    formData.append("noteTimeline", "Tôi mới cập nhật những sản phẩm từ chối");
    mutationUpdateYCBG.mutate({ formData: formData, id: Number(id) });
    // setTimeout(() => {
    //   setIsDialogOpen(false);
    //   refetchData();
    // }, 500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className=" overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-2 gap-4">
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
              <p className="font-semibold text-[14px]">Địa chỉ:</p>
              <span className="text-[14px]">
                {detailData?.data?.data?.Customer?.address}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full mt-2">
              <p className="font-semibold text-[14px]">End-user:</p>
            </div>
            <Controller
              name={`endUser`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-full mb-2"
                  value={quoteDetailData?.endUser}
                  contentEditable={false}
                  onChange={field.onChange}
                  placeholder="Nhập tên người nhận"
                />
              )}
            />
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Địa chỉ nhận hàng:</p>
            </div>
            <Controller
              name={`address`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-full mb-2"
                  value={quoteDetailData?.address}
                  onChange={field.onChange}
                  contentEditable={false}
                  placeholder="Nhập địa chỉ nhận hàng"
                />
              )}
            />
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">
                Số YCBG của khách hàng:
              </p>
            </div>
            <Input
              className="w-full mb-2"
              value={detailData?.data?.data?.RFQCustomer}
              contentEditable={false}
            />
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">
                Tải file YCBG của khách hàng:
              </p>
            </div>
            <Controller
              control={control}
              name={`fileQuote`}
              render={({ field: { value, onChange, ...field } }) => {
                return (
                  <div className="w-full">
                    <Input
                      id="picture"
                      type="file"
                      disabled={detailData?.data?.data?.file ? true : false}
                      onChange={(event: any) => {
                        const file = event.target.files[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                    />
                  </div>
                );
              }}
            />
          </div>

          <div className="w-full">
            <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
              Thông tin báo giá:
            </h5>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Số YCBG:</p>
              <span className="text-[14px]">{quoteDetailData?.RFQ}</span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Ngày tạo YCBG:</p>
              <span className="text-[14px]">
                {quoteDetailData?.createdAt
                  ? format(quoteDetailData?.createdAt, "yyyy/MM/dd")
                  : ""}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Số lần chỉnh sửa:</p>
              <span className="text-[14px]">{quoteDetailData?.editNumber}</span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Người tạo YCBG:</p>
              <span className="text-[14px]">
                {quoteDetailData?.creatorInfo?.fullName}
              </span>
            </div>
            <div className="flex justify-between mb-1 w-full">
              <p className="font-semibold text-[14px]">Người mua phụ trách</p>
            </div>
            <SelectComponent
              key="id"
              label=""
              placeholder="Chọn người mua phụ trách"
              data={listPurchase?.data?.data?.map((item: any) => ({
                value: item.id,
                fullName: item.fullName,
              }))}
              value={purchaseId}
              setValue={(val: number) => {
                setPurchaseId(val);
                setValue("purchaseId", val);
              }}
              disabled={true}
              displayProps="fullName"
            />
            <div className="flex justify-between mb-1 w-full mt-1">
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
              disabled={true}
              setValue={(val: number) => {
                setSaleId(val);
                setValue("saleId", val);
              }}
              displayProps="fullName"
            />
            <div className="flex justify-between mb-1 w-full mt-1">
              <p className="font-semibold text-[14px]">
                Thời hạn báo giá cho khách hàng
              </p>
            </div>
            <div
              onClick={handleQuoteDivClick}
              className="flex items-center border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
            >
              <DatePicker
                ref={quoteDatePickerRef}
                selected={quoteDeadline}
                onChange={(value: any) => setQuoteDeadline(value)}
                showTimeSelect
                disabled={true}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Chọn ngày và giờ"
                className="w-full ml-3 border-none focus:outline-none focus:ring-0"
              />
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </div>
            <div className="flex justify-between mb-1 w-full mt-1">
              <p className="font-semibold text-[14px]">Thời hạn phản hồi</p>
            </div>
            <div
              onClick={handleResponseDivClick}
              className="flex items-center border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
            >
              <DatePicker
                selected={responseTime}
                onChange={(value: any) => setResponseTime(value)}
                showTimeSelect
                dateFormat="dd/MM/yyyy HH:mm"
                disabled={true}
                placeholderText="Chọn ngày và giờ"
                className="w-full ml-3 border-none focus:outline-none focus:ring-0"
              />
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-center mt-3">
            <div className="cursor-pointer"></div>
            <p className="w-[100px] text-[14px] translate-x-[-20px]">
              Mã sản phẩm
            </p>
            <p className="w-[120px] text-[14px] translate-x-[-30px]">
              Mã tham vấn KH
            </p>
            <p className="w-[100px] text-[14px] translate-x-[-50px]">
              Mã vật tư KH
            </p>
            <p className="w-[80px] text-[14px] ml-[-15px] translate-x-[-35px]">
              Mô tả
            </p>
            <p className="w-[130px] text-[14px] ml-[-25px] translate-x-[-5px]">
              Bộ phận liên hệ
            </p>
            <p className="w-[100px] text-[14px] ml-[-30px] translate-x-[20px]">
              Số lượng
            </p>
            <p className="w-[70px] text-[14px] translate-x-[-15px]">
              Đơn vị tính
            </p>
            <p className="w-[150px] text-[14px] ml-[-40px] translate-x-[-25px]">
              Nhà sản xuất
            </p>
            <p className="w-[70px] text-[14px] ml-[-30px] translate-x-[-45px]">
              Ghi chú
            </p>
            <p className="w-[20px] text-[14px] translate-x-[-45px]">Dự án</p>
            <p className="w-[20px] text-[14px] translate-x-[-65px]">Tiêu hao</p>
            <p className="w-[70px] text-[14px] ml-[-30px] translate-x-[-45px]">
              Thông tin thêm
            </p>
            <p className="w-[70px] text-[14px] ml-[-30px] translate-x-[-15px]">
              Nội dung từ chối
            </p>
          </div>
          {fields?.map((item: ProductDataType, index: number) =>
            renderProductSupplierRow(item, index)
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end w-full">
        <div>
          <Button type="button" variant="secondary">
            Thoát
          </Button>
          {mutationUpdateYCBG.isPending ? (
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
              Gửi
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
