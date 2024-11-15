"use client";

import SearchInput from "@/components/SearchInput";
import DateRangePicker from "@/components/datePicker/DateRangePicker";
import FilterModal from "@/components/filterModal/FIlterComponent";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/custom/data-table";
import { QuotationData, filterData } from "@/constants/supply_data";
import { ColumnDef } from "@tanstack/react-table";
import { addDays, format } from "date-fns";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { BsThreeDotsVertical } from "react-icons/bs";
import AddAndUpdateQuotation from "@/View/marketingSales-management/quotations/components/AddAndUpdateQuotation";
import { useQuery } from "@tanstack/react-query";
import {
  getListQuotationRequest,
  getListUserByDepartment,
} from "@/api/quotations";
import Timeline from "@/components/ui/Timeline";
import { useRouter } from "next/navigation";
import Create from "@/components/icons/Create";
import { Button } from "@/components/ui/button";
import { Paginations } from "@/components/Pagination";
import Link from "next/link";
import { getListCustomer } from "@/api/customer";
import * as XLSX from "xlsx";

const initialState = {
  creatorId: [],
  customerId: [],
  saleId: [],
  purchaseId: [],
};

export const Status_Quote = [
  { id: 0, name: "Đã tạo YCBG", color: "#FCAC41" },
  { id: 1, name: "Sale đã gửi YCBG", color: "#ebeb46" },
  { id: 2, name: "Pur đã nhận YCBG", color: "#40e6d5" },
  { id: 3, name: "Sale đã cập nhật YCBG", color: "#e69e40" },
  { id: 4, name: "Pur đã tạo TTHH", color: "#B725FC" },
  { id: 5, name: "Pur đã cập nhật TTHH", color: "#dbe640" },
  { id: 6, name: "Pur đã xuất YCBG", color: "#7ae640" },
  { id: 7, name: "Sale tạo BG", color: "#e34086" },
  { id: 8, name: "Sale xuất BG", color: "#34fa55" },
  { id: 9, name: "Mất đơn", color: "#fa3b34" },
];

