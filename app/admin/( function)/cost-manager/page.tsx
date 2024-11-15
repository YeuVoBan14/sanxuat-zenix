
import CostManager from "@/View/accounting/CostManager";
import BreadcrumbFunction from "@/components/Breadcrumb";

export default async function page() {
    return (
        <>
            <BreadcrumbFunction
                functionName="Kế toán"
                title="Quản lý chi phí"
                hasChildFunc={false}
                link="admin/cost-manager"
            />
            <CostManager />
        </>
    );
}
