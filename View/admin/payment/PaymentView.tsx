"use client";
import React from "react";

import { PaymentMethod } from "./PaymentMethod";
import Tab from "@/components/Tab";
import { BankAccount } from "./BankAccount";
import { PaymentCategory } from "./PaymentCategory";
import { getBankAccount, getPaymentCategory, getPaymentMethod } from "@/api/payment";
import { useQuery } from "@tanstack/react-query";

export function PaymentView() {

  const {
    data: bankAccountList
  } = useQuery({ queryKey: ["bankAccountList"], queryFn: getBankAccount });

  const {
    data: paymentMethodList
  } = useQuery({ queryKey: ["paymentMethodList"], queryFn: getPaymentMethod });

  const {
    data: paymentCategoryList
} = useQuery({
    queryKey: ["paymentCategoryList"],
    queryFn: () => getPaymentCategory({
      page: 0,
      pageSize: 10,
  })
});

  const items = [
    {
      key: 1,
      label: "Tài khoản ngân hàng",
      children: <BankAccount />,
      quantity: bankAccountList?.data?.length 
    },
    {
      key: 2,
      label: "Điều kiện thanh toán",
      children: <PaymentMethod />,
      quantity: paymentMethodList?.data?.length
    },
    {
      key: 3,
      label: "Danh mục thanh toán",
      children: <PaymentCategory />,
      quantity: paymentCategoryList?.data?.total
    },
  ];

  return (
    <>
      <Tab defaults={items} defaultValue={1} />
    </>
  );
}
