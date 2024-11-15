import CreateQuotation from "@/View/marketingSales-management/quotations/components/CreateQuotation";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Báo giá"
        title="Tạo báo giá"
        hasChildFunc={false}
        link="admin/quotation"
      />
      <CreateQuotation />
    </>
  );
}
