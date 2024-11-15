import React from "react";
import CreateOrder from "@/View/marketingSales-management/quotations/components/CreateOrder";
import BreadcrumbFunction from "@/components/Breadcrumb";

export default function page() {
    return (
        <>
            <BreadcrumbFunction
                functionName="Kinh doanh"
                title="Báo giá"
                nameFunction="Tạo đơn"
                hasChildFunc={true}
                link="admin/quotation"
            />
            <CreateOrder />
        </>
    );
}
