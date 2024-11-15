import QuotationsList from "@/View/marketingSales-management/request-quotations/QuotationList";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Kinh doanh"
        title="YCBG"
        hasChildFunc={false}
        link="admin/quotation/request-quotation"
      />
      <QuotationsList />
    </>
  );
}
