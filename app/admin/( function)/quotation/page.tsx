import Quotations from "@/View/marketingSales-management/quotations/Quotation";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Kinh doanh"
        title="Báo giá"
        hasChildFunc={false}
        link="admin/quotation"
      />
      <Quotations />
    </>
  );
}
