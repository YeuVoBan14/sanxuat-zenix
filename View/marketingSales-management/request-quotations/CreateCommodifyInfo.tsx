"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { getDetailQuotationRequest } from "@/api/quotations";
import AddListProducts from "@/View/admin/customers/components/AddListProductsQuote";
import { Input } from "@/components/ui/input";
import { getProduct } from "@/api/product";

type ComondifyInfoType = {
  quoteProductId: string[];
  itemCodeProduct: string[];
  productName: string[];
  supplierId: string[];
  supplierName: string[];
  quantity: string[];
  unit: string[];
  pricePurchase: string[];
  VATPurchase: string[];
  deliveryTime: string[];
  CPVC: string[];
  note: string[];
  hasFile: string[];
};

export default function CreateCommodifyInfo() {
  const initialData: ComondifyInfoType = {
    quoteProductId: [],
    itemCodeProduct: [],
    productName: [],
    supplierId: [],
    supplierName: [],
    quantity: [],
    unit: [],
    pricePurchase: [],
    VATPurchase: [],
    deliveryTime: [],
    CPVC: [],
    note: [],
    hasFile: [],
  };

  const [commodifyInfoData, setCommodifyInfoData] =
    useState<ComondifyInfoType>(initialData);
  const [id, setId] = useState<any | null>(null);

  useEffect(() => {
    const quotationId = localStorage.getItem("QuotationID");
    if (quotationId) {
      setId(JSON.parse(quotationId));
    }
  }, []);

  const { data: QuotationData, refetch } = useQuery({
    queryKey: ["detailRequest", id],
    queryFn: () => getDetailQuotationRequest(id),
    enabled: !!id,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (QuotationData) {
        const quoteProducts = QuotationData.data.data.quoteProducts;
        const updatedCommodifyInfoData = { ...commodifyInfoData };

        const supplierDataPromises = quoteProducts.map(
          async (product: any, index: number) => {
            const supplierData = await getProduct(product.productId);
            return {
              index,
              product,
              supplierData,
            };
          }
        );

        const resolvedData = await Promise.all(supplierDataPromises);

        resolvedData.forEach(({ index, product, supplierData }) => {
          const producerInfo = supplierData?.data?.producerInfo;
          updatedCommodifyInfoData.quoteProductId[index] = product.id || "";
          updatedCommodifyInfoData.itemCodeProduct[index] =
            product.productId || "";
          updatedCommodifyInfoData.productName[index] =
            product.Product.productCode || "";
          updatedCommodifyInfoData.supplierId[index] =
            product.Product.productName || "";
          updatedCommodifyInfoData.supplierName[index] =
            producerInfo?.name || "";
          updatedCommodifyInfoData.quantity[index] = product.quantity || "";
          updatedCommodifyInfoData.unit[index] = product.unit || "";
          updatedCommodifyInfoData.pricePurchase[index] = "";
          updatedCommodifyInfoData.VATPurchase[index] = "";
          updatedCommodifyInfoData.deliveryTime[index] = "";
          updatedCommodifyInfoData.CPVC[index] = "";
          updatedCommodifyInfoData.note[index] = "";
          updatedCommodifyInfoData.hasFile[index] = product.Product.image
            ? "0"
            : "1";
        });

        setCommodifyInfoData(updatedCommodifyInfoData);
      }
    };

    fetchData();
  }, [QuotationData]);

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedCommodifyInfoData = { ...commodifyInfoData };
    updatedCommodifyInfoData[field as keyof ComondifyInfoType][index] = value;
    setCommodifyInfoData(updatedCommodifyInfoData);
  };

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="grid grid-cols-2">
        <div className="mr-10">
          <h1 className="font-semibold text-[16px] opacity-80 underline">
            Thông tin khách hàng
          </h1>
          <div className="mt5 grid grid-cols-3 justify-center">
            <div>
              <h1 className="text-[14px] mt-5 mb-1 font-medium">
                Tên khách hàng
              </h1>
              <h1 className="text-[14px] mt-2 mb-1 font-medium">SĐT</h1>
              <h1 className="text-[14px] mt-2 mb-1 font-medium">Địa chỉ</h1>
              <h1 className="text-[14px] mt-2 font-medium">End-User</h1>
            </div>
            <div></div>
            <div>
              <h1 className="text-[14px] mt-5 mb-1">
                {QuotationData?.data.data.Customer?.customerName || "Có lỗi"}
              </h1>
              <h1 className="text-[14px] mt-2 mb-1">
                {QuotationData?.data.data.Customer?.phoneNumber || "Có lỗi "}
              </h1>
              <h1 className="text-[14px] mt-2 mb-1">
                {QuotationData?.data.data.Customer?.address || "Có lỗi"}
              </h1>
              <h1 className="text-[14px] mt-2 mb-1">
                {QuotationData?.data.data.endUser || "Có lỗi"}
              </h1>
            </div>
          </div>
        </div>
        <div className="ml-10">
          <h1 className="font-semibold text-[16px] opacity-80 underline">
            Thông tin báo giá
          </h1>
          <div className="mb-2">
            <div className="mt-5 ">
              <div className="flex justify-between">
                <h1 className="text-[14px] font-medium">Số RFQ</h1>
                {QuotationData?.data.data.RFQ}
              </div>
              <div className="flex justify-between mt-2">
                <h1 className="text-[14px] font-medium">Ngày tạo</h1>
                <span className="text-[14px]">
                  {QuotationData?.data.data.createdAt &&
                    format(
                      new Date(QuotationData?.data.data.createdAt),
                      "dd/MM/yyyy"
                    )}
                </span>
                <h1 className="text-[14px] font-medium">Số lần điều chỉnh</h1>
                {QuotationData?.data.data.editNumber}
              </div>
              <div className="flex justify-between mt-2">
                <h1 className="text-[14px] font-medium">Ngày nhận</h1>
                <span className="text-[14px]">
                  {QuotationData?.data.data.durationQuoteForCustomer &&
                    format(
                      new Date(
                        QuotationData?.data.data.durationQuoteForCustomer
                      ),
                      "dd/MM/yyyy"
                    )}
                </span>
                <h1 className="text-[14px] font-medium">Lý do</h1>
                Chưa có
              </div>
              <div className="flex justify-between mt-2">
                <h1 className="text-[14px] font-medium">Ngày hoàn thành</h1>
                <span className="text-[14px]">
                  {QuotationData?.data.data.durationFeedback &&
                    format(
                      new Date(QuotationData?.data.data.durationFeedback),
                      "dd/MM/yyyy"
                    )}
                </span>
                <h1 className="text-[14px] font-medium">Ngày gửi phản hồi</h1>
                <span className="text-[14px]">
                  {QuotationData?.data.data.updatedAt &&
                    format(
                      new Date(QuotationData?.data.data.updatedAt),
                      "dd/MM/yyyy"
                    )}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <h1 className="text-[14px] font-medium">Người tạo yêu cầu</h1>
                <span className="text-[14px]">
                  {QuotationData?.data.data.creatorInfo?.fullName}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <h1 className="text-[14px] font-medium">Sale phụ trách</h1>
                <span className="text-[14px]">
                  {QuotationData?.data.data.salerInfo?.fullName}
                </span>
                <h1 className="text-[14px] font-medium">Pur phụ trách</h1>
                <span className="text-[14px]">
                  {QuotationData?.data.data.purchaserInfo?.fullName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between ">
          <div className="cursor-pointer">
            <AddListProducts onAddProducts={() => { }} productCodes={[]} selectedRows={[]} setSelectedRows={() => { }} />
          </div>
          <p className="w-[50px] text-[14px]">Stt</p>
          <p className="w-[200px] text-[14px]">Mô tả /mã sản phẩm</p>
          <p className="w-[100px] text-[14px]">Nhà sản xuất</p>
          <p className="w-[100px] text-[14px]">Nhà cung cấp</p>
          <p className="w-[100px] text-[14px]">Số lượng yêu cầu</p>
          <p className="w-[100px] text-[14px]">Đơn vị tính</p>
          <p className="w-[100px] text-[14px]">Đơn giá</p>
          <p className="w-[100px] text-[14px]">Thành tiền</p>
          <p className="w-[100px] text-[14px]">VAT</p>
          <p className="w-[100px] text-[14px]">Thời gian giao hàng</p>
          <p className="w-[100px] text-[14px]">CPVC(nếu có)</p>
          <p className="w-[100px] text-[14px]">Ghi chú</p>
          <p className="w-[100px] text-[14px] flex justify-center">Hình ảnh</p>
        </div>
      </div>
      {commodifyInfoData.quoteProductId.map((_, index) => (
        <div className="flex items-center justify-between mt-3" key={index}>
          <p className="w-[50px] text-[14px]">{index + 1}</p>
          <Input
            className="w-[200px] text-[14px]"
            value={`${commodifyInfoData.quoteProductId[index]} / ${commodifyInfoData.productName[index]}`}
            disabled
          />
          <Input
            className="w-[100px] text-[14px]"
            value={commodifyInfoData.supplierId[index]}
            onChange={(e) =>
              handleInputChange(index, "supplierId", e.target.value)
            }
            disabled
          />
          <Input
            className="w-[100px] text-[14px]"
            value={commodifyInfoData.supplierName[index]}
            onChange={(e) =>
              handleInputChange(index, "supplierName", e.target.value)
            }
            disabled
          />
          <Input
            className="w-[100px] text-[14px]"
            value={commodifyInfoData.quantity[index]}
            onChange={(e) =>
              handleInputChange(index, "quantity", e.target.value)
            }
          />
          <Input
            className="w-[100px] text-[14px]"
            value={commodifyInfoData.unit[index]}
            onChange={(e) => handleInputChange(index, "unit", e.target.value)}
          />
          <Input
            className="w-[100px] text-[14px]"
            value={commodifyInfoData.pricePurchase[index]}
            onChange={(e) =>
              handleInputChange(index, "pricePurchase", e.target.value)
            }
          />
          <Input
            className="w-[100px] text-[14px]"
            value={commodifyInfoData.VATPurchase[index]}
            onChange={(e) =>
              handleInputChange(index, "VATPurchase", e.target.value)
            }
          />
          <Input
            className="w-[100px] text-[14px]"
            value={commodifyInfoData.deliveryTime[index]}
            onChange={(e) =>
              handleInputChange(index, "deliveryTime", e.target.value)
            }
          />
          <Input
            className="w-[100px] text-[14px]"
            value={commodifyInfoData.CPVC[index]}
            onChange={(e) => handleInputChange(index, "CPVC", e.target.value)}
          />
          <Input
            className="w-[100px] text-[14px]"
            value={commodifyInfoData.note[index]}
            onChange={(e) => handleInputChange(index, "note", e.target.value)}
          />
          <div className="w-[100px] text-[14px] flext justify-end">
            <label className="cursor-pointer">
              <input type="file" className="hidden" />
              {commodifyInfoData.hasFile[index] ? "File đính kèm" : "Đã có ảnh"}
            </label>
          </div>
        </div>
      ))}
      <div className="mt-4 flex justify-between w-full">
        <div>
          <Button type="button" variant="destructive">
            Mất đơn hàng
          </Button>
        </div>
        <div>
          <Button type="button" variant="default">
            Tạo TTHH
          </Button>
        </div>
      </div>
    </div>
  );
}
