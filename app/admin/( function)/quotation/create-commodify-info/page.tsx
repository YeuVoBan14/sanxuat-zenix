import CreateCommodifyInfo from "@/View/marketingSales-management/request-quotations/CreateCommodifyInfo";
import BreadcrumbFunction from "@/components/Breadcrumb";

export default async function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Kinh doanh"
        title="Danh sách YCBG"
        nameFunction="Tạo thông tin hàng hóa"
        hasChildFunc={true}
        link="admin/quotation/list"
      />
      <CreateCommodifyInfo />
    </>
  );
}
