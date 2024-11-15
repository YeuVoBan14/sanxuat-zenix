
import { HistoryWarehouseView } from "@/View/history-warehouse/HistoryWarehouseView";
import BreadcrumbFunction from "@/components/Breadcrumb";
import React from "react";

export default async function page() {

    return (
        <>
            <BreadcrumbFunction
                functionName="Kho vận"
                title="Lịch sử xuất nhập"
                hasChildFunc={false}
                link="admin/history-warehouse"
            />
            <HistoryWarehouseView />
        </>
    );
}
