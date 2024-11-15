"use client";

import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import UpdateOrder from "./components/UpdateOrder";
import { useQuery } from "@tanstack/react-query";
import { getListOrder, postExportOrder } from "@/api/order";
import OrderList from "./OrderList";
import { Paginations } from "@/components/Pagination";
import { format } from "date-fns";
import OrderHistory from "./OrderHistory";
import LossOfAplication from "./components/LossOfAplication";
import DateRangePicker from "@/components/datePicker/DateRangePicker";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import FilterModal from "@/components/filterModal/FIlterComponent";
import { getListUserByDepartment } from "@/api/quotations";
import { getListCustomer } from "@/api/customer";
import LoadingView from "@/components/LoadingView";
import ErrorViews from "@/components/ErrorViews";
import axios from "axios";
import TimelinePurchase from "@/components/ui/TimeLinePurchase";
import { Status_Order } from "@/constants/purchase_data";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

const initialState = {
  creatorId: [],
  customerId: [],
  salerId: [],
};

export default function Orders() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [dataFilter, setDataFilter] = useState(initialState);
  const [openTimeLine, setOpenTimeLine] = useState<boolean>(false);
  const [quotationData, setQuotationData] = useState<any>();
  const currentDate = new Date();
  const [purchaseId, setPurchaseId] = useState<number>();
  currentDate.setDate(1);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: currentDate,
    to: new Date(),
  });

  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    keySearch: string;
    startDate: string;
    endDate: string;
    salerId: number[];
    customerId: number[];
    creatorId: number[];
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
    startDate: format(currentDate, "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    salerId: [],
    customerId: [],
    creatorId: [],
  });
  const memoizedPagination = React.useMemo(() => pagination, [pagination]);

  // const { data: exportOrder } = useQuery({
  //     queryKey: ["postExportOrder", purchaseId],
  //     queryFn: () => postExportOrder(Number(purchaseId)),
  //     enabled: !!purchaseId,
  // });

  const handleDownloadFile = (url: string) => {
    // Thực hiện request để tải file
    if (url) {
      const urlArr = url.split("mega/");
      axios({
        url: url, // URL endpoint để tải file
        method: "GET",
        responseType: "blob", // Chỉ định kiểu dữ liệu là blob
      }).then((response) => {
        // Tạo một đường dẫn URL từ blob và tải xuống
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", urlArr[1]); // Tên file muốn tải xuống
        document.body.appendChild(link);
        link.click();
      });
    }
  };

  // useEffect(() => {
  //     if (purchaseId && exportOrder) {
  //         handleDownloadFile(exportOrder?.data?.data);
  //     }
  // }, [exportOrder]);

  const {
    data: orderList,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["listOrder", memoizedPagination],
    queryFn: () => getListOrder(memoizedPagination),
  });

  const { data: listSale } = useQuery({
    queryKey: ["listSale"],
    queryFn: () => getListUserByDepartment("sale"),
  });

  const { data: listCustomer } = useQuery({
    queryKey: ["listCustomer"],
    queryFn: () =>
      getListCustomer({
        page: 0,
        pageSize: 10000,
        keySearch: "",
        process: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"],
      }),
  });

  const filterData = [
    {
      id: 1,
      title: "Người tạo",
      data: listSale?.data?.data,
      key: "creatorId",
      displayProps: "fullName",
      placeholder: "Người tạo",
    },
    {
      id: 2,
      title: "Khách hàng",
      data: listCustomer?.data?.data?.customers,
      key: "customerId",
      displayProps: "customerName",
      placeholder: "Khách hàng",
    },
    {
      id: 3,
      title: "Sale phụ trách",
      data: listSale?.data?.data,
      key: "salerId",
      displayProps: "fullName",
      placeholder: "Sale phụ trách",
    },
  ];

  useEffect(() => {
    if (date?.from && date?.to) {
      setPagination({
        ...pagination,
        startDate: format(date?.from, "yyyy-MM-dd"),
        endDate: format(date?.to, "yyyy-MM-dd"),
      });
    }
  }, [date]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, keySearch: searchValue, page: 0 });
    }, 500);
    return () => clearTimeout(timeId);
  }, [searchValue]);

  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "STT",
      cell: ({ row }) => {
        return (
          <div key={row["index"]} className="capitalize">
            {row["index"] + 1 + pagination.page * pagination.pageSize}
          </div>
        );
      },
    },
    {
      accessorKey: "code",
      header: "Số BG",
      cell: ({ row }) => {
        const statusInfos = (quote_code: string, status: number, row: any) => {
          switch (status) {
            case 0:
              return (
                <OrderList orderData={row.original} quote_code={quote_code} />
              );
            case 1:
              return <div>{quote_code}</div>;
            case 2:
              return (
                <UpdateOrder dataList={row.original} quote_code={quote_code} />
              );
            case 3:
              return (
                <OrderHistory dataList={row.original} quote_code={quote_code} />
              );
            case 4:
              return <div>{quote_code}</div>;
            case 5:
              return (
                <LossOfAplication
                  dataList={row.original}
                  quote_code={quote_code}
                />
              );
            case 6:
              return <div>{quote_code}</div>;
            default:
              return null;
          }
        };
        const statusContent = statusInfos(
          row.original?.Quotation["code"],
          row.original.statusCodeOrder,
          row
        );
        return <div className="text-sm">{statusContent}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo BG",
      cell: ({ row }) => (
        <div>
          {format(row.original?.Quotation?.createdAt, "dd/MM/yyyy HH:mm")}
        </div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Tên KH",
      cell: ({ row }) => {
        return <div>{row.original?.Customer?.customerName}</div>;
      },
    },
    {
      accessorKey: "fullName",
      header: "Sale phụ trách",
      cell: ({ row }) => <div>{row.original?.saleInfo["fullName"]}</div>,
    },
    {
      accessorKey: "phoneNumber",
      header: "Số điện thoại",
      cell: ({ row }) => {
        return <div>{row.original?.Customer["phoneNumber"]}</div>;
      },
    },
    {
      accessorKey: "timePurResponse",
      header: "Ngày Pur phản hồi",
      cell: ({ row }) => {
        return (
          <div>
            {format(
              new Date(row.original?.timePurResponse),
              "dd/MM/yyyy HH:mm"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "statusInfo",
      header: "Trạng thái",
      cell: ({ row }) => {
        return (
          <Badge
            style={{
              background: Status_Order.find(
                (item: { id: number }) =>
                  item.id === row.original.statusCodeOrder
              )?.color,
            }}
            onClick={() => {
              setQuotationData(row.original);
              setOpenTimeLine(true);
            }}
          >
            {
              Status_Order.find(
                (item: { id: number }) =>
                  item.id === row.original.statusCodeOrder
              )?.name
            }
          </Badge>
        );
      },
    },
    {
      id: "id",
      cell: ({ row }) => {
        const allTrue = row.original?.OrderProducts?.map(
          (item: any) => item?.statusExport
        )?.every((status: any) => status === true);

        return (
          <div className="flex justify-end gap-1">
            {/* <Badge onClick={() => setPurchaseId(row.original?.id)}>In</Badge> */}
            {(user?.role === "admin" || user?.department === "purchase") &&
              allTrue !== true && (
                <Badge
                  onClick={() =>
                    router.push(
                      "/admin/purchase/order-request/" + row.original["id"]
                    )
                  }
                >
                  Mua hàng
                </Badge>
              )}
          </div>
        );
      },
    },
  ];

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      code: item?.Quotation["code"],
      createdAt: format(item?.Quotation?.createdAt, "dd/MM/yyyy HH:mm"),
      customerName: item?.Customer?.customerName,
      saleInfo: item?.saleInfo?.fullName,
      phoneNumber: item?.Customer?.phoneNumber,
      timePurResponse: format(
        new Date(item?.timePurResponse),
        "dd/MM/yyyy HH:mm"
      ),
      status: Status_Order.find(
        (ele: { id: number }) => ele.id === item.statusCodeOrder
      )?.name,
    }));
    const heading = [
      [
        "Số báo giá",
        "Ngày tạo báo giá",
        "Tên khách hàng",
        "Sale phụ trách",
        "Số điện thoại",
        "Ngày pur phản hồi",
        "Trạng thái",
      ],
    ];
    // Create Excel workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, heading);
    XLSX.utils.sheet_add_json(ws, dataToExport, {
      origin: "A2",
      skipHeader: true,
    });
    // const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, ws, `Dữ liệu bán háng`);
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `ban-hang.xlsx`);
  };

  if (error instanceof Error && "response" in error) {
    const status = (error as any).response?.status;
    const type = (error as any).response?.type;
    const statusText = (error as any).response?.statusText;
    const message = (error as any).response?.data?.message;
    return (
      <ErrorViews
        status={status}
        statusText={statusText}
        message={message}
        type={type}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between w-full mb-2">
        <div className="flex justify-between items-center">
          <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm số báo giá"
          />
        </div>
        <div className="flex gap-2">
          <DateRangePicker date={date} setDate={setDate} />
          <FilterModal
            dataFilter={dataFilter}
            setDataFilter={setDataFilter}
            filterArray={filterData}
            pagination={pagination}
            setPagination={setPagination}
          />
          <Button
            onClick={() =>
              orderList?.data?.data?.results &&
              handleExportExcel(orderList?.data?.data?.results)
            }
            // className="ml-2"
            variant={"default"}
          >
            Xuất Excel
          </Button>
        </div>
      </div>
      {isLoading ? (
        <LoadingView />
      ) : (
        <>
          <DataTable
            data={orderList?.data?.data?.results || []}
            columns={columns}
          />
          <div className="mt-5 flex justify-end">
            <Paginations
              currentPage={pagination.page}
              pageCount={orderList?.data?.data?.numberPages}
              pagination={pagination}
              setPagination={setPagination}
              onPageChange={(value: number) =>
                setPagination({ ...pagination, page: value })
              }
            />
          </div>
          <TimelinePurchase
            timeLineData={quotationData || []}
            open={openTimeLine}
            purchaseOrderId={quotationData?.id}
            setOpen={setOpenTimeLine}
          />
        </>
      )}
    </div>
  );
}
