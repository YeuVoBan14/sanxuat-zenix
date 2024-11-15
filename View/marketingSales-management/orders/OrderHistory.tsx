import React, { useRef, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { CalendarIcon } from "lucide-react";

export default function OrderHistory({
    dataList,
    quote_code,
}: {
    dataList: any;
    quote_code?: string;
}) {

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <DialogTitle className="text-[17px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {quote_code}
                    </DialogTitle>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1250px] mx-auto h-[650px] overflow-y-auto overflow-x-auto print-container">
                    <DialogHeader className="print-center">
                        <DialogTitle>Cập nhật lại đơn</DialogTitle>
                    </DialogHeader>
                    <div className='grid grid-cols-2 gap-10 over-flow-print'>
                        <div>
                            <div className='font-bold'>Thông tin bán hàng</div>
                            <div className='mt-4 text-[16px]'>
                                <div>
                                    <div className='flex justify-between'>
                                        <div>Tên khách hàng</div>
                                        <h1>{dataList?.Customer?.customerName}</h1>
                                    </div>
                                    <br />
                                    <div className='flex justify-between'>
                                        <div>SĐT</div>
                                        <h1>{dataList?.Customer?.phoneNumber}</h1>
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div className="text-[15px] mb-1 mt-3 font-medium">Địa chỉ nhận hàng</div>
                            <Input
                                defaultValue={dataList?.Customer?.address}
                                readOnly
                            />
                            <div className="text-[15px] mb-1 mt-3 font-medium">Số P.O</div>
                            <Input
                                defaultValue={dataList.POCustomer}
                                readOnly
                            />
                            <p className="text-[15px] mb-1 mt-3 font-medium">
                                Hạn thanh toán
                            </p>
                            <div className="relative w-full">
                                <Input
                                    type="text"
                                    value={dataList.paymentDeadline ? format(new Date(dataList.paymentDeadline), 'dd/MM/yyyy HH:mm') : ''}
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
                                    {/* <div>Số lần chỉnh sửa</div> */}
                                    <div className='mt-1'>Người tạo đơn</div>
                                </div>
                                <div className='grid grid-rows-8'>
                                    <div>{dataList?.codeOrder}</div>
                                    <div>{dataList?.createdAt ? format(dataList.createdAt, "dd/MM/yyyy") : ""}</div>
                                    <div>{dataList?.Quotation?.quoteRequirement?.RFQ}</div>
                                    <div>
                                        {dataList?.Quotation?.quoteRequirement?.createdAt
                                            ? format(dataList?.Quotation?.quoteRequirement?.createdAt, "dd/MM/yyyy")
                                            : ""}
                                    </div>
                                    <div>{dataList?.Quotation?.code}</div>
                                    <div>{dataList?.Quotation?.createdAt ? format(dataList?.Quotation?.createdAt, "dd/MM/yyyy") : ""}</div>
                                    {/* <div>{dataList?.numberEdit || 0}</div> */}
                                    <div>{dataList?.Customer?.customerName || ""}</div>
                                </div>
                            </div>
                            <div className="text-[14px] mb-1 mt-3 font-medium">Sale phụ trách</div>
                            <Input
                                value={dataList.saleInfo?.fullName}
                                readOnly
                            />
                            <p className="text-[14px] mb-1 mt-3 font-medium">
                                Thời hạn yêu cầu Pur phản hồi
                            </p>
                            <div className="relative w-full">
                                <Input
                                    type="text"
                                    value={dataList.timePurResponse ? format(new Date(dataList.timePurResponse), 'dd/MM/yyyy HH:mm') : ''}
                                    readOnly
                                    className="w-full pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                                />
                                <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                            </div>
                            <div className="text-[14px] mb-1 mt-3 font-medium">Pur phụ trách</div>
                            <Input
                                value={dataList.purchaseInfo?.fullName}
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
                            <p className="text-[14px] w-[60px] translate-x-3">Số lượng</p>
                            <p className="text-[14px] w-[50px] translate-x-4">Giá</p>
                            <p className="text-[14px] w-[50px] translate-x-3">VAT</p>
                            <p className="text-[14px] w-[50px] translate-x-2">
                                Đơn vị tính
                            </p>
                            <p className="text-[14px] w-[60px] translate-x-4">
                                Nhà sản xuất
                            </p>
                            <p className="text-[14px] w-[60px] translate-x-7">
                                Nhà cung cấp
                            </p>
                            <p className=" text-[14px] w-[80px] translate-x-2">
                                Thời gian giao hàng dự kiến
                            </p>
                            <p className="text-[14px] w-[50px] -translate-x-5">Dự án</p>
                            <p className="text-[14px] w-[55px] -translate-x-10">Tiêu hao</p>
                            <p className="text-[14px] w-[60px] -translate-x-12">Thông tin thêm</p>
                            <p className="text-[14px] w-[50px] -translate-x-10">Ghi chú</p>
                            <p className="text-[14px] w-[50px] -translate-x-5">Lý do từ chối</p>
                        </div>
                        <div>
                            {dataList?.OrderProducts.map((item: any) => {
                                return (
                                    <div className='flex items-center justify-between gap-1 mb-1'>
                                        <Input
                                            className="w-[70px]"
                                            defaultValue={item?.Quote_History?.Product?.productCode}
                                            readOnly
                                        />
                                        <Input
                                            className="w-[70px]"
                                            defaultValue={item.consultationCode}
                                            readOnly
                                        />
                                        <Input
                                            className="w-[70px]"
                                            defaultValue={item.itemCode}
                                            readOnly
                                        />
                                        <Input
                                            defaultValue={item?.Quote_History?.Product?.describe}
                                            readOnly
                                        />
                                        <Input
                                            className="w-[50px]"
                                            defaultValue={item?.Quote_History?.quantity}
                                            readOnly
                                        />
                                        <Input
                                            className='w-[90px]'
                                            defaultValue={item?.Quote_History?.priceSale}
                                            readOnly
                                        />
                                        <Input
                                            className="w-[50px]"
                                            defaultValue={item?.Quote_History?.VATSale}
                                            readOnly
                                        />
                                        <Input
                                            className="w-[70px]"
                                            defaultValue={item?.Quote_History?.Product?.unit}
                                            readOnly
                                        />
                                        <Input
                                            defaultValue={item?.Quote_History?.Product?.producerInfo?.name}
                                            readOnly
                                        />
                                        <Input
                                            defaultValue={item?.Quote_History?.Supplier?.name}
                                            readOnly
                                        />
                                        <Input
                                            className="w-[50px]"
                                            defaultValue={item?.Quote_History?.deliveryTime}
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
                                            {item?.fileOrderProduct === "null" ? (
                                                <div className='w-[80px] text-[15px] text-center'>Không File</div>
                                            ) : (
                                                <div className='w-[80px] text-[15px] text-center'>
                                                    <a href={item?.fileOrderProduct} target="_blank">File</a>
                                                </div>
                                            )}
                                        </div>
                                        <Input
                                            defaultValue={item?.noteProductOrder}
                                            readOnly
                                        />
                                        <Input defaultValue={item?.reasonRefuse} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className='flex gap-10'>
                        <div className='w-[65%]'>
                            <div>Phương thức thanh toán</div>
                            <Input defaultValue={dataList?.Payment_Method?.name} readOnly />
                        </div>
                        <div className='w-[35%]'>
                            <div>Ghi chú</div>
                            <Input readOnly defaultValue={dataList?.noteOrder} />
                        </div>
                    </div>
                    <DialogDescription></DialogDescription>
                    <DialogFooter className="button-print">
                        <Button type="button" variant="default" onClick={() => window.print()}>
                            In
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
