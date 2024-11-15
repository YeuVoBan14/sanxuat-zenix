import HistoryQuotation from "@/View/marketingSales-management/quotations/components/HistoryQuotation";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Báo giá"
        title="Lịch sử báo giá"
        hasChildFunc={false}
        link="admin/quotation"
      />
      <HistoryQuotation />
    </>
  );
}
