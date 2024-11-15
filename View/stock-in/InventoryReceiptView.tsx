"use client";
import Tab from '@/components/Tab';
import React, { useState } from 'react'
import { InventoryReceiptByOrder } from './InventoryReceiptByOrder';
import { InventoryReceiptByProduct } from './InventoryReceiptByProduct';


function InventoryReceiptView() {
  const [reloadProduct, setReloadProduct] = useState<boolean>(false);
  const items = [
    {
      key: 1,
      label: "Đơn hàng",
      children: (
        <InventoryReceiptByOrder setReload={setReloadProduct} reload={reloadProduct} />
      ),
    },
    {
      key: 2,
      label: "Sản phẩm",
      children: (
        <InventoryReceiptByProduct reload={reloadProduct} />
      ),
    },
  ];
  return (
    <Tab handleOnclickTab={() => {}} defaults={items} defaultValue={1} />
  )
}

export default InventoryReceiptView