export default function QuotationsList() {
  const [functions, setFunctions] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [dataFilter, setDataFilter] = useState(initialState);
  const [openTimeLine, setOpenTimeLine] = useState<boolean>(false);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [user, setUser] = useState<{ department: string; role: string }>();
  const router = useRouter();
  const [quotationData, setQuotationData] = useState<any>();
  const currentDate = new Date();
  currentDate.setDate(1);
  const [date, setDate] = React.useState<DateRange | undefined>({
    // from: currentDate,
    // to: new Date(),
    from: undefined,
    to: undefined,
  });

  const { data: listCustomer } = useQuery({
    queryKey: ["listCustomer"],
    queryFn: () =>
      getListCustomer({
        page: 0,
        pageSize: 100,
        keySearch: "",
        process: [],
      }),
  });

  const { data: listSale } = useQuery({
    queryKey: ["listSale"],
    queryFn: () => getListUserByDepartment("sale"),
  });

  const { data: listPur } = useQuery({
    queryKey: ["listPur"],
    queryFn: () => getListUserByDepartment("purchase"),
  });

  const filterData = [
    {
      id: 1,
      title: "Người tạo",
      data: listSale?.data?.data,
      key: "creatorId",
      displayProps: "userName",
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
      key: "saleId",
      displayProps: "userName",
      placeholder: "Sale phụ trách",
    },
    {
      id: 4,
      title: "Pur phụ trách",
      data: listPur?.data?.data,
      key: "purchaseId",
      displayProps: "userName",
      placeholder: "Pur phụ trách",
    },
  ];

  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    keySearch: string;
    startDate: string;
    endDate: string;
    creatorId: number[];
    customerId: number[];
    saleId: number[];
    purchaseId: number[];
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
    startDate: "",
    endDate: "",
    // startDate: format(currentDate, "yyyy-MM-dd"),
    // endDate: format(new Date(), "yyyy-MM-dd"),
    creatorId: [],
    customerId: [],
    saleId: [],
    purchaseId: [],
  });

  const {
    data: quotationLists,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryFn: () => getListQuotationRequest(pagination),
    queryKey: ["listQuotationRequest", pagination],
  });
  const handleClickCreateTTHH = (id: any) => {
    localStorage.setItem("QuotationID", JSON.stringify(id));
    router.push("create-commodify-info");
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "Mã YCBG",
      header: "Mã YCBG",
      cell: ({ row }) => {
        return (
          <div key={row["index"]} className="capitalize">
            {row.original["RFQ"]}
          </div>
        );
      },
    },
    {
      accessorKey: "Ngày tạo YCBG",
      header: "Ngày tạo YCBG",
      cell: ({ row }) => (
        <div>{format(row.original["createdAt"], "kk:mm dd/MM/yyyy")}</div>
      ),
    },
    {
      accessorKey: "Người tạo",
      header: "Người tạo",
      cell: ({ row }) => <div>{row.original["creatorInfo"]?.fullName}</div>,
    },
    {
      accessorKey: "Khách hàng",
      header: "Khách hàng",
      cell: ({ row }) => {
        return <div>{row.original["Customer"]?.customerName}</div>;
      },
    },
    {
      accessorKey: "Sale phụ trách",
      header: "Sale phụ trách",
      cell: ({ row }) => <div>{row.original["salerInfo"]?.fullName}</div>,
    },
    {
      accessorKey: "Người mua phụ trách",
      header: "Người mua phụ trách",
      cell: ({ row }) => {
        return <div>{row.original["purchaserInfo"]?.fullName}</div>;
      },
    },
    {
      accessorKey: "Hạn phản hồi",
      header: "Hạn phản hồi",
      cell: ({ row }) => (
        <div>
          {row.original["durationFeedback"]
            ? format(row.original["durationFeedback"], "dd/MM/yyyy")
            : ""}
        </div>
      ),
    },
    {
      accessorKey: "Trạng thái",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            style={{
              background: Status_Quote.find(
                (item: { id: number }) =>
                  item.id === row.original["statusQuote"]
              )?.color,
            }}
            onClick={() => {
              setQuotationData(row.original);
              if (row.original["statusQuote"] === 0) {
                localStorage.setItem("rowData", JSON.stringify(row.original));
                router.push("customers/create-quote-request");
              } else {
                setOpenTimeLine(true);
              }
            }}
          >
            <p className="underline cursor-pointer text-center">
              {
                Status_Quote.find(
                  (item: { id: number }) =>
                    item.id === row.original["statusQuote"]
                )?.name
              }
            </p>
          </Badge>
        </div>
      ),
    },
    {
      id: "id",
      header: "",
      cell: ({ row }) => {
        // return (
        //   // <div className="relative">
        //   //   <BsThreeDotsVertical
        //   //     className="cursor-pointer"
        //   //     size={20}
        //   //     onClick={() => {
        //   //       setFunctions(!functions);
        //   //       setQuotationId(row.original["id"]);
        //   //     }}
        //   //   />
        //   //   {functions && quotationId === row.original["id"] && (
        //   //     <div className="flex bg-white z-50 flex-row items-center justify-between absolute right-2 top-[-35px] py-1 shadow-md rounded-sm">
        //   //       <div className="px-2 py-1 cursor-pointer border-r-2 border-[##E2E2E2]">
        //   //         <div
        //   //           className="hover:animate-bounce"
        //   //           onClick={() => {
        //   //             handleClickCreateTTHH(quotationId);
        //   //           }}
        //   //         >
        //   //           <Create height="20" width="20" />
        //   //         </div>
        //   //       </div>
        //   //       {/* <div className="px-2 py-1 cursor-pointer border-r-2 border-[##E2E2E2]">
        //   //         <div className="hover:animate-bounce">
        //   //           <Print width="20" height="20" />
        //   //         </div>
        //   //       </div> */}
        //   //       <div className="px-2 py-1 cursor-pointer border-r-2 border-[##E2E2E2]">
        //   //         <div className="hover:animate-bounce">
        //   //           <Edit width="20" height="20" />
        //   //         </div>
        //   //       </div>
        //   //       <div className="px-2 py-1 cursor-pointer">
        //   //         <div className="hover:animate-bounce">
        //   //           <Delete width="20" height="20" />
        //   //         </div>
        //   //       </div>
        //   //     </div>
        //   //   )}
        //   // </div>

        // );
        if (
          row.original["Timelines"].find(
            (item: { status: string }) => item.status === "6"
          ) &&
          (user?.department === "purchase" || user?.role === "admin")
        ) {
          return (
            <button
              className="bg-black px-2 pv-2 rounded-lg"
              style={{ fontSize: "10px", color: "white" }}
              onClick={() =>
                (window.location.href = `quote-requirement/create-goods/${row.original["id"]}`)
              }
            >
              Tạo TTHH
            </button>
          );
        } else {
          return "";
        }
      },
    },
  ];
  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      RFQ: item?.RFQ,
      createdAt: format(item?.createdAt, "kk:mm dd/MM/yyyy"),
      creatorInfo: item?.creatorInfo?.fullName,
      customerName: item?.Customer?.customerName,
      saleInfo: item?.salerInfo?.fullName,
      purchaserInfo: item?.purchaserInfo?.fullName,
      durationFeedback: item?.durationFeedback
        ? format(item?.durationFeedback, "dd/MM/yyyy")
        : "",
      status: Status_Quote.find(
        (el: { id: number }) => el.id === item?.statusQuote
      )?.name,
    }));
    const heading = [
      [
        "Mã YCBG",
        "Ngày tạo YCBG",
        "Người tạo",
        "Khách hàng",
        "Sale phụ trách",
        "Người mua phụ trách",
        "Hạn phản hồi",
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
    XLSX.utils.book_append_sheet(workbook, ws, `Dữ liệu yêu cầu báo giá`);
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `yeu-cau-bao-gia.xlsx`);
  };
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userJson = JSON.parse(userData);
      setUser(userJson);
    }
  }, []);

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

  return (
    <div>
      <div
        className="flex justify-between w-full mb-2"
        onClick={() => setFunctions(false)}
      >
        <div className="flex justify-between items-center">
          <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm báo giá"
          />
        </div>
        <div className="flex">
          <div className="mr-2">
            <DateRangePicker date={date} setDate={setDate} />
          </div>
          <Button
            onClick={() =>
              quotationLists?.data &&
              handleExportExcel(quotationLists?.data.data.results)
            }
            className="mr-2"
            variant={"outline"}
          >
            Xuất Excel
          </Button>
          <FilterModal
            dataFilter={dataFilter}
            setDataFilter={setDataFilter}
            filterArray={filterData}
            pagination={pagination}
            setPagination={setPagination}
          />
          {/* <AddAndUpdateQuotation /> */}
        </div>
      </div>
      <DataTable
        data={quotationLists?.data ? quotationLists?.data.data?.results : []}
        columns={columns}
      />
      <div className="mt-5 flex justify-end">
        <Paginations
          currentPage={pagination.page}
          pageCount={quotationLists?.data?.data?.numberPages}
          pagination={pagination}
          setPagination={setPagination}
          onPageChange={(value: number) =>
            setPagination({ ...pagination, page: value })
          }
        />
      </div>
      <Timeline
        data={quotationData ? quotationData : []}
        open={openTimeLine}
        setOpen={setOpenTimeLine}
        setIsDialogOpen={setIsOpenDialog}
        id={quotationData?.id}
        refetch={refetch}
        isOpenDialog={isOpenDialog}
        setIsOpenDialog={setIsOpenDialog}
        setOpenTimeLine={setOpenTimeLine}
      />
    </div>
  );
}
