
import QuoteRequirementView from "@/View/admin/customers/QuoteRequirementView";
import BreadcrumbFunction from "@/components/Breadcrumb";

export default async function page() {

  return (
    <>
      <BreadcrumbFunction
        functionName="Khách hàng"
        title="Danh sách khách hàng"
        nameFunction="Tạo yêu cầu báo giá"
        hasChildFunc={false}
        link="admin/customers"
      />
      <QuoteRequirementView />
    </>
  );
}
