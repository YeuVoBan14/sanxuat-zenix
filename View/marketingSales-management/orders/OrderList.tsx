
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import React from 'react'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";

export default function OrderList({
    orderData,
    quote_code,
}: {
    orderData: any,
    quote_code?: string
}) {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div>
                    {quote_code}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1250px] mx-auto h-[650px] overflow-y-auto overflow-x-auto">
                <DialogHeader>
                    <DialogTitle>Đơn hàng</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className='grid grid-cols-2 gap-10'>
                    <div>
                        <div className='font-bold'>Thông tin khách hàng</div>
                        <div className='mt-4 text-[16px]'>
                            <div>
                                <div className='flex justify-between'>
                                    <div>Tên khách hàng</div>
                                    <h1>{orderData?.Customer?.customerName || ""}</h1>
                                </div>
                                <br />
                                <div className='flex justify-between'>
                                    <div>SĐT</div>
                                    <h1>{orderData?.Customer?.phoneNumber || ""}</h1>
                                </div>
                                <br />
                            </div>
                        </div>
                        <div className="text-[15px] mb-1 mt-3 font-medium">Địa chỉ nhận hàng</div>
                        <Input
                            value={orderData?.deliveryAddress || ""}
                            readOnly
                        />
                        <div className="text-[15px] mb-1 mt-3 font-medium">Số P.O</div>
                        <Input
                            value={orderData?.POCustomer || ""}
                            readOnly
                        />
                        <p className="text-[15px] mb-1 mt-3 font-medium">
                            Hạn thanh toán
                        </p>
                        <div className="relative w-full">
                            <Input
                                type="text"
                                value={orderData.paymentDeadline ? format(new Date(orderData.paymentDeadline), 'dd/MM/yyyy HH:mm') : ''}
                                readOnly
                                className="w-full pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                            />
                            <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                        </div>
                    </div>
                    <div>
                        <div className='font-bold'>Thông tin báo giá</div>
                        <div className='flex justify-between mt-4 text-[16px]'>
                            <div>
                                <div>Mã đơn hàng</div>
                                <div className='my-1'>Ngày tạo đơn</div>
                                <div>Số YCBG</div>
                                <div className='my-1'>Ngày tạo YCBG</div>
                                <div>Số BG</div>
                                <div className='my-1'>Ngày BG</div>
                                <div>Số lần chỉnh sửa</div>
                                <div className='mt-1'>Người tạo đơn</div>
                            </div>
                            <div className='grid grid-rows-8'>
                                <div>{orderData?.codeOrder || ""}</div>
                                <div>{orderData?.createdAt ? format(orderData.createdAt, "dd/MM/yyyy") : ""}</div>
                                <div>{orderData?.Quotation?.quoteRequirement?.RFQ || ""}</div>
                                <div>
                                    {orderData?.Quotation?.quoteRequirement?.createdAt
                                        ? format(orderData?.Quotation?.quoteRequirement?.createdAt, "dd/MM/yyyy")
                                        : ""}
                                </div>
                                <div>{orderData?.Quotation?.code || ""}</div>
                                <div>{orderData?.Quotation?.createdAt ? format(orderData?.Quotation?.createdAt, "dd/MM/yyyy") : ""}</div>
                                <div>{orderData?.numberEdit || 0}</div>
                                <div>{orderData?.Customer?.customerName || ""}</div>
                            </div>
                        </div>
                        <div className="text-[14px] mb-1 mt-3 font-medium">Sale phụ trách</div>
                        <Input
                            value={orderData?.saleInfo?.fullName || ""}
                            readOnly
                        />
                        <p className="text-[14px] mb-1 mt-3 font-medium">
                            Thời hạn yêu cầu Pur phản hồi
                        </p>
                        <div className="relative w-full">
                            <Input
                                type="text"
                                value={orderData.timePurResponse ? format(new Date(orderData.timePurResponse), 'dd/MM/yyyy HH:mm') : ''}
                                readOnly
                                className="w-full pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                            />
                            <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                        </div>
                        <div className="text-[14px] mb-1 mt-3 font-medium">Pur phụ trách</div>
                        <Input
                            value={orderData?.purchaseInfo?.fullName || ""}
                            readOnly
                        />
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between text-center">
                        <p className="text-[14px] w-[50px] translate-x-2">Mã SP</p>
                        <p className="text-[14px] w-[60px] translate-x-1">Mã tham vấn KH</p>
                        <p className="text-[14px] w-[50px]">Mã vật tư KH</p>
                        <p className="text-[14px] w-[50px] translate-x-4">Mô tả</p>
                        <p className="text-[14px] w-[60px] translate-x-5">Số lượng</p>
                        <p className="text-[14px] w-[50px] translate-x-4">Giá</p>
                        <p className="text-[14px] w-[50px] translate-x-3">VAT</p>
                        <p className="text-[14px] w-[50px]">
                            Đơn vị tính
                        </p>
                        <p className="text-[14px] w-[60px] translate-x-4">
                            Nhà sản xuất
                        </p>
                        <p className="text-[14px] w-[60px] translate-x-10">
                            Nhà cung cấp
                        </p>
                        <p className=" text-[14px] w-[80px] translate-x-9">
                            Thời gian giao hàng dự kiến
                        </p>
                        <p className="text-[14px] w-[50px]">Dự án</p>
                        <p className="text-[14px] w-[55px] -translate-x-6">Tiêu hao</p>
                        <p className="text-[14px] w-[60px] -translate-x-10">Thông tin thêm</p>
                        <p className="text-[14px] w-[50px] -translate-x-7">Ghi chú</p>
                    </div>
                    <div>
                        {orderData?.OrderProducts.map((item: any, index: number) => {
                            return (
                                <div key={index} className='flex items-center justify-between gap-1 mb-1'>
                                    <Input
                                        className="w-[70px]"
                                        value={item?.Quote_History?.Product?.productCode || ""}
                                        readOnly
                                    />
                                    <Input
                                        className="w-[70px]"
                                        value={item?.consultationCode || ""}
                                        readOnly
                                    />
                                    <Input
                                        className="w-[70px]"
                                        value={item?.itemCode || ""}
                                        readOnly
                                    />
                                    <Input
                                        value={item?.Quote_History?.Product?.describe || ""}
                                        readOnly
                                    />
                                    <Input
                                        className="w-[50px]"
                                        value={item?.Quote_History?.quantity || ""}
                                        readOnly
                                    />
                                    <Input
                                        className='w-[90px]'
                                        value={item?.Quote_History?.priceSale || ""}
                                        readOnly
                                    />
                                    <Input
                                        className="w-[50px]"
                                        value={item?.Quote_History?.VATSale || ""}
                                        readOnly
                                    />
                                    <Input
                                        className="w-[70px]"
                                        value={item?.Quote_History?.Product?.unit || ""}
                                        readOnly
                                    />
                                    <Input
                                        value={item?.Quote_History?.Product?.producerInfo?.name || ""}
                                        readOnly
                                    />
                                    <Input
                                        value={item?.Quote_History?.Supplier?.name || ""}
                                        readOnly
                                    />
                                    <Input
                                        className="w-[50px]"
                                        value={item?.Quote_History?.deliveryTime || ""}
                                        readOnly
                                    />
                                    <div className="w-[30px] ml-5">
                                        <Checkbox
                                            checked={(item?.Quote_History?.type === "D" || item?.Quote_History?.type === "DT") ? true : false}
                                        />
                                    </div>
                                    <div className="w-[30px] mx-5">
                                        <Checkbox
                                            checked={(item?.Quote_History?.type === "T" || item?.Quote_History?.type === "DT") ? true : false}
                                        />
                                    </div>
                                    <div className="flex items-center w-[100px] bg-blue-400 rounded-md border-none hover:bg-blue-500 h-[35px]">
                                        {item?.fileOrderProduct ? (
                                            <div className='w-[80px] text-[15px] text-center'>
                                                <a href={item?.fileOrderProduct} target="_blank" rel="noopener noreferrer">File</a>
                                            </div>
                                        ) : (
                                            <div className='w-[80px] text-[15px] text-center'>Không File</div>
                                        )}
                                    </div>
                                    <Input
                                        className="w-[100px]"
                                        value={item?.noteProductOrder}
                                        readOnly
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className='flex gap-10'>
                    <div className='w-[65%]'>
                        <div>Phương thức thanh toán</div>
                        <Input value={orderData?.Payment_Method?.name || ""} readOnly />
                    </div>
                    <div className='w-[35%]'>
                        <div>Ghi chú</div>
                        <Input value={orderData?.noteOrder || ""} readOnly />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
