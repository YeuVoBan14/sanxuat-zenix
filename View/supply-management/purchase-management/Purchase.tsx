"use client";
import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { getListPurchase } from "@/api/purchase";
import { Paginations } from "@/components/Pagination";
import DateRangePicker from "@/components/datePicker/DateRangePicker";
import TimelinePurchase from "@/components/ui/TimeLinePurchase";
import { DateRange } from "react-day-picker";
import { Status_Order } from "@/constants/purchase_data";
import { Badge } from "@/components/ui/badge";
import ErrorViews from "@/components/ErrorViews";
import LoadingView from "@/components/LoadingView";
import FilterModal from "@/components/filterModal/FIlterComponent";
import { getListUserByDepartment } from "@/api/quotations";
import { getListCustomer } from "@/api/customer";
import { getSupplierList } from "@/api/supply";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

const initialState = {
  creator: [],
  customer: [],
  sale: [],
  supplier: [],
};

export default function Purchase() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [openTimeLine, setOpenTimeLine] = useState<boolean>(false);
  const [quotationData, setQuotationData] = useState<any>();
  const [dataFilter, setDataFilter] = useState(initialState);
  const currentDate = new Date();
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
    creator: number[];
    customer: number[];
    sale: number[];
    supplier: number[];
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
    startDate: format(currentDate, "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    creator: [],
    customer: [],
    sale: [],
    supplier: [],
  });
  const memoizedPagination = React.useMemo(() => pagination, [pagination]);

  const {
    data: listPurchase,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["listPurchase", memoizedPagination],
    queryFn: () => getListPurchase(memoizedPagination),
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

  const { data: supplierList } = useQuery({
    queryKey: ["supplierList"],
    queryFn: () =>
      getSupplierList({
        page: 0,
        pageSize: 9999999999,
        keySearch: "",
      }),
  });

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, keySearch: searchValue, page: 0 });
    }, 500);
    return () => clearTimeout(timeId);
  }, [searchValue]);

  useEffect(() => {
    if (date?.from && date?.to) {
      setPagination({
        ...pagination,
        startDate: format(date?.from, "yyyy-MM-dd"),
        endDate: format(date?.to, "yyyy-MM-dd"),
      });
    }
  }, [date]);

  const filterData = [
    {
      id: 1,
      title: "Người tạo",
      data: listSale?.data?.data,
      key: "creator",
      displayProps: "fullName",
      placeholder: "Người tạo",
    },
    {
      id: 2,
      title: "Khách hàng",
      data: listCustomer?.data?.data?.customers,
      key: "customer",
      displayProps: "customerName",
      placeholder: "Khách hàng",
    },
    {
      id: 3,
      title: "Sale phụ trách",
      data: listSale?.data?.data,
      key: "sale",
      displayProps: "fullName",
      placeholder: "Sale phụ trách",
    },
    {
      id: 4,
      title: "Nhà cung cấp",
      data: supplierList?.data?.results,
      key: "supplier",
      displayProps: "name",
      placeholder: "Nhà cung cấp",
    },
  ];

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
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <div>
          {format(new Date(row.original?.createdAt), "dd/MM/yyyy HH:mm")}
        </div>
      ),
    },
    {
      accessorKey: "codeOrder",
      header: "Mã đơn hàng",
      cell: ({ row }) => <div>{row.original?.Order?.Quotation?.code}</div>,
    },
    {
      accessorKey: "POCode",
      header: "Số PO",
      cell: ({ row }) => <div>{row.original?.POCode}</div>,
    },
    {
      accessorKey: "customerName",
      header: "Tên KH",
      cell: ({ row }) => {
        return <div>{row.original?.Order?.Customer?.customerName}</div>;
      },
    },
    {
      accessorKey: "saleInfo",
      header: "Sale phụ trách",
      cell: ({ row }) => <div>{row.original?.Order?.saleInfo?.fullName}</div>,
    },
    {
      accessorKey: "timePurResponse",
      header: "Thời gian Pur phản hồi",
      cell: ({ row }) => {
        const date = row.original?.Order?.timePurResponse;
        const parsedDate = date ? parseISO(date) : null;
        return (
          <div>{parsedDate ? format(parsedDate, "dd/MM/yyyy HH:mm") : ""}</div>
        );
      },
    },
    {
      accessorKey: "statusNameOrder",
      header: "Trạng thái",
      cell: ({ row }) => {
        return (
          <Badge
            style={{
              background: Status_Order.find(
                (item: { id: number }) =>
                  item.id === row.original?.Order?.statusCodeOrder
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
                  item.id === row.original?.Order?.statusCodeOrder
              )?.name
            }
          </Badge>
        );
      },
    },
    {
      id: "action",
      header: "",
    },
  ];
  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      createdAt: format(new Date(item?.createdAt), "dd/MM/yyyy HH:mm"),
      codeOrder: item?.Order?.Quotation?.code,
      POCode: item?.POCode,
      customerName: item?.Order?.Customer?.customerName,
      saleInfo: item?.Order?.saleInfo?.fullName,
      timePurResponse: item?.Order?.timePurResponse
        ? format(new Date(item?.Order?.timePurResponse), "dd/MM/yyyy HH:mm")
        : "",
      statusCodeOrder: Status_Order.find(
        (ele: { id: number }) => ele.id === item?.Order?.statusCodeOrder
      )?.name,
    }));
    const heading = [
      [
        "Ngày tạo",
        "Mã đơn hàng",
        "Số PO",
        "Tên khách hàng",
        "Sale phụ trách",
        "Thời gian pur phản hồi",
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
    XLSX.utils.book_append_sheet(workbook, ws, `Dữ liệu mua hàng`);
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `mua-hang.xlsx`);
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
            placeholder="Tìm kiếm đơn mua hàng"
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
              listPurchase?.data?.data?.purchaseOrders &&
              handleExportExcel(listPurchase?.data?.data?.purchaseOrders)
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
            data={listPurchase?.data?.data?.purchaseOrders || []}
            columns={columns}
          />
          <div className="mt-5 flex justify-end">
            <Paginations
              currentPage={pagination.page}
              pageCount={listPurchase?.data?.data?.numberPages}
              pagination={pagination}
              setPagination={setPagination}
              onPageChange={(value: number) =>
                setPagination({ ...pagination, page: value })
              }
            />
          </div>
          <TimelinePurchase
            timeLineData={quotationData?.Order || []}
            purchaseOrderId={quotationData?.id}
            open={openTimeLine}
            setOpen={setOpenTimeLine}
          />
        </>
      )}
    </div>
  );
}
