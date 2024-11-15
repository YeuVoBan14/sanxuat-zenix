
import CustomerManagement from "@/View/admin/customers/CustomerManagement";
import BreadcrumbFunction from "@/components/Breadcrumb";

export default async function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Khách hàng"
        title="Danh sách khách hàng"
        hasChildFunc={false}
        link="admin/customers"
      />
      <CustomerManagement />
    </>
  );
}
