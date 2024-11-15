"use client";

import SearchInput from "@/components/SearchInput";
import DateRangePicker from "@/components/datePicker/DateRangePicker";
import FilterModal from "@/components/filterModal/FIlterComponent";
import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getListQuotationByUser,
  getListUserByDepartment,
  updateFileBG,
} from "@/api/quotations";
import Timeline from "@/components/ui/Timeline";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateOrder from "./components/CreateOrder";
import { getListCustomer } from "@/api/customer";
import { Paginations } from "@/components/Pagination";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

const initialState = {
  userCreatedId: [],
  customerId: [],
  saleId: [],
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
  const [quotationId, setQuotationId] = useState(0);
  const [searchValue, setSearchValue] = useState<string>("");
  const [statusKey, setStatusKey] = useState<string>("");
  const [openFile, setOpenFile] = useState<boolean>(false);
  const [dataFilter, setDataFilter] = useState(initialState);
  const [openTimeLine, setOpenTimeLine] = useState<boolean>(false);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [idQuotation, setIdQuotation] = useState<number>(0);
  const router = useRouter();
  const [quotationData, setQuotationData] = useState<any>();
  const currentDate = new Date();
  currentDate.setDate(1);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: currentDate,
    to: new Date(),
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

  const filterData = [
    {
      id: 1,
      title: "Người tạo",
      data: listSale?.data?.data,
      key: "userCreatedId",
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
  ];

  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    keySearch: string;
    startDate: string;
    endDate: string;
    userCreatedId: number[];
    customerId: number[];
    saleId: number[];
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
    startDate: format(currentDate, "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    userCreatedId: [],
    customerId: [],
    saleId: [],
  });

  const {
    data: quotationLists,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryFn: () => getListQuotationByUser(pagination),
    queryKey: ["listQuotationByUser", pagination],
  });

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    refetch();
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

  const columns: ColumnDef<any>[] = [
    {
      id: "Số BG",
      header: "Số BG",
      cell: ({ row }) => {
        return (
          <div key={row["index"]} className="capitalize">
            {row.original["code"]}
          </div>
        );
      },
    },
    {
      accessorKey: "Ngày tạo BG",
      header: "Ngày tạo BG",
      cell: ({ row }) => (
        <div>{format(row.original["createdAt"], "kk:mm dd/MM/yyyy")}</div>
      ),
    },
    {
      accessorKey: "Tên khách hàng",
      header: "Tên khách hàng",
      cell: ({ row }) => <div>{row.original["Customer"]?.customerName}</div>,
    },
    {
      accessorKey: "Sale phụ trách",
      header: "Sale phụ trách",
      cell: ({ row }) => {
        return <div>{row.original["saleInfo"]?.fullName}</div>;
      },
    },
    {
      accessorKey: "Số điện thoại",
      header: "Số điện thoại",
      cell: ({ row }) => <div>{row.original["Customer"]?.phoneNumber}</div>,
    },
    {
      accessorKey: "Email",
      header: "Email",
      cell: ({ row }) => {
        return <div>{row.original["Customer"]?.email}</div>;
      },
    },
    {
      accessorKey: "Theo quy trình",
      header: "Theo quy trình",
      cell: ({ row }) => (
        <div>{row.original["quoteRequirementId"] ? "Có" : "Không"}</div>
      ),
    },
    {
      accessorKey: "Admin duyệt",
      header: "Admin duyệt",
      cell: ({ row }) => {
        return row.original["isAdminAccept"] !== null ? (
          <Badge
            style={{
              background: row.original["isAdminAccept"] ? "#34fa55" : "#fa3b34",
            }}
          >
            <p className="text-xs text-center">
              {row.original["isAdminAccept"] ? "Đã duyệt" : "Không duyệt"}
            </p>
          </Badge>
        ) : (
          <Badge
            style={{
              background: "#ebeb46",
              color: "black",
            }}
            onClick={() =>
              (window.location.href = `quotation/history-quotation/${row.original["id"]}`)
            }
          >
            <p className="text-black text-xs text-center">{"Chờ duyệt"}</p>
          </Badge>
        );
      },
    },
    {
      accessorKey: "Trạng thái",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original["quoteRequirementId"] ? (
            <p
              onClick={() => {
                setQuotationId(row.original["id"]);
                setQuotationData(row.original["quoteRequirement"]);
                setOpenTimeLine(true);
              }}
              style={{ color: "#FCAC41" }}
              className="cursor-pointer text-center hover:underline"
            >
              {row.original["statusQuotationName"]}
            </p>
          ) : (
            <Link
              style={{ color: "#FCAC41" }}
              className="cursor-pointer text-center hover:underline"
              href={`quotation/history-quotation/${row.original["id"]}`}
            >
              {row.original["statusQuotationName"]}
            </Link>
          )}
        </div>
      ),
    },
    {
      id: "id",
      header: "",
      cell: ({ row }) => {
        // return <CreateOrder dataList={row.original} />;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={"sm"}>File</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    row.original["fileEnd"] &&
                    window.open(row.original["fileEnd"], "_blank")
                  }
                  disabled={row.original["fileEnd"] ? false : true}
                >
                  <p>Xem file</p>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setOpenFile(true);
                    setIdQuotation(row.original["id"]);
                  }}
                >
                  <p>Cập nhật file</p>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          // <div onClick={() => setIdQuotation(row.original["id"])}>
          //   <UpdateFileQuotation id={idQuotation} refetch={refetch} />
          // </div>
        );
      },
    },
    {
      id: "id",
      header: "",
      cell: ({ row }) => {
        // return <CreateOrder dataList={row.original} />;
        return (
          <Badge
            className="whitespace-nowrap text-ellipsis p-2 m-auto items-center border rounded-md bg-black text-white cursor-pointer"
            onClick={() =>
              router.push("quotation/create-order/" + row.original["id"])
            }
          >
            Tạo đơn
          </Badge>
        );
      },
    },
  ];
  const dropdownMenu = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"default"}
            onClick={() => setIsOpenDialog(true)}
            className="ml-2"
          >
            Tạo báo giá
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <Link href={"quotation/create-quick-quotation/da"}>
              <DropdownMenuItem className="cursor-pointer">
                <p>Dự án</p>
              </DropdownMenuItem>
            </Link>
            <Link href={"quotation/create-quick-quotation/th"}>
              <DropdownMenuItem className="cursor-pointer">
                <p>Tiêu hao</p>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      code: item?.code,
      createdAt: format(item?.createdAt, "kk:mm dd/MM/yyyy"),
      customerName: item?.Customer?.customerName,
      saleInfo: item?.saleInfo?.fullName,
      phoneNumber: item?.Customer?.phoneNumber,
      email: item?.Customer?.email,
      quoteRequirementId: item?.quoteRequirementId ? "Có" : "Không",
      isAdminAccept:
        item?.isAdminAccept !== null
          ? item?.isAdminAccept
            ? "Đã duyệt"
            : "Không duyệt"
          : "Chờ duyệt",
      statusQuotationName: item?.statusQuotationName,
    }));
    const heading = [
      [
        "Số báo giá",
        "Ngày tạo báo giá",
        "Tên khách hàng",
        "Sale phụ trách",
        "Số điện thoại",
        "Email",
        "Theo quy trình",
        "Admin duyệt",
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
    XLSX.utils.book_append_sheet(workbook, ws, `Dữ liệu báo giá`);
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `bao-gia.xlsx`);
  };
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
          <FilterModal
            dataFilter={dataFilter}
            setDataFilter={setDataFilter}
            filterArray={filterData}
            pagination={pagination}
            setPagination={setPagination}
          />
          <Button
            onClick={() =>
              quotationLists?.data &&
              handleExportExcel(quotationLists?.data.data.results)
            }
            className="ml-2"
            variant={"outline"}
          >
            Xuất Excel
          </Button>
          {/* <AddAndUpdateQuotation /> */}
          {dropdownMenu()}
        </div>
      </div>
      <DataTable
        data={quotationLists?.data ? quotationLists?.data.data.results : []}
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
        quotationId={quotationId}
      />
      <UpdateFileQuotation
        open={openFile}
        setOpen={setOpenFile}
        id={idQuotation}
        refetch={refetch}
      />
    </div>
  );
}

export function UpdateFileQuotation({
  id,
  refetch,
  open,
  setOpen,
}: {
  id?: number;
  refetch: any;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [fileQuotation, setFileQuotation] = useState<File | undefined>();

  const mutation = useMutation({
    mutationFn: updateFileBG,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listQuotation"],
      });
      setOpen(false);
      refetch();
      toast({
        title: "Thành công",
        description: `Cập nhật file báo giá thành công`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  const handleChangeFile = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFileQuotation(file);
    }
  };

  const handleUploadFile = (file: any, id: number) => {
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
      mutation.mutate({ formData: formData, id: id });
    } else {
      toast({
        title: "Thất bại",
        description: `Bạn cần tải file lên trước khi cập nhật file báo giá`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px] mx-auto overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Cập nhật file báo giá</DialogTitle>
        </DialogHeader>
        <div>
          <div className="mt-2 mb-4">
            <Input type="file" onChange={handleChangeFile} id="picture" />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="default"
              disabled={mutation.isPending}
              onClick={() => id && handleUploadFile(fileQuotation, id)}
            >
              {mutation.isPending && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Cập nhật
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
