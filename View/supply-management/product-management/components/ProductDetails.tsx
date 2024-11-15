"use client"

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IoText } from "react-icons/io5";
import { FaSortAmountDown } from "react-icons/fa";
import { CiBarcode } from "react-icons/ci";
import { FaAudioDescription, FaUnity } from "react-icons/fa6";
import { IoIosBusiness } from "react-icons/io";
import { LuFileType2 } from "react-icons/lu";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import Print from "@/components/icons/Print";
import { Paginations } from "@/components/Pagination";
import { format } from "date-fns";

interface DocumentBody {
  name: string;
  code: string;
  supplier: number;
  priceSupplier: string;
  price: number;
  unit: string;
  productType: string;
}

const initialState = {
  name: "",
  code: "",
  supplier: 0,
  priceSupplier: "",
  price: 0,
  unit: "",
  productType: "",
};

interface PropsType {
  productDetail: any;
  open: boolean;
  setOpen: (value: boolean) => void;
}

interface ProductUI {
  id: number;
  icon: React.JSX.Element;
  title: string;
  key: string;
}

const productInforUi = [
  { id: 1, icon: <CiBarcode size={20} />, title: "Mã", key: "productCode" },
  { id: 2, icon: <IoText size={20} />, title: "Tên", key: "productName" },
  {
    id: 3,
    icon: <FaAudioDescription size={20} />,
    title: "Mô tả",
    key: "describe",
  },
  {
    id: 4,
    icon: <IoIosBusiness size={20} />,
    title: "Nhà sản xuất",
    key: "producerInfo",
  },
  { id: 5, icon: <FaUnity size={20} />, title: "Đơn vị tính", key: "unit" },
  {
    id: 6,
    icon: <LuFileType2 size={20} />,
    title: "Loại hình",
    key: "type",
  },
  {
    id: 7,
    icon: <FaSortAmountDown size={20} />,
    title: "M.O.Q",
    key: "MMQ",
  },
];

export default function ProductDetails(props: PropsType) {
  const { productDetail, open, setOpen } = props;

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const pageCount = productDetail?.Quote_Histories ? Math.ceil(productDetail?.Quote_Histories?.length / pageSize) : 0;
  const currentData = productDetail?.Quote_Histories?.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const columns: ColumnDef<any>[] = [
    {
      id: "STT",
      header: "STT",
      cell: ({ row }) =>
        <div className="capitalize">
          {row["index"] + 1 + currentPage * pageSize}
        </div>
      ,
    },
    {
      accessorKey: "code",
      header: "Số BG",
      cell: ({ row }) => <div>{row.original?.Quotation["code"]}</div>,
    },
    {
      accessorKey: "createdAt",
      header: "Ngày BG",
      cell: ({ row }) => <div>{format(row.original["createdAt"], "dd/MM/yyyy HH:mm")}</div>,
    },
    {
      accessorKey: "priceTerm",
      header: "Đơn giá",
      cell: ({ row }) => <div>{row.original?.PurchaseOrderProduct?.PurchaseOrder["priceTerm"]}</div>,
    },
    {
      accessorKey: "quantity",
      header: "SL",
      cell: ({ row }) => {
        return <div>{row.original["quantity"]}</div>;
      },
    },
    {
      accessorKey: "customerName",
      header: "Tên KH",
      cell: ({ row }) => <div>{row.original?.Quotation?.Customer["customerName"]}</div>,
    },
    {
      accessorKey: "POCode",
      header: "Số PO",
      cell: ({ row }) => {
        return <div>{row.original?.PurchaseOrderProduct?.PurchaseOrder["POCode"]}</div>;
      },
    },
    {
      // Cấm xóa column này
      id: "action",
      header: ""
    }
  ];

  const renderProductProps = (key: string, productData: any) => {
    if (key === "producerInfo") {
      return productData[key]?.name;
    } else {
      return productData[key];
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger>
        <div >
          <Print width="20" height="20" />
        </div>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px] md:max-w-[950px] max-h-[600px] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Thông tin sản phẩm</DialogTitle>
        </DialogHeader>
        {productDetail ? (
          <div>
            <div className="grid grid-cols-1 gap-2 py-4 w-full">
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="w-full">
                  <img
                    src={
                      productDetail.image
                        ? productDetail.image
                        : "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"
                    }
                    className="w-full h-[350px]"
                    alt="product image"
                  />
                </div>
                <div className="flex flex-col w-full px-3">
                  {productInforUi.map((item: ProductUI) => (
                    <div className="flex items-center justify-between mb-4 w-full">
                      <div className="flex">
                        {item.icon}
                        <h5 className="text-[15px] font-bold ml-2 underline">
                          {item.title}:
                        </h5>
                      </div>
                      <div className="w-3/5 flex justify-end">
                        <span className="text-[14px] text-right">
                          {renderProductProps(item.key, productDetail)?.length >
                            30
                            ? renderProductProps(
                              item.key,
                              productDetail
                            )?.slice(0, 30) + "..."
                            : renderProductProps(item.key, productDetail)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[15px] font-bold underline mb-2">
                  Lịch sử báo giá:
                </p>
                <DataTable data={currentData || []} columns={columns} />
                <div className="mt-5 flex justify-end">
                  <Paginations
                    currentPage={currentPage}
                    pageCount={pageCount}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <h1>Không có dữ liệu báo giá</h1>
        )}
      </DialogContent>
    </Dialog>
  );
}
