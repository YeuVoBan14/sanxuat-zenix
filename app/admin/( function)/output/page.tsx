
import { InventoryShipmentByOrder } from "@/View/stock-out/InventoryShipmentByOrder";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default async function page() {

    return (
        <>
            <BreadcrumbFunction
                functionName="Kho vận"
                title="Xuất kho"
                hasChildFunc={false}
                link="admin/output"
            />
            <InventoryShipmentByOrder />
        </>
    );
}
