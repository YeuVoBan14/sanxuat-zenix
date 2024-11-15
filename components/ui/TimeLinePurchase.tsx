
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "./dialog";
import { useRouter } from "next/navigation";
import UpdateOrder from "@/View/marketingSales-management/orders/components/UpdateOrder";
import { getExportPurchaseOrder } from "@/api/purchase";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


interface PropsType {
    timeLineData: any;
    purchaseOrderId?: number;
    open: boolean;
    setOpen: (value: boolean) => void;
}

interface TimelineData {
    name: string;
    title: string;
    codeTitle: number;
    note: string;
    createdAt: string;
    status: string;
    noteTLOrder: string;
    orderId: number;
    User: {
        fullName: string;
        email: string;
        department: string;
    };
}

export default function TimelinePurchase(props: PropsType) {
    const route = useRouter();
    const {
        timeLineData,
        open,
        setOpen,
        purchaseOrderId
    } = props;
    const [user, setUser] = useState<{ role: string, department: string }>();
    const [purchaseId, setPurchaseId] = useState<number>();

    const { data: purchaseOrder } = useQuery({
        queryKey: ["getExportPurchaseOrder", purchaseId],
        queryFn: () => getExportPurchaseOrder(Number(purchaseId)),
        enabled: !!purchaseId,
    });
    useEffect(() => {
        if (purchaseId && purchaseOrder) {
            handleDownloadFile(purchaseOrder.data.data);
        }
    }, [purchaseOrder, purchaseId]);

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

    const getRemainingQuantity = (note: string) => {
        const match = note?.match(/Còn lại\s*:\s*(\d+\/\d+)/);
        if (match) {
            const remaining = match[1].split("/");
            return Number(remaining[0]);
        }
        return null;
    };

    const renderButtonText = (
        codeTitle: number,
        department: any,
        role: any,
        orderId: number,
        noteTLOrder: string,
        item: any
    ) => {
        const remaining = getRemainingQuantity(noteTLOrder);

        if ([0].includes(codeTitle)) {
            if (department === "purchase" || role === "admin") {
                return <div onClick={() => route.push("purchase/order-request/" + orderId)}>Xuất đơn</div>;
            }
        } else if ([2].includes(codeTitle)) {
            if (department === "sale" || role === "admin") {
                return <UpdateOrder
                    dataList={timeLineData || []}
                    timeLineEdit={true}
                />
            }
        } else if ([3].includes(codeTitle)) {
            if (department === "purchase" || role === "admin") {
                return <div onClick={() => route.push("purchase/order-request/" + orderId)}>Xuất đơn</div>;
            }
        } else if ([4].includes(codeTitle)) {
            return (
                <div className="flex gap-2">
                    {(department === "purchase" || role === "admin") &&
                        <>
                            <div onClick={() => setPurchaseId(Number(item?.listId))}>In</div>
                            <div onClick={() => window.location.href = `/admin/purchase/input-proposal/${Number(item?.listId)}`}>
                                Đề xuất nhập kho
                            </div>
                        </>
                    }
                    {(department === "sale" || role === "admin") &&
                        <div onClick={() => window.location.href = `/admin/purchase/output-proposal/${Number(item?.listId)}`}>
                            Đề xuất xuất kho
                        </div>
                    }
                    {((department === "sale" && department === "purchase") || role === "admin") &&
                        <div>
                            <UpdateOrder
                                dataList={timeLineData || []}
                                timeLineEdit={true}
                            />
                        </div>
                    }
                    {remaining !== 0 &&
                        <div onClick={() => route.push(`purchase/order-request/${orderId}`)}>Xuất đơn</div>
                    }
                </div>
            );

        }
    };

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const userJson = JSON.parse(userData);
            setUser(userJson);
        }
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Time line</DialogTitle>
                    <div className="max-h-[600px] overflow-y-auto scrollbar-thin w-full">
                        {timeLineData?.TimelineOrders?.map((item: TimelineData, index: number) => (
                            <div className="flex flex-row w-full mt-3">
                                <div className="flex flex-col items-end w-1/4">
                                    <p className="font-semibold text-[15px]">{item?.title}</p>
                                    <span className="text-sm text-emerald-600">
                                        {format(item?.createdAt, "dd/MM/yyyy")}
                                    </span>
                                    <span className="text-sm text-emerald-600">
                                        {format(item?.createdAt, "hh:mm:ss")}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center justify-start ml-2 mt-1">
                                    <div className="rounded-full bg-indigo-600 w-3 h-3"></div>
                                    {index < timeLineData?.TimelineOrders?.length - 1 && (
                                        <div className="bg-slate-300 w-1 h-20 mt-1"></div>
                                    )}
                                </div>
                                <div className="ml-2 flex justify-between w-3/4">
                                    <div className="w-6/12">
                                        <p className="font-medium">{item?.User?.department}</p>
                                        <p className="font-normal text-[15px]">
                                            {item?.User?.fullName}
                                        </p>
                                        {item?.codeTitle !== 6 ?
                                            item?.noteTLOrder?.split("-").map((el: string) => (
                                                <p className="text-[14px]">{el}</p>
                                            ))
                                            :
                                            <a href={`${item?.noteTLOrder}`} className="underline font-semibold text-[14px] opacity-80" download="file.xlsx" target="_blank">Tải file</a>
                                        }
                                    </div>
                                    <p
                                        className="underline cursor-pointer text-indigo-600 text-[14px]"
                                    >
                                        {renderButtonText(item?.codeTitle, user?.department, user?.role, item?.orderId, item?.noteTLOrder, item)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

