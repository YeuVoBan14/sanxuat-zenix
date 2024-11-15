import Quotations from "@/View/marketingSales-management/quotations/Quotation";
import CreateQuotationQuick from "@/View/marketingSales-management/quotations/components/CreateQuickQuotation";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Báo giá"
        title="Tạo báo giá nhanh"
        hasChildFunc={false}
        link="admin/quotation"
      />
      <CreateQuotationQuick />
    </>
  );
}
