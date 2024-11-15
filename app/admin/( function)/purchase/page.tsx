
import Purchase from "@/View/supply-management/purchase-management/Purchase";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default async function page() {

    return (
        <>
            <BreadcrumbFunction
                functionName="Cung ứng"
                title="Mua hàng"
                hasChildFunc={false}
                link="admin/purchase"
            />
            <Purchase />
        </>
    );
}
