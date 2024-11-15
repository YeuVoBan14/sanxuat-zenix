"use client";
import SearchInput from "@/components/SearchInput";
import Delete from "@/components/icons/Delete";

import { DataTable } from "@/components/ui/custom/data-table";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { FaUserPlus } from "react-icons/fa6";
import { toast } from "@/components/ui/use-toast";
import {
  deleteCustumer,
  deleteUserPermission,
  getListCustomer,
  getUserPermission,
  postUserPermission,
  updateCustomerProcess,
  updateLevelPermission,
  updateStatus,
} from "@/api/customer";
import CreateCustomer from "./components/CreateCustomer";
import EditCustomer from "./components/EditCustomer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Paginations } from "@/components/Pagination";
import { AlertDialogForm } from "@/components/AlertDialogForm";
import { useRouter } from "next/navigation";
import Create from "@/components/icons/Create";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getListUserByDepartment } from "@/api/quotations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { ReloadIcon } from "@radix-ui/react-icons";
import { getCookies } from "cookies-next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/multiSelect/MultiSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { watch } from "fs";
import ErrorViews from "@/components/ErrorViews";
import * as XLSX from "xlsx";

export default function CustomerManagement() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const allCookies = getCookies();
  const role = allCookies["admin"];
  const [openPermission, setOpenPermission] = useState<boolean>(false);
  const [cusId, setCusId] = useState<number>();
  const [tabValue, setTabValue] = useState<string>("tiem-nang");

  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    keySearch: string;
    process: string[];
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
    process: ["S1", "S2", "S3"],
  });

  const {
    data: listCustomer,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["listCustomer", pagination],
    queryFn: () => getListCustomer(pagination),
  });

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, keySearch: searchValue, page: 0 });
    }, 500);
    return () => clearTimeout(timeId);
  }, [searchValue]);

  const mutation = useMutation({
    mutationFn: deleteCustumer,
    onSuccess: () => {
      refetch();
      toast({
        title: "Thành công",
        description: `Xóa khách hàng thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  const mutationUpdateStatus = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      refetch();
      toast({
        title: "Thành công",
        description: `Cập nhật trạng thái thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  async function handleDeleteCustomer(id: number) {
    mutation.mutateAsync(id);
  }

  const handleClick = (data: any) => {
    localStorage.setItem("rowData", JSON.stringify(data));
    router.push("customers/create-quote-request");
  };

  const handleLock = (id: number) => {
    mutationUpdateStatus.mutate(id);
  };

  // useEffect(() => {
  //   if (error) {
  //     toast({
  //       title: "Thất bại",
  //       description: error?.message,
  //     });
  //   }
  // }, [error]);

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
      accessorKey: "abbreviations",
      header: "Tên viết tắt",
      cell: ({ row }) => <div>{row.original["abbreviations"]}</div>,
    },
    {
      accessorKey: "taxCode",
      header: "MST",
      cell: ({ row }) => <div>{row.original["taxCode"]}</div>,
    },
    {
      accessorKey: "customerName",
      header: "Tên khách hàng",
      cell: ({ row }) => <div>{row.original["customerName"]}</div>,
    },
    {
      accessorKey: "phoneNumber",
      header: "Số điện thoại",
      cell: ({ row }) => {
        return <div>{row.original["phoneNumber"]}</div>;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <div>{row.original["email"]}</div>;
      },
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      cell: ({ row }) => <div>{row.original["address"]}</div>,
    },
    {
      accessorKey: "process",
      header: "Tiến trình",
      cell: ({ row }) => (
        <UpdateProcessCustomer
          refetch={refetch}
          tabValue={tabValue}
          detailData={row.original}
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <AlertDialogForm
          title={`Bạn muốn ${
            row.original["status"] ? "khóa" : "mở"
          } khách hàng này?`}
          action={
            (
              <div className="px-2 py-1 cursor-pointer">
                <div
                  className={`border ${
                    row.original["status"]
                      ? "bg-green-200 text-green-700"
                      : "bg-red-500 text-white"
                  } text-center rounded-xl p-0.5 font-medium`}
                >
                  {row.original["status"] ? "Active" : "In-active"}
                </div>
              </div>
            ) as any
          }
          handleSubmit={() => handleLock(row.original["id"])}
        />
      ),
    },
    {
      id: "action",
      header: "",
      cell: ({ row }: { row: any }) => {
        return (
          <div
            className="flex justify-end"
            onDoubleClick={(event) => event.stopPropagation()}
          >
            <div className="flex gap-2 items-center">
              {(role === "admin" || role === "manager") && (
                <div
                  onClick={() => {
                    setCusId(row.original?.id);
                    setOpenPermission(true);
                  }}
                >
                  <FaUserPlus width="20" height="20" />
                </div>
              )}
              <div onClick={() => handleClick(row.original)}>
                <Create width="20" height="20" />
              </div>
              <CreateCustomer refetch={refetch} customerData={row.original} />
              <AlertDialogForm
                title="Bạn muốn xóa khách hàng này?"
                content="Xóa khách hàng có thể ảnh hưởng đến dữ liệu hiện tại, bạn có chắc chắn muốn xóa?"
                action={
                  (
                    <div className="cursor-pointer">
                      <Delete width="20" height="20" />
                    </div>
                  ) as any
                }
                handleSubmit={() => handleDeleteCustomer(row.original["id"])}
              />
            </div>
          </div>
        );
      },
    },
  ];

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      abbreviations: item?.abbreviations,
      taxCode: item?.taxCode,
      customerName: item?.customerName,
      phoneNumber: item?.phoneNumber,
      email: item?.email,
      address: item?.address,
      process: item?.process?.id + " - " + item?.process?.name,
      status: item?.status ? "Active" : "In-active",
    }));
    const heading = [
      [
        "Tên viết tắt",
        "Mã số thuế",
        "Tên khách hàng",
        "Số điện thoại",
        "Email",
        "Địa chỉ",
        "Tiến trình",
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
    XLSX.utils.book_append_sheet(workbook, ws, "Dữ liệu khách hàng");
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `khach-hang.xlsx`);
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
    <>
      <Tabs
        value={tabValue}
        onValueChange={(value) => setTabValue(value)}
        defaultValue="tiem-nang"
        className="w-full mb-2"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            onClick={() =>
              setPagination({
                ...pagination,
                page: 0,
                process: ["S1", "S2", "S3"],
              })
            }
            value="tiem-nang"
          >
            Tiềm năng
          </TabsTrigger>
          <TabsTrigger
            onClick={() =>
              setPagination({
                ...pagination,
                page: 0,
                process: ["S4", "S5", "S6", "S7"],
              })
            }
            value="don-hang"
          >
            Phát triển đơn hàng
          </TabsTrigger>
          <TabsTrigger
            onClick={() =>
              setPagination({ ...pagination, page: 0, process: ["S8"] })
            }
            value="len-don"
          >
            Đã lên đơn
          </TabsTrigger>
          <TabsTrigger
            onClick={() =>
              setPagination({ ...pagination, page: 0, process: ["S9"] })
            }
            value="cham-soc"
          >
            Chăm sóc khách hàng
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex justify-between w-full mb-2">
        <div className="flex justify-between items-center">
          <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm khách hàng"
          />
        </div>
        <div className="flex">
          <CreateCustomer customerData={undefined} refetch={refetch} />
          <Button
            onClick={() =>
              listCustomer?.data?.data?.customers &&
              handleExportExcel(listCustomer?.data?.data?.customers)
            }
            className="ml-2"
            variant={"outline"}
          >
            Xuất Excel
          </Button>
        </div>
      </div>
      <>
        {isLoading ? (
          <div className="flex justify-center items-center mt-64">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div>
              <h2 className="text-zinc-900 dark:text-white mt-4">Loading...</h2>
            </div>
          </div>
        ) : (
          <>
            <DataTable
              onRow={(value) => {
                router.push(
                  `customers/${tabValue}/${String(value).split("/").pop()}`
                );
              }}
              data={listCustomer?.data?.data?.customers || []}
              columns={columns}
            />
            <div className="mt-5 flex justify-end">
              <Paginations
                currentPage={pagination.page}
                pageCount={listCustomer?.data?.data?.numberPages}
                pagination={pagination}
                setPagination={setPagination}
                onPageChange={(value: number) =>
                  setPagination({ ...pagination, page: value })
                }
              />
            </div>
          </>
        )}
      </>
      <UserPermission
        cusId={cusId}
        openModal={openPermission}
        setOpenModal={setOpenPermission}
      />
    </>
  );
}

