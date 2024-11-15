"use client"
import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrderById } from "@/api/order";
import BreadcrumbFunction from "@/components/Breadcrumb";
import { format } from "date-fns";
import { AlertDialogForm } from "@/components/AlertDialogForm";
import { Button } from "@/components/ui/button";
import LostOrder from "./LostOrder";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { putRefuseOrder } from "@/api/purchase";
import { toast } from "@/components/ui/use-toast";
import ModalExportPurchaseOrder from "./ModalExportPurchaseOrder";
import ErrorViews from "@/components/ErrorViews";
import LoadingView from "@/components/LoadingView";

export default function CreatePurchaseOrder() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const processedSuppliers = new Set();
    const [selectedSupplierId, setSelectedSupplierId] = useState<number>();
    const [refuseOrderData, setRefuseOrderData] = useState<any>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<any>([]);
    const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

    const {
        data: orderById,
        error,
        isLoading
    } = useQuery({
        queryKey: ["orderById", params?.id],
        queryFn: () => getOrderById(Number(params?.id)),
    });

    const updateSelectedProductIds = (checkedItems: any) => {
        const updatedProductIds = Object.keys(checkedItems)
            .filter(key => checkedItems[key])
            .map(id => ({ id: Number(id), quantityPO: orderById?.data?.data?.OrderProducts?.find((item: any) => item.id === Number(id))?.Quote_History?.quantity }));

        setSelectedProductIds(updatedProductIds);

        const updatedProductRefuse = Object.keys(checkedItems)
            .filter((key: any) => checkedItems[key])
            .map(id => ({ id: Number(id), reasonRefuse: refuseOrderData.find((item: any) => item.id === Number(id))?.reasonRefuse || "" }));

        setRefuseOrderData(updatedProductRefuse);
    };

    const handleSelectItem = (checked: boolean, index: number, quantityPO: number) => {
        const product = orderById?.data?.data.OrderProducts[index || 0];
        // setCheckedItems((prevCheckedItems) => ({
        //     ...prevCheckedItems,
        //     [product?.id]: checked,
        // }));
        // if (checked) {
        //     setSelectedProductIds((prevIds: any) => [...prevIds, { id: product?.id, quantityPO: quantityPO }]);
        // } else {
        //     setSelectedProductIds(selectedProductIds?.filter((id: number) => id !== product.id));
        // }
        setCheckedItems((prevCheckedItems) => {
            const updatedCheckedItems = {
                ...prevCheckedItems,
                [product?.id]: checked,
            };
            updateSelectedProductIds(updatedCheckedItems);
            return updatedCheckedItems;
        });
    };

    const handleSelectChange = (id: number) => {
        setSelectedSupplierId(id);
        setSelectedProductIds([]);
        setRefuseOrderData([]);
        setCheckedItems({});
    };

    const handleInputChange = (index: number, field: string, value: any) => {
        const product = orderById?.data?.data.OrderProducts[index || 0];
        if (field === "quantityPO") {
            setSelectedProductIds((prevIds: any) => {
                const updatedIds = [...prevIds];
                const productIndex = updatedIds.findIndex(item => item.id === orderById?.data?.data.OrderProducts[index]?.id);
                if (productIndex > -1) {
                    const oldQuantity = updatedIds[productIndex];
                    updatedIds[productIndex] = { ...updatedIds[productIndex], quantityPO: Number(value || oldQuantity) };
                }
                return updatedIds;
            });
        } else {
            // setRefuseOrderData((prevIds: any) => {
            //     const updatedIds = [...prevIds];
            //     const productIndex = updatedIds.findIndex(item => item.id === orderById?.data?.data.OrderProducts[index]?.id);
            //     if (productIndex > -1) {
            //         updatedIds[productIndex] = { ...updatedIds[productIndex], reasonRefuse: value };
            //     }
            //     return updatedIds;
            // });
            setRefuseOrderData((prevData: any) => {
                const updatedData = [...prevData];
                const productIndex = updatedData.findIndex(item => item.id === product.id);
                if (productIndex > -1) {
                    updatedData[productIndex] = { ...updatedData[productIndex], reasonRefuse: value };
                } else {
                    updatedData.push({ id: product.id, reasonRefuse: value });
                }
                return updatedData;
            });
        }
    };

    const mutation = useMutation({
        mutationFn: (data: any) => putRefuseOrder(Number(params?.id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["orderById"],
            });
            setRefuseOrderData([]);
            setCheckedItems({});
            toast({
                title: "Thành công",
                description: `Từ chối đơn hàng thành công`,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Thất bại",
                description: error?.message,
            });
        },
    });

    const handleSubmit = () => {
        mutation.mutateAsync(refuseOrderData);
    }

    if (isLoading) return <LoadingView />;
    if (error instanceof Error && "response" in error) {
        const status = (error as any).response?.status;
        const type = (error as any).response?.type;
        const statusText = (error as any).response?.statusText;
        const message = (error as any).response?.data?.message;
        return (
            <ErrorViews status={status} statusText={statusText} message={message} type={type} />
        );
    }

    return (
        <>
            <BreadcrumbFunction
                functionName="Cung ứng"
                title="Mua hàng"
                nameFunction="Yêu cầu đặt hàng"
                hasChildFunc={true}
                link="admin/purchase"
            />

            <div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="w-full">
                        <h5 className="mb-2 font-semibold text-[16px] opacity-80 underline">
                            Thông tin đơn hàng:
                        </h5>
                        <div className="flex justify-between mb-1 w-full">
                            <p className="font-semibold text-[14px]">Ngày đặt hàng:</p>
                            <span className="text-[14px]">
                                {orderById?.data?.data?.createdAt &&
                                    format(
                                        orderById?.data?.data?.createdAt,
                                        "HH:mm dd/MM/yyyy"
                                    )}
                            </span>
                        </div>
                        <div className="flex justify-between mb-1 w-full">
                            <p className="font-semibold text-[14px]">Số PO :</p>
                            <span className="text-[14px]">
                                {orderById?.data?.data?.POCustomer}
                            </span>
                        </div>
                        <div className="flex justify-between mb-1 w-full">
                            <p className="font-semibold text-[14px]">Số báo giá:</p>
                            <span className="text-[14px]">
                                {orderById?.data?.data?.Quotation?.code}
                            </span>
                        </div>
                        <div className="flex justify-between mb-1 w-full">
                            <p className="font-semibold text-[14px]">Pur phụ trách:</p>
                            <span className="text-[14px]">
                                {orderById?.data?.data?.purchaseInfo?.fullName}
                            </span>
                        </div>
                        <div className="flex justify-between mb-1 w-full">
                            <p className="font-semibold text-[14px]">Email:</p>
                            <span className="text-[14px]">
                                {orderById?.data?.data?.purchaseInfo?.email}
                            </span>
                        </div>
                        <div className="flex justify-between mb-1 w-full">
                            <p className="font-semibold text-[14px]">Số điện thoại:</p>
                            <span className="text-[14px]">
                                {orderById?.data?.data?.purchaseInfo?.phoneNumber}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div><span className="text-red-500">* </span> Chọn nhà cung cấp</div>
                        <Select onValueChange={(value) => handleSelectChange(Number(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn nhà cung cấp" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {orderById?.data?.data?.OrderProducts?.map((item: any) => {
                                        const supplierId = item?.Quote_History?.supplierId;
                                        if (item?.statusExport !== true && !processedSuppliers.has(supplierId)) {
                                            processedSuppliers.add(supplierId);
                                            return (
                                                <SelectItem key={item?.id} value={supplierId}>
                                                    {item?.Quote_History?.Supplier?.name}
                                                </SelectItem>
                                            );
                                        }
                                        return null;
                                    }).filter(Boolean)}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <div className="grid grid-cols-13 gap-1 justify-center items-center text-center">
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
                        <p>Lý do từ chối</p>
                    </div>
                    {selectedSupplierId ? <>
                        {orderById?.data?.data?.OrderProducts?.map((item: any, index: number) => {
                            return (
                                <>
                                    {(item?.Quote_History?.supplierId === selectedSupplierId && item?.statusExport === false) &&
                                        <div key={index} className="grid grid-cols-13 gap-2 mb-2">
                                            <div className="flex">
                                                <div className="flex justify-center items-center mr-2">
                                                    <Checkbox
                                                        // checked={item.isSelected}
                                                        onCheckedChange={(checked: boolean) => handleSelectItem(checked, index, item?.Quote_History?.quantity)}
                                                    />
                                                </div>
                                                <Input value={item?.Quote_History?.Product?.productCode} disabled />
                                            </div>
                                            <Input value={item?.Quote_History?.Product?.describe} disabled />
                                            <Input value={item?.Quote_History?.Supplier?.name} disabled />
                                            <Input value={item?.Quote_History?.Product?.producerInfo?.name} disabled />
                                            <Input
                                                defaultValue={item?.Quote_History?.quantity}
                                                type="number"
                                                min={0}
                                                onChange={(e) => handleInputChange(index, "quantityPO", e.target.value)}
                                            />
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
                                            <Input
                                                value={item?.reasonRefuse}
                                                placeholder={item?.reasonRefuse ? item?.reasonRefuse : "Nhập lí do"}
                                                onChange={(e) =>
                                                    handleInputChange(index, "reasonRefuse", e.target.value)
                                                }
                                            />
                                        </div>
                                    }
                                </>
                            );
                        })}
                    </> : <div className="text-center border py-10 rounded-md my-4">Vui lòng chọn nhà cung cấp để hiển thị đơn hàng !</div>}
                </div>

                <div className="flex justify-between mt-5">
                    <LostOrder id={orderById?.data?.data?.id} />
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/admin/orders")}
                        >
                            Quay lại
                        </Button>
                        <AlertDialogForm
                            action={
                                <Button
                                    className="bg-blue-300 hover:bg-blue-400 text-white hover:text-white border shadow-lg"
                                >
                                    Từ chối
                                </Button>
                            }
                            title="Bạn có chắc muốn từ chối đơn hàng này không?"
                            handleSubmit={handleSubmit}
                        />
                        < ModalExportPurchaseOrder
                            supplierId={Number(selectedSupplierId)}
                            productId={selectedProductIds}
                            data={orderById?.data?.data}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}