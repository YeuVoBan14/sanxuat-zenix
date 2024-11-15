
import { CompanyView } from "@/View/admin/company/CompanyView";
import BreadcrumbFunction from "@/components/Breadcrumb";

export default function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Quản trị"
        title="Công ty"
        hasChildFunc={false}
        link="admin/company"
      />
        <CompanyView />
    </>
  );
}


