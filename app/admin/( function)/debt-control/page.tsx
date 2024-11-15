
import DebtTabsView from "@/View/accounting/DebtTabsView";
import BreadcrumbFunction from "@/components/Breadcrumb";

export default async function page() {
    return (
        <>
            <BreadcrumbFunction
                functionName="Kế toán"
                title="Quản lý công nợ"
                hasChildFunc={false}
                link="admin/debt-control"
            />
            <DebtTabsView />
        </>
    );
}
