import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "./dialog";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./dropdown-menu";
import YCBGDetails from "@/View/admin/customers/components/YCBGDetails";
import { useRouter } from "next/navigation";
import { exportQuotation, exportQuotationRequest } from "@/api/quotations";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import SelectComponent from "../Select";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

interface PropsType {
  data: any;
  open: boolean;
  setOpen: (value: boolean) => void;
  setIsDialogOpen: (value: boolean) => void;
  refetch: any;
  setOpenTimeLine: (value: boolean) => void;
  id: number;
  isOpenDialog: boolean;
  setIsOpenDialog: (value: boolean) => void;
  quotationId?: number;
}

interface TimelineData {
  name: string;
  note: string;
  createdAt: string;
  status: string;
  User: {
    fullName: string;
    department: string;
  };
}

interface ProductDataType {
  id: number;
  productId: number;
  supplierId: number;
  priceSale: number;
  quantity: number;
  unit: string;
  pricePurchase: number;
  VATSale: number;
  VATPurchase: number;
  deliveryTime: number;
  type: string;
}

function Timeline(props: PropsType) {
  const {
    data,
    open,
    setOpen,
    setIsDialogOpen,
    refetch,
    setOpenTimeLine,
    id,
    isOpenDialog,
    setIsOpenDialog,
    quotationId,
  } = props;
  const [user, setUser] = useState<{ department: string; role: string }>();
  const [statusKey, setStatusKey] = useState<string>("");
  const [statusTimelineId, setStatusTimelineId] = useState<number>();
  const [listId, setListId] = useState<string>();
  const [timelineId, setTimelineId] = useState<number>(0);
  const [supplierId, setSupplierId] = useState<number>();
  const [supplier, setSupplier] = useState<number>(0);
  const [exportOption, setExportOption] = useState<boolean>(false);
  const [openListSupplier, setOpenListSupplier] = useState<boolean>(false);
  const { data: fileData, isLoading: loadFileData } = useQuery({
    queryKey: ["exportQuotation", listId],
    queryFn: () => exportQuotation(Number(listId)),
    enabled: listId ? true : false,
  });
  const { data: fileQuotationRequest, isLoading } = useQuery({
    queryKey: ["exportQuotationRequest", exportOption],
    queryFn: () =>
      exportQuotationRequest({
        id: timelineId,
        supplierId: supplierId ? supplierId : 0,
      }),
    enabled: exportOption ? true : false,
  });
  const listSupplierData: any[] = [];
  data["quoteProducts"]?.forEach((item: any) => {
    item?.SupplieQuoteTemps?.forEach(
      (el: { supplierId: number; Supplier: { name: string } }) => {
        if (
          el.supplierId &&
          listSupplierData.findIndex(
            (elItem: { value: number }) => elItem.value === el.supplierId
          ) < 0
        ) {
          listSupplierData.push({
            value: el?.supplierId,
            name: el?.Supplier?.name,
          });
        } else if (
          el.supplierId === null &&
          listSupplierData.findIndex(
            (elItem: { value: number }) => elItem.value === 0
          ) < 0
        ) {
          listSupplierData.push({
            value: 0,
            name: "Chưa xác định",
          });
        }
      }
    );
  });
  const route = useRouter();
  const renderButtonText = (
    status: string,
    user: any,
    listId: string | undefined,
    statusData: any
  ) => {
    if (["1", "3"].includes(status)) {
      if (user?.department === "purchase" || user?.role === "admin")
        return "Nhận YCBG";
    } else if (status === "2") {
      const note: string = statusData?.note;
      const noteLength: number = note?.length;
      if (
        ["purchase", "admin"].includes(user?.department) &&
        note[noteLength - 1] !== note[noteLength - 3]
      ) {
        if (fileQuotationRequest?.data?.data) {
          return "Tải xuống";
        } else {
          return "Xuất YCBG";
        }
      } else if (["sale", "admin"].includes(user?.department))
        return "Cập nhật";
      else if (
        ["purchase", "admin"].includes(user?.department) &&
        note[noteLength - 1] === note[noteLength - 3]
      ) {
        return "";
      } else return "Cập nhật";
    }
    // else if (["6", "8"].includes(status)) {
    //   if (status === "8") return "In";
    //   else {
    //     if (user?.department === "purchase") return "In";
    //   }
    // }
    else if (status === "4") {
      if (user?.department === "sale" || user?.role === "admin")
        return "Cập nhật";
    } else if (status === "7") {
      if (["sale"].includes(user?.department)) {
        if (listId === statusData?.listId) {
          return "Tải xuống";
        } else {
          return "Xuất báo giá";
        }
      } else if (["admin"].includes(user?.department)) return "Duyệt";
    }
  };
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
        setExportOption(false);
        setSupplierId(undefined);
        setTimelineId(0);
      });
    }
  };
  const handleOpenModal = (status: string, statusData: any, user: any) => {
    if (["1", "3"].includes(status)) {
      setStatusKey("Receive");
      setIsDialogOpen(true);
      setStatusTimelineId(Number(statusData?.status));
    } else if (["2", "4"].includes(status) && user?.department === "sale") {
      route.push(`quote-requirement/edit-requirement/${id}`);
    } else if (status === "7") {
      if (listId === statusData?.listId) {
        handleDownloadFile(fileData?.data?.data);
        setListId("");
      } else {
        setListId(statusData?.listId);
      }
    } else if (status === "2" && user?.department === "purchase") {
      if (fileQuotationRequest?.data?.data) {
        handleDownloadFile(fileQuotationRequest?.data?.data);
      } else {
        setTimelineId(statusData.id);
        setOpenListSupplier(true);
      }
    }
  };
  const dropdownMenu = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <p className="underline cursor-pointer text-indigo-600 text-[14px]">
            Tạo báo giá
          </p>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                (window.location.href = `quotation/create-quotation/da/${id}`)
              }
            >
              <p>Dự án</p>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                (window.location.href = `quotation/create-quotation/th/${id}`)
              }
            >
              <p>Tiêu hao</p>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  const handleOpenModalBG = () => {};
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userJson = JSON.parse(userData);
      setUser(userJson);
    }
    setExportOption(false);
    setSupplierId(undefined);
    setTimelineId(0);
  }, []);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time line</DialogTitle>
            <div className="max-h-[600px] overflow-y-auto w-full">
              {data["Timelines"]?.map((item: TimelineData, index: number) => (
                <div className="flex flex-row w-full">
                  <div className="flex flex-col items-end w-2/5 ">
                    <p className="font-semibold text-[15px]">{item?.name}</p>
                    <span className="text-sm text-emerald-600">
                      {format(item?.createdAt, "dd/MM/yyyy")}
                    </span>
                    <span className="text-sm text-emerald-600">
                      {format(item?.createdAt, "hh:mm:ss")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-start ml-2 mt-1">
                    <div className="rounded-full bg-indigo-600 w-3 h-3"></div>
                    {index < data["Timelines"]?.length - 1 && (
                      <div className="bg-slate-300 w-1 h-20 mt-1"></div>
                    )}
                  </div>
                  <div className="ml-2 flex justify-between w-3/5">
                    <div className="w-8/12">
                      <p className="font-medium">{item?.User?.department}</p>
                      <p className="font-normal text-[15px]">
                        {item?.User?.fullName}
                      </p>
                      {["6", "8", "11"].includes(item?.status) ? (
                        <p className="text-[14px]">
                          {item?.note?.slice(0, 30) + "..."}
                        </p>
                      ) : (
                        item?.note
                          ?.split("-")
                          .map((el: string) => (
                            <p className="text-[14px]">{el}</p>
                          ))
                      )}
                    </div>
                    {item?.status !== "4" ? (
                      <div className="flex flex-col items-end">
                        {item?.status === "2" &&
                        (user?.department === "sale" ||
                          user?.role === "admin") ? (
                          <Link
                            href={`quote-requirement/edit-requirement/${id}`}
                          >
                            <p className="underline cursor-pointer text-indigo-600 text-[14px]">
                              {renderButtonText(
                                item?.status,
                                user,
                                listId,
                                item
                              )}
                            </p>
                          </Link>
                        ) : (
                          <p
                            onClick={() =>
                              handleOpenModal(item?.status, item, user)
                            }
                            className="underline cursor-pointer text-indigo-600 text-[14px]"
                          >
                            {renderButtonText(item?.status, user, listId, item)}
                          </p>
                        )}
                      </div>
                    ) : user?.department === "sale" ||
                      user?.role === "admin" ? (
                      <div>{dropdownMenu()}</div>
                    ) : (
                      <p
                        onClick={() =>
                          handleOpenModal(item?.status, item, user)
                        }
                        className="underline cursor-pointer text-indigo-600 text-[14px]"
                      >
                        {renderButtonText(item?.status, user, listId, item)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={openListSupplier} onOpenChange={setOpenListSupplier}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Danh sách nhà cung cấp</DialogTitle>
            <SelectComponent
              key="supplierId"
              label="Nhà cung cấp"
              placeholder="Chọn một trong các nhà cung cấp"
              data={listSupplierData}
              value={supplierId}
              setValue={(val: number) => setSupplierId(val)}
              displayProps="name"
            />
          </DialogHeader>
          <div className="flex w-full justify-end mt-2">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => setOpenListSupplier(false)}
            >
              Thoát
            </Button>
            {isLoading ? (
              <Button className="ml-2" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Xin chờ
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setSupplier(supplierId ? supplierId : 0);
                  setExportOption(true);
                  setTimeout(() => {
                    setOpenListSupplier(false);
                    refetch();
                  }, 1000);
                }}
                className="ml-2"
              >
                Xuất YCBG
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <YCBGDetails
        refetchData={refetch}
        setOpen={setOpenTimeLine}
        id={id}
        isDialogOpen={isOpenDialog}
        setIsDialogOpen={setIsOpenDialog}
        statusKey={statusKey}
        statusQuote={data?.statusQuote}
        statusTimelineId={statusTimelineId}
      />
    </>
  );
}

export default Timeline;
