"use client";
import React from "react";
import Tab from "@/components/Tab";
import Quotations from "./Quotations";
import Orders from "./Orders";
import Complain from "./Complain";
import BreadcrumbFunction from "@/components/Breadcrumb";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCustomerById, getCustomerReport, getCustomerReview, getScheduleCustomer, getTotalOrderCustomer, getTotalQuoteCustomer } from "@/api/customer";
import Contact from "./Contact";
import Review from "./Review";
import Potential from "./Potential";
import Attachment from "./Attachment";
import InstallBase from "./InstallBase";
import { format } from "date-fns";

export default function CustomerById() {
  const params = useParams();
  const customerId = Number(params?.slug[1]);
  const currentDate = new Date();
  currentDate.setDate(1);

  const {
    data: listCustomer,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["listCustomerById", params?.slug[1]],
    queryFn: () => getCustomerById(params?.slug[1]),
  });

  const {
    data: totalScheduleCustomer,
  } = useQuery({
    queryKey: ["totalScheduleCustomer", customerId],
    queryFn: () => getScheduleCustomer(customerId, {
      page: 0,
      pageSize: 10,
      keySearch: "",
      startDate: format(currentDate, "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    }),
  });

  const {
    data: totalQuoteCustomer
  } = useQuery({
    queryKey: ["totalQuoteCustomer", customerId],
    queryFn: () => getTotalQuoteCustomer(customerId, {
      page: 0,
      pageSize: 10,
      keySearch: "",
      startDate: format(currentDate, "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    }),
  });

  const {
    data: totalOrderCustomer
  } = useQuery({
    queryKey: ["totalOrderCustomer", customerId],
    queryFn: () => getTotalOrderCustomer(customerId, {
      page: 0,
      pageSize: 10,
      keySearch: "",
      startDate: format(currentDate, "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    }),
  });

  const {
    data: listCustomerReport
  } = useQuery({
    queryKey: ["listCustomerReport", customerId],
    queryFn: () => getCustomerReport(customerId, {
      page: 0,
      pageSize: 10,
      keySearch: "",
      startDate: format(currentDate, "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    })
  });

  const {
    data: customerReviewList
  } = useQuery({
    queryKey: ["customerReviewList", customerId],
    queryFn: () => getCustomerReview(customerId, {
      page: 0,
      pageSize: 10,
      keySearch: "",
      startDate: format(currentDate, "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    }),
  });

  const items = [
    {
      key: 1,
      label: "Liên hệ khách hàng",
      children: (
        <Contact
          customerId={Number(params?.slug[1])}
          processCustomer={listCustomer?.data?.data?.process?.id}
        />
      ),
      quantity: totalScheduleCustomer?.data?.data?.total || 0
    },
    {
      key: 2,
      label: "Báo giá",
      children: <Quotations customerId={Number(params?.slug[1])} />,
      quantity: totalQuoteCustomer?.data?.data?.total || 0
    },
    {
      key: 3,
      label: "Đơn hàng",
      children: <Orders customerId={Number(params?.slug[1])} />,
      quantity: totalOrderCustomer?.data?.data?.total || 0
    },
    {
      key: 4,
      label: "Khiếu nại",
      children: <Complain customerId={Number(params?.slug[1])} />,
      quantity: listCustomerReport?.data?.data?.total || 0
    },
    {
      key: 5,
      label: "Tiềm năng",
      children: (
        <Potential
          customerId={Number(params?.slug[1])}
          processCustomer={listCustomer?.data?.data?.process?.id}
        />
      ),
      quantity: 3
    },
    {
      key: 6,
      label: "Lưu trữ",
      children: (
        <Attachment
          customerId={Number(params?.slug[1])}
          processCustomer={listCustomer?.data?.data?.process?.id}
        />
      ),
      quantity: 3
    },
    {
      key: 7,
      label: "Máy móc",
      children: (
        <InstallBase
          customerId={Number(params?.slug[1])}
          processCustomer={listCustomer?.data?.data?.process?.id}
        />
      ),
      quantity: 3
    },
    {
      key: 8,
      label: "Đánh giá",
      children: <Review customerId={Number(params?.slug[1])} />,
      quantity: customerReviewList?.data?.data?.total || 0
    },
  ];

  const returnTitle = (paramSlug: string) => {
    switch (paramSlug) {
      case "tiem-nang":
        return "Khách hàng tiềm năng";
        break;
      case "don-hang":
        return "Phát triển đơn hàng";
        break;
      case "len-don":
        return "Đã lên đơn";
        break;
      case "cham-soc":
        return "Chăm sóc khách hàng";
        break;
      default:
        return "";
        break;
    }
  };

  const returnItemsTab = (paramSlug: string) => {
    switch (paramSlug) {
      case "tiem-nang":
        return [items[0]];
        break;
      case "don-hang":
        return items?.slice(0, 2);
        break;
      case "len-don":
        return items;
        break;
      case "cham-soc":
        return items?.slice(0, 2);
        break;
      default:
        return null;
        break;
    }
  };

  return (
    <>
      <BreadcrumbFunction
        functionName="Khách hàng"
        title={returnTitle(params?.slug[0])}
        nameFunction={listCustomer?.data?.data?.customerName}
        hasChildFunc={true}
        link="admin/customers"
      />
      <div className="w-full">
        <Tab defaults={items} defaultValue={1} />
      </div>
    </>
  );
}
