
import { PaymentView } from "@/View/admin/payment/PaymentView";
import BreadcrumbFunction from "@/components/Breadcrumb";

export default function page() {
  return (
    <>
      <BreadcrumbFunction
        functionName="Quản trị viên"
        title="Thanh toán"
        hasChildFunc={false}
        link="admin/payment"
      />
      <div>
        <PaymentView />
      </div>
    </>
  );
}


