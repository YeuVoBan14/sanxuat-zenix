import BreadcrumbFunction from "@/components/Breadcrumb";
import SupplierManagement from "@/View/admin/supplier/SupplierManagement";
import React from "react";

export default function page() {
  return (
    <>
      <BreadcrumbFunction functionName="Cung ứng" title="Nhà cung cấp" hasChildFunc={false} link="admin/supplier" />
      <SupplierManagement />
    </>
  );
}
