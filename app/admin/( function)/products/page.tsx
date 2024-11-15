import React from "react";
import ProductsManagement from "@/View/supply-management/product-management/ProductsManagement";
import BreadcrumbFunction from "@/components/Breadcrumb";

export default function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Cung ứng"
        title="Danh sách sản phẩm"
        hasChildFunc={false}
        link="admin/products"
      />
      <ProductsManagement />
    </>
  );
}
