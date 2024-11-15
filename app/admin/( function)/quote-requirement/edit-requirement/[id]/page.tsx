import QuotationsList from "@/View/marketingSales-management/request-quotations/QuotationList";
import QuotationRequestEdit from "@/View/marketingSales-management/request-quotations/components/QuotationRequestEdit";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Yêu cầu báo giá"
        title="Cập nhật YCBG"
        hasChildFunc={false}
        link="admin/quotation-requirement/"
      />
      <QuotationRequestEdit />
    </>
  );
}
