import HistoryQuotation from "@/View/marketingSales-management/quotations/components/HistoryQuotation";
import CreateGoods from "@/View/marketingSales-management/request-quotations/components/CreateGoods";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Yêu cầu báo giá"
        title="Tạo thông tin hàng hoá"
        hasChildFunc={false}
        link="admin/quotation-requirement"
      />
      <CreateGoods />
    </>
  );
}
