import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Print from "@/components/icons/Print";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/custom/data-table";
import { useState } from "react";
import { Paginations } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";


export default function SupplierDetail({
    data
}: {
    data?: any
}) {

    const [productPage, setProductPage] = useState(0);
    const [orderPage, setOrderPage] = useState(0);
    const pageSize = 10;

    const pageCountProduct = data?.products ? Math.ceil(data?.products?.length / pageSize) : 0;
    const productData = data?.products?.slice(productPage * pageSize, (productPage + 1) * pageSize);

    const pageCountOrder = data?.PurchaseOrders ? Math.ceil(data?.PurchaseOrders?.length / pageSize) : 0;
    const orderData = data?.PurchaseOrders?.slice(productPage * pageSize, (productPage + 1) * pageSize);

    const columnsProduct: ColumnDef<any>[] = [
        {
            id: "id",
            header: "STT",
            cell: ({ row }) => {
                return <div className="capitalize">
                    {row["index"] + 1 + productPage * pageSize}
                </div>;
            },
        },
        {
            accessorKey: "productCode",
            header: "Mã SP",
            cell: ({ row }) => <div>{row.original["productCode"]}</div>,
        },
        {
            accessorKey: "productName",
            header: "Tên SP",
            cell: ({ row }) => <div>{row.original["productName"]}</div>,
        },
        {
            accessorKey: "producerInfo",
            header: "Nhà SX",
            cell: ({ row }) => <div>{row.original["producerInfo"]?.name}</div>,
        },
        {
            accessorKey: "unit",
            header: "Đơn vị tính",
            cell: ({ row }) => <div>{row.original["unit"]}</div>,
        },
        {
            accessorKey: "type",
            header: "Loại hình",
            cell: ({ row }) => <div>{row.original["type"]}</div>,
        },
        {
            accessorKey: "image",
            header: "Ảnh",
            cell: ({ row }) => {
                return <>
                    {row.original["image"] !== null && <a href={`${row.original["image"]}`} target="_blank" className="hover:border-b-black hover:border-b-2" rel="noopener noreferrer">File</a>}
                </>;
            },
        },
        {
            id: "action",
            header: "",
        },
    ];

    const columnsOrderHistory: ColumnDef<any>[] = [
        {
            id: "id",
            header: "STT",
            cell: ({ row }) =>
                <div className="capitalize">
                    {row["index"] + 1 + orderPage * pageSize}
                </div>
            ,
        },
        {
            accessorKey: "POCode",
            header: "Số PO",
            cell: ({ row }) => <div>{row.original["POCode"]}</div>,
        },
        {
            accessorKey: "priceTerm",
            header: "Giá",
            cell: ({ row }) => <div>{row.original["priceTerm"]}</div>,
        },
        {
            accessorKey: "qualityTerm",
            header: "SL",
            cell: ({ row }) => <div>{row.original["qualityTerm"]}</div>,
        },
        {
            accessorKey: "executionTime",
            header: "Thời gian thực hiện",
            cell: ({ row }) => <div>{row.original["executionTime"]}</div>,
        },
        // {
        //     accessorKey: "PurchaseOrderProducts",
        //     header: "Chi tiết SP",
        //     cell: ({ row }) => <PurchaseOrderProductsDetail data={row.original["PurchaseOrderProducts"]} />,
        // },
        {
            id: "action",
            header: "",
        },
    ];

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <div>
                        <Print width="20" height="20" />
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1000px] max-h-[600px] overflow-y-auto scrollbar-thin w-full">
                    <DialogHeader>
                        <DialogTitle>Thông tin nhà cung cấp</DialogTitle>
                    </DialogHeader>
                    <div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="w-full">
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold text-[14px]">Tên nhà cung cấp:</p>
                                    <span className="text-[14px]">
                                        {data?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold text-[14px]">Mã số thuế:</p>
                                    <span className="text-[14px]">
                                        {data?.taxCode}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold text-[14px]">Người liên hệ:</p>
                                    <span className="text-[14px]">
                                        {data?.userContact}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold text-[14px]">Số điện thoại:</p>
                                    <span className="text-[14px]">
                                        {data?.phoneNumber}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold text-[14px]">Phương thức thanh toán:</p>
                                    <span className="text-[14px]">
                                        {data?.paymentMethod?.name}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full">
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold text-[14px]">Tên viết tắt:</p>
                                    <span className="text-[14px]">
                                        {data?.abbreviation}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold text-[14px]">Đánh giá:</p>
                                    <span className="text-[14px]">
                                        {data?.rate}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold text-[14px]">Địa chỉ:</p>
                                    <span className="text-[14px]">
                                        {data?.address}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold text-[14px]">Tài khoản ngân hàng:</p>
                                    <span className="text-[14px]">
                                        {data?.bankAccount}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {data?.fileSupplier &&
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold text-[14px]">Tệp đính kèm:</p>
                                    <span className="text-[14px]">
                                        <a href={data?.fileSupplier} className="font-semibold opacity-80 underline" target="_blank" rel="file">Xem tệp đính kèm</a>
                                    </span>
                                </div>
                            </div>
                        }

                        <Tabs defaultValue="product" className="w-full mt-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="product">Sản phẩm của NCC</TabsTrigger>
                                <TabsTrigger value="order_history">Lịch sử đặt hàng</TabsTrigger>
                            </TabsList>
                            <TabsContent value="product">
                                <DataTable data={productData || []} columns={columnsProduct} />
                                <div className="mt-5 flex justify-end">
                                    <Paginations
                                        currentPage={productPage}
                                        pageCount={pageCountProduct}
                                        onPageChange={setProductPage}
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="order_history">
                                <DataTable data={orderData || []} columns={columnsOrderHistory} />
                                <div className="mt-5 flex justify-end">
                                    <Paginations
                                        currentPage={orderPage}
                                        pageCount={pageCountOrder}
                                        onPageChange={setOrderPage}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}


export function PurchaseOrderProductsDetail({ data }: { data: any }) {
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const pageCount = data ? Math.ceil(data?.length / pageSize) : 0;
    const currentData = data?.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    const columns: ColumnDef<any>[] = [
        {
            id: "id",
            header: "STT",
            cell: ({ row }) =>
                <div className="capitalize">
                    {row["index"] + 1 + currentPage * pageSize}
                </div>
            ,
        },
        {
            accessorKey: "POCode",
            header: "Số PO",
            cell: ({ row }) => <div>{row.original["POCode"]}</div>,
        },
        {
            id: "action",
            header: "",
        },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Badge>
                    Chi tiết
                </Badge>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px] max-h-[600px] overflow-y-auto scrollbar-thin w-full">
                <DialogHeader>
                    <DialogTitle>Thông tin chi tiết</DialogTitle>
                </DialogHeader>
                <div>
                    <DataTable data={currentData || []} columns={columns} />
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
    )
}