export function UserPermission({
  cusId,
  openModal,
  setOpenModal,
}: {
  cusId: number | undefined;
  openModal: boolean;
  setOpenModal: any;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoadings, setIsLoading] = useState(false);
  const form = useForm({
    defaultValues: {
      customerId: cusId,
      userId: [{ id: "", level: "" }],
    },
  });
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "userId",
  });

  const {
    data: listUserPermission,
    error,
    refetch,
  } = useQuery({
    queryKey: ["listUserPermission", cusId],
    queryFn: () => getUserPermission(cusId ? cusId : 0),
    enabled: openModal && cusId ? true : false,
  });

  const levelData = (listData: any[], index: number) => {
    const dataIndex = listData.findIndex(
      (item: { level: string }, index: number) => item.level === "2"
    );
    if (dataIndex > -1) {
      if (dataIndex !== index) {
        return [
          { value: "0", title: "sale" },
          { value: "1", title: "saleadmin" },
        ];
      } else {
        return [
          { value: "0", title: "sale" },
          { value: "1", title: "saleadmin" },
          { value: "2", title: "salemanager" },
        ];
      }
    } else {
      return [
        { value: "0", title: "sale" },
        { value: "1", title: "saleadmin" },
        { value: "2", title: "salemanager" },
      ];
    }
  };

  const { data: listSale } = useQuery({
    queryKey: ["listSale"],
    queryFn: () => getListUserByDepartment("sale"),
  });

  useEffect(() => {
    if (!openModal) {
      form.reset();
    }
  }, [openModal, form]);

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;
  const pageCount = listUserPermission
    ? Math.ceil(listUserPermission?.data?.data?.length / pageSize)
    : 0;

  const currentData = listUserPermission?.data?.data?.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const mutation = useMutation({
    mutationFn: deleteUserPermission,
    onSuccess: () => {
      refetch();
      toast({
        title: "Thành công",
        description: `Xóa quyền quản lý khách hàng cho nhân viên thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  const handleDeleteUserPermission = (id: number) => {
    mutation.mutateAsync(id);
  };

  const mutationAddUser = useMutation({
    mutationFn: postUserPermission,
    onSuccess: () => {
      refetch();
      setOpen(false);
      form.reset();
      setIsLoading(false);
      toast({
        title: "Thành công",
        description: `Thêm quyền quản lý khách hàng cho nhân viên thành công`,
      });
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Thất bại",
        description: error?.message,
      });
    },
  });

  const onSubmit = (data: any) => {
    setIsLoading(true);
    mutationAddUser.mutateAsync(data);
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "STT",
      cell: ({ row }) => {
        return (
          <div key={row["index"]} className="capitalize">
            {row["index"] + 1 + currentPage * pageSize}
          </div>
        );
      },
    },
    {
      accessorKey: "userName",
      header: "Tên TK",
      cell: ({ row }) => <div>{row.original?.User["userName"]}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.original?.User["email"]}</div>,
    },
    {
      accessorKey: "customerName",
      header: "Tên KH",
      cell: ({ row }) => <div>{row.original?.Customer["customerName"]}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <div>{row.original?.Customer["email"]}</div>;
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Sđt",
      cell: ({ row }) => <div>{row.original?.Customer["phoneNumber"]}</div>,
    },
    {
      accessorKey: "level",
      header: "Vị trí",
      cell: ({ row }) => {
        return (
          <UpdateLevelPermission detailData={row.original} refetch={refetch} />
        );
      },
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end items-center">
            <AlertDialogForm
              title="Bạn muốn xóa quyền quản lý khách hàng cho nhân viên này?"
              content="Xóa quyền quản lý khách hàng cho nhân viên có thể ảnh hưởng đến dữ liệu hiện tại, bạn có chắc chắn muốn xóa?"
              action={
                (
                  <div className="cursor-pointer">
                    <Delete width="20" height="20" />
                  </div>
                ) as any
              }
              handleSubmit={() => handleDeleteUserPermission(row.original?.id)}
            />
          </div>
        );
      },
    },
  ];

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
    <>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[1100px]">
          <DialogHeader>
            <DialogTitle>
              Danh sách quyền quản lý khách hàng cho nhân viên
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[550px] overflow-y-auto scrollbar-thin">
            <div className="flex justify-end items-end mb-1">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                  <Button>+ Thêm quyền</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[600px] min-h-[300px] overflow-y-auto overflow-x-hidden">
                  <DialogHeader>
                    <DialogTitle>Thêm quyền</DialogTitle>
                  </DialogHeader>
                  <div>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        {fields?.map(
                          (
                            item: { id: string; level: string },
                            index: number
                          ) => {
                            return (
                              <div className="flex items-end mb-2 w-full">
                                <FormField
                                  control={form.control}
                                  name={`userId.${index}.id`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nhân viên</FormLabel>
                                      <FormControl>
                                        <Select
                                          onValueChange={(value) =>
                                            value && field.onChange(value)
                                          }
                                          value={field.value.toString()}
                                        >
                                          <FormControl>
                                            <SelectTrigger className="w-[190px]">
                                              <SelectValue
                                                placeholder={"Chọn nhân viên"}
                                              />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {listSale?.data?.data?.map(
                                              (item: any) => (
                                                <SelectItem
                                                  key={item?.id}
                                                  value={item?.id?.toString()}
                                                >
                                                  {item?.fullName}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`userId.${index}.level`}
                                  render={({ field }) => (
                                    <FormItem className="ml-2">
                                      <FormLabel>Vị trí</FormLabel>
                                      <FormControl>
                                        <Select
                                          onValueChange={(value) =>
                                            value && field.onChange(value)
                                          }
                                          value={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger className="w-[190px]">
                                              <SelectValue placeholder="Chọn vị trí" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {levelData(
                                              form.watch("userId"),
                                              index
                                            )?.map((item: any) => (
                                              <SelectItem
                                                key={item?.value}
                                                value={item?.value}
                                              >
                                                {item?.title}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                {index > 0 && (
                                  <Button
                                    onClick={() => remove(index)}
                                    variant={"destructive"}
                                    className="ml-2"
                                    type="button"
                                  >
                                    {/* <CloseIcon /> */} Xóa
                                  </Button>
                                )}
                              </div>
                            );
                          }
                        )}
                        <FormField
                          control={form.control}
                          name="customerId"
                          defaultValue={cusId}
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormControl>
                                <Input type="hidden" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          onClick={() => append({ id: "", level: "" })}
                          type="button"
                          className="mt-2 mb-2 w-full"
                        >
                          + Thêm dòng
                        </Button>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Huỷ
                            </Button>
                          </DialogClose>
                          <Button type="submit" disabled={isLoadings}>
                            {isLoadings && (
                              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Xác nhận
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="sm:max-w-[1050px]">
              <DataTable data={currentData || []} columns={columns} />
            </div>
            <div className="mt-5 flex justify-end">
              <Paginations
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

const processData = [
  { id: 1, name: "S1", title: "S1 - Khách hàng chung" },
  { id: 2, name: "S2", title: "S2 - Khách hàng tiềm năng" },
  { id: 3, name: "S3", title: "S3 - Khách hàng phát triển" },
  { id: 4, name: "S4", title: "S4 - Khách hàng có nhu cầu báo giá" },
  { id: 5, name: "S5", title: "S5 - Khách hàng muốn làm test" },
  { id: 6, name: "S6", title: "S6 - Đã gửi báo giá" },
  { id: 7, name: "S7", title: "S7 - Đang thương thảo" },
  { id: 8, name: "S8", title: "S8 - Đã có đơn hàng" },
  { id: 9, name: "S9", title: "S9 - Chăm sóc phát triển thêm" },
];

export function UpdateProcessCustomer({
  detailData,
  tabValue,
  refetch,
}: {
  detailData?: any;
  tabValue: string;
  refetch: any;
}) {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      process: "",
    },
  });
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: updateCustomerProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomer"],
      });
      setOpen(false);
      refetch();
      toast({
        title: "Thành công",
        description: `Cập nhật tiến trình thành công`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  const returnProcessData = (tab: string) => {
    switch (tab) {
      case "tiem-nang":
        return processData.slice(0, 3);
        break;
      case "don-hang":
        return processData.slice(3, 7);
        break;
      case "len-don":
        return [processData[7]];
        break;
      case "cham-soc":
        return [processData[8]];
        break;
      default:
        return [];
    }
  };

  const handleSubmit = (data: any) => {
    if (data?.process) {
      mutation.mutateAsync({ id: detailData?.id, data: data });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          {detailData["process"]?.id + " - " + detailData["process"]?.name}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] mx-auto overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Cập nhật tiến trình khách hàng</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full flex flex-col gap-4"
            >
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="process"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-500">* </span> Tiến trình
                        khách hàng
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          value && field.onChange(value)
                        }
                        defaultValue={detailData["process"]?.id || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tiến trình" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {processData?.map((item: any) => (
                            <SelectItem key={item?.id} value={item?.name}>
                              {item?.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cập nhật
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UpdateLevelPermission({
  detailData,
  refetch,
}: {
  detailData?: any;
  refetch: any;
}) {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      level: "",
    },
  });
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: updateLevelPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomer"],
      });
      setOpen(false);
      refetch();
      toast({
        title: "Thành công",
        description: `Cập nhật vị trí thành công`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Thất bại",
        description: `${error?.message}`,
      });
    },
  });

  const returnProcessData = [
    { value: "0", title: "sale" },
    { value: "1", title: "saleadmin" },
    { value: "2", title: "salemanager" },
  ];

  const handleSubmit = (data: any) => {
    if (data?.level) {
      mutation.mutateAsync({ id: detailData?.id, data: data });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>{detailData["level"]?.value}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] mx-auto overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Cập nhật vị trí</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full flex flex-col gap-4"
            >
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-500">* </span> Vị trí
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          value && field.onChange(value)
                        }
                        defaultValue={detailData["level"]?.id || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vị trí" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {returnProcessData?.map(
                            (
                              item: { value: string; title: string },
                              index: number
                            ) => (
                              <SelectItem key={index} value={item?.value}>
                                {item?.title}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cập nhật
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
