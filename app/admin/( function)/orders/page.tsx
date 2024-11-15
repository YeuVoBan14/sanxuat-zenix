
import Orders from "@/View/marketingSales-management/orders/Orders";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default async function page() {

    return (
        <>
            <BreadcrumbFunction
                functionName="Kinh doanh"
                title="Bán hàng"
                hasChildFunc={false}
                link="admin/orders"
            />
            <Orders />
        </>
    );
}
