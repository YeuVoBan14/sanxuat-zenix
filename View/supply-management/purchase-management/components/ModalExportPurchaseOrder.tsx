
"use client"
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBankAccount } from "@/api/payment";
import { postPurchaseOrderRequest } from "@/api/purchase";
import { toast } from "@/components/ui/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { format } from "date-fns";


export default function ModalExportPurchaseOrder({
    data,
    supplierId,
    productId,
}: {
    data: any;
    supplierId: number;
    productId: any;
}) {
    const theme = useTheme();
    const route = useRouter();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [isLoadings, setIsLoading] = useState(false);
    const [orderRequestData, setOrderRequestData] = useState<any>();
    const [selectedAccount, setSelectedAccount] = useState<any>();

    useEffect(() => {
        const account = bankAccountList?.data?.find((account: any) => account.id === orderRequestData?.bankAccountId);
        setSelectedAccount(account);
    }, [orderRequestData?.bankAccountId]);

    const emailSupplier = data?.OrderProducts?.find(
        (item: any) => item?.Quote_History?.supplierId === supplierId
    )?.Quote_History?.Supplier?.Email_Suppliers[0]?.email;
    // Vì chỉ có 1 email nên lấy mặc định mảng 0 luôn đỡ phải máp

    useEffect(() => {
        if (open) {
            setOrderRequestData((prev: any) => ({
                ...prev,
                puchaseOrderProducts: productId,
                priceTerm: data?.Quotation?.priceTerm,
                qualityTerm: data?.Quotation?.qualityTerm,
                warrantyCondition: data?.Quotation?.warrantyCondition,
                TOP: data?.Quotation?.TOP,
                executionTime: data?.Quotation?.executionTime,
                deliveryCondition: data?.Quotation?.deliveryCondition,
                supplierId: supplierId,
                emailSupplier: emailSupplier,
            }));
        }
    }, [open, productId]);

    const {
        data: bankAccountList,
    } = useQuery({ queryKey: ["bankAccountList"], queryFn: getBankAccount });

    const handleChangeInput = (value: string, key: any) => {
        setOrderRequestData({ ...orderRequestData, [key]: value });
    };

    const id = data?.id;
    const mutation = useMutation({
        mutationFn: (datas: any) => postPurchaseOrderRequest(id, datas),
        onSuccess: () => {
            route.push("/admin/purchase");
            toast({
                title: "Thành công",
                description: `Xuất đơn hàng thành công`,
            });
            queryClient.invalidateQueries({
                queryKey: ["listPurchase"],
            });
            setOpen(false);
            setIsLoading(false);
        },
        onError: (error: any) => {
            toast({
                title: "Thất bại",
                description: error?.message,
            });
        },
    });

    const handleSubmit = () => {
        const body = {

        }
        mutation.mutateAsync(orderRequestData);
    }

    const supplierDetail = data?.OrderProducts?.find((item: any) => item?.Quote_History?.supplierId === supplierId)?.Quote_History?.Supplier;
    const selectedProductIds = productId.map((item: { id: number }) => item?.id);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        disabled={isLoadings}
                        className="bg-blue-500 hover:bg-blue-800 text-white hover:text-white border shadow-lg"
                        type="button"
                        variant="default"
                    >
                        {isLoadings && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                        Xuất đơn hàng
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1200px] sm:max-h-[650px] overflow-y-auto scrollbar-thin">
                    <DialogHeader>
                        <DialogTitle>Yêu cầu đặt hàng</DialogTitle>
                    </DialogHeader>
                    <div>
                        <div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="w-full">
                                    <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
                                        Thông tin đơn hàng:
                                    </h5>
                                    <div className="flex justify-between mb-1 w-full">
                                        <p className="font-semibold text-[14px]">Ngày đặt hàng:</p>
                                        <span className="text-[14px]">
                                            {data?.createdAt &&
                                                format(
                                                    data?.createdAt,
                                                    "HH:mm dd/MM/yyyy"
                                                )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-1 w-full">
                                        <p className="font-semibold text-[14px]">Số PO :</p>
                                        <span className="text-[14px]">
                                            {data?.POCustomer}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-1 w-full">
                                        <p className="font-semibold text-[14px]">Số báo giá:</p>
                                        <span className="text-[14px]">
                                            {data?.Quotation?.code}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-1 w-full">
                                        <p className="font-semibold text-[14px]">Pur phụ trách:</p>
                                        <span className="text-[14px]">
                                            {data?.purchaseInfo?.fullName}
                                        </span>
                                    </div>
                                    <>
                                        <div className="flex justify-between mb-1 w-full">
                                            <p className="font-semibold text-[14px]">Email:</p>
                                            <span className="text-[14px]">
                                                {data?.purchaseInfo?.email}
                                            </span>
                                        </div>
                                        <div className="flex justify-between mb-1 w-full">
                                            <p className="font-semibold text-[14px]">Số điện thoại:</p>
                                            <span className="text-[14px]">
                                                {data?.purchaseInfo?.phoneNumber}
                                            </span>
                                        </div>
                                    </>
                                </div>
                                <div className="w-full">
                                    <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
                                        Thông tin nhà cung cấp:
                                    </h5>
                                    <div className="flex justify-between mb-1 w-full">
                                        <p className="font-semibold text-[14px]">Công ty:</p>
                                        <span className="text-[14px]">
                                            {supplierDetail?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-1 w-full">
                                        <p className="font-semibold text-[14px]">Địa chỉ:</p>
                                        <span className="text-[14px]">
                                            {supplierDetail?.address}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-1 w-full">
                                        <p className="font-semibold text-[14px]">Mã số thuế:</p>
                                        <span className="text-[14px]">
                                            {supplierDetail?.taxCode}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-1 w-full">
                                        <p className="font-semibold text-[14px]">Người liên hệ:</p>
                                        <span className="text-[14px]">
                                            {supplierDetail?.userContact}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-1 w-full">
                                        <p className="font-semibold text-[14px]">Email:</p>
                                        <span className="text-[14px]">
                                            {supplierDetail?.Email_Suppliers?.map((item: any) => (
                                                <div>{item?.email}</div>
                                            ))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-1 w-full">
                                        <p className="font-semibold text-[14px]">Số điện thoại:</p>
                                        <span className="text-[14px]">
                                            {supplierDetail?.phoneNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <div>
                                    <div className="grid grid-cols-12 gap-1 justify-center items-center text-center">
                                        <p>Mã SP</p>
                                        <p>Mô tả</p>
                                        <p>NSX</p>
                                        <p>NCC</p>
                                        <p>SL</p>
                                        <p>Giá (NCC)</p>
                                        <p>VAT</p>
                                        <p>Thành tiền</p>
                                        <p>Đơn vị tính</p>
                                        <p>Thời gian giao hàng</p>
                                        <p>Dự án</p>
                                        <p>Tiêu hao</p>
                                    </div>
                                    {data?.OrderProducts?.filter((item: any, index: number) => selectedProductIds.includes(item.id)).map((item: any, index: number) => {

                                        const quantityPo = productId.find((i: { id: number, quantityPO: any }) => i.id === item.id)?.quantityPO;
                                        return (
                                            <div key={index} className="grid grid-cols-12 gap-1 mb-2">
                                                <Input value={item?.Quote_History?.Product?.productCode} disabled />
                                                <Input value={item?.Quote_History?.Product?.describe} disabled />
                                                <Input value={item?.Quote_History?.Product?.producerInfo?.name} disabled />
                                                <Input value={item?.Quote_History?.Supplier?.name} disabled />
                                                <Input value={quantityPo} disabled />
                                                <Input value={item?.Quote_History?.pricePurchase} disabled />
                                                <Input value={item?.Quote_History?.VATPurchase + " %"} disabled />
                                                <Input value={item?.Quote_History?.pricePurchase * item?.Quote_History?.quantity * (100 + item?.Quote_History?.VATPurchase) / 100} disabled />
                                                <Input value={item?.Quote_History?.unit} disabled />
                                                <Input value={item?.Quote_History?.deliveryTime} disabled />
                                                <div className="flex justify-center items-center">
                                                    <Checkbox checked={(item?.Quote_History?.type === "D" || item?.Quote_History?.type === "DT") ? true : false} disabled />
                                                </div>
                                                <div className="flex justify-center items-center">
                                                    <Checkbox checked={(item?.Quote_History?.type === "T" || item?.Quote_History?.type === "DT") ? true : false} disabled />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-6">
                            <p className="w-1/5 flex justify-center items-center font-bold">Ghi chú chung :</p>
                            <Input
                                placeholder="Nhập ghi chú"
                                onChange={(e) =>
                                    handleChangeInput(e.target.value, "notePO")
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-8">
                            <div>
                                <h1 className="font-bold mb-2">Điều khoản: </h1>
                                <div className="flex gap-3 mb-3">
                                    <Checkbox
                                        className="mt-3 mr-1"
                                    // checked={data?.Quotation?.priceTerm && true}
                                    />
                                    <p className="mt-2 w-60">Giá</p>
                                    <Input
                                        placeholder="Nhập giá"
                                        // value={data?.Quotation?.priceTerm}
                                        onChange={(e) =>
                                            handleChangeInput(e.target.value, "priceTerm")
                                        }
                                    />
                                </div>
                                <div className="flex gap-3  mb-3">
                                    <Checkbox
                                        className="mt-3 mr-1"
                                    // checked={data?.Quotation?.qualityTerm && true}
                                    />
                                    <p className="mt-2  w-60">Chất lượng</p>
                                    <Input
                                        placeholder="Nhập chất lượng"
                                        // value={data?.Quotation?.qualityTerm}
                                        onChange={(e) =>
                                            handleChangeInput(e.target.value, "qualityTerm")
                                        }
                                    />
                                </div>
                                <div className="flex gap-3  mb-3">
                                    <Checkbox
                                        className="mt-3 mr-1"
                                    // checked={data?.Quotation?.deliveryCondition && true}
                                    />
                                    <p className="mt-2 w-60">Điều kiện giao nhận</p>
                                    <Input
                                        placeholder="Nhập điều kiện giao nhận"
                                        // value={data?.Quotation?.deliveryCondition}
                                        onChange={(e) =>
                                            handleChangeInput(e.target.value, "deliveryCondition")
                                        }
                                    />
                                </div>
                                <div className="flex gap-3  mb-3">
                                    <Checkbox
                                        className="mt-3 mr-1"
                                    // checked={data?.Quotation?.executionTime && true}
                                    />
                                    <p className="mt-2 w-60">Thời gian thực hiện</p>
                                    <Input
                                        placeholder="Nhập thời gian thực hiện (số ngày)"
                                        // value={data?.Quotation?.executionTime}
                                        onChange={(e) =>
                                            handleChangeInput(e.target.value, "executionTime")
                                        }
                                    />
                                </div>
                                <div className="flex gap-3  mb-3">
                                    <Checkbox
                                        className="mt-3 mr-1"
                                    // checked={data?.Quotation?.warrantyCondition && true}
                                    />
                                    <p className="mt-2 w-60">Điều kiện bảo hành</p>
                                    <Input
                                        placeholder="Nhập điều kiện bảo hành"
                                        // value={data?.Quotation?.warrantyCondition}
                                        onChange={(e) =>
                                            handleChangeInput(e.target.value, "warrantyCondition")
                                        }
                                    />
                                </div>
                                <div className="flex gap-3  mb-3">
                                    <Checkbox
                                        className="mt-3 mr-1"
                                    // checked={data?.Quotation?.TOP && true}
                                    />
                                    <p className="mt-2 w-60">Điều kiện thanh toán</p>
                                    <Input
                                        placeholder="Nhập điều kiện thanh toán"
                                        // value={data?.Quotation?.TOP}
                                        onChange={(e) =>
                                            handleChangeInput(e.target.value, "TOP")
                                        }
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Checkbox
                                        className="mt-3 mr-1"
                                    />
                                    <p className="mt-2">Hình thức thanh toán</p>
                                    <p className="mt-2">
                                        Bằng tiền mặt hoặc chuyển khoản qua TKNH
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h1 className="font-bold mb-2"><span className="text-red-500">* </span>  Thông tin thanh toán:</h1>
                                <div className="text-center">
                                    <Select onValueChange={(e) => handleChangeInput(e, "bankAccountId")}>
                                        <SelectTrigger className="shadow-md">
                                            <SelectValue placeholder="Chọn tài khoản thanh toán" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {bankAccountList?.data?.map((item: any) => (
                                                    <SelectItem key={item?.id} value={item?.id}>{item?.nameAccount}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <div>
                                        {selectedAccount && (
                                            <div className={`px-6 mt-5 leading-7 bg-[#eeeee4] py-7 rounded-md ${theme ? "text-black" : ""}`}>
                                                <div className="flex justify-between">
                                                    <p>Tên Tài Khoản:</p>
                                                    <p>{selectedAccount?.nameAccount}</p>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p>Số Tài Khoản:</p>
                                                    <p>{selectedAccount?.numberAccount}</p>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p>Ngân hàng:</p>
                                                    <p>{selectedAccount?.nameBank}</p>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p>Chi nhánh:</p>
                                                    <p>{selectedAccount?.branch}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                Huỷ
                            </Button>
                        </DialogClose>
                        <Button type="button" variant="default" onClick={handleSubmit}>
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    )
}