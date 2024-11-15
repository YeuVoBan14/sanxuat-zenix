"use client"
import React, { useEffect, useRef, useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { toast } from "@/components/ui/use-toast";
import { UpdateOrder } from '@/api/order'
import { getPaymentMethod } from '@/api/payment'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getListUserByDepartment } from '@/api/quotations'
import LostOrder from './LostOrder'
import SelectComponent from '@/components/Select'
import { format } from 'date-fns'
import DatePicker from "react-datepicker";
import { CalendarIcon } from "lucide-react";

type TypeData = {
    saleManager: number;
    purManager: number;
    productCode: string[];
    describe: string[];
    quantity: string[];
    unit: string[];
    note: string[];
    project: boolean[];
    consumption: boolean[];
    priceSale: number[];
    VAT: number[];
    supplier: number[];
    POCustomer: string;
    deliveryAddress: string;
    timePurResponse: Date;
    paymentDeadline: Date;
    salerId: number;
    purchaseId: number;
    noteOrder: string;
    paymentMethodId: number;
    productQuotationId: number[];
    consultationCode: string[];
    itemCode: string[];
    hasFile: string[];
    noteProductOrder: string[];
    fileOrders: string[];
    type: string[];
    deliveryTime: string[];
    producerName: string[];
    supplierName: string[];
    fileOrderProduct?: File[];
    reasonRefuse: string[];
};

const initialData: TypeData = {
    saleManager: 0,
    purManager: 0,
    productCode: [],
    describe: [],
    quantity: [],
    unit: [],
    note: [],
    project: [false],
    consumption: [false],
    priceSale: [],
    VAT: [],
    supplier: [],
    POCustomer: "",
    deliveryAddress: "",
    timePurResponse: new Date(),
    paymentDeadline: new Date(),
    salerId: 0,
    purchaseId: 0,
    noteOrder: "",
    paymentMethodId: 0,
    productQuotationId: [],
    consultationCode: [],
    itemCode: [],
    hasFile: [],
    noteProductOrder: [],
    fileOrders: [],
    type: [],
    deliveryTime: [],
    producerName: [],
    supplierName: [],
    fileOrderProduct: [],
    reasonRefuse: [],
};


export default function OrderInfo({
    dataList,
    timeLineEdit,
    quote_code
}: {
    dataList: any;
    quote_code?: string;
    timeLineEdit?: boolean;
}) {

    const [listData, setListData] = useState<TypeData>(initialData);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [fileUploaded, setFileUploaded] = useState<boolean[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [orderFiles, setOrderFiles] = useState<(File | null)[]>([]);
    const orderDatePickerRef = useRef<DatePicker>(null);
    const paymentDatePickerRef = useRef<DatePicker>(null);

    const queryClient = useQueryClient();


    const { data: listSale } = useQuery({
        queryKey: ["listSale"],
        queryFn: () => getListUserByDepartment("sale"),
    });
    const { data: listPur } = useQuery({
        queryKey: ["listPur"],
        queryFn: () => getListUserByDepartment("purchase"),
    });
    const {
        data: paymentMethodList,
    } = useQuery({ queryKey: ["paymentMethodList"], queryFn: getPaymentMethod });

    const handleOrderDivClick = () => {
        if (orderDatePickerRef.current) {
            orderDatePickerRef.current.setFocus();
        }
    };

    const handlePaymentClick = () => {
        if (paymentDatePickerRef.current) {
            paymentDatePickerRef.current.setFocus();
        }
    };

    const handleOrderChange = (date: Date) => {
        setListData({ ...listData, timePurResponse: date });
    };
    const handlePaymentDateChange = (date: Date) => {
        setListData({ ...listData, paymentDeadline: date });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: keyof TypeData
    ) => {
        const { value } = e.target;
        setListData((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleArrayInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number,
        field: keyof TypeData
    ) => {
        const { value } = e.target;

        setListData((prevState) => {
            const fieldData = prevState[field];
            if (Array.isArray(fieldData)) {
                return {
                    ...prevState,
                    [field]: fieldData.map((item, i) => (i === index ? value : item)),
                };
            }
            return prevState;
        });
    };

    useEffect(() => {
        if (dataList) {
            addProductsFromQuoteHistories(quoteHistoryData);
        }
    }, [dataList]);

    const addProductsFromQuoteHistories = (quoteHistories: any) => {
        const quoteHistoryData = dataList?.OrderProducts?.map((item: any) => item.Quote_History) || [];
        const fileOrderProduct = dataList?.OrderProducts?.map((item: any) => item.fileOrderProduct) || [];

        setListData((prevState) => ({
            ...prevState,
            productQuotationId: quoteHistoryData.map((item: any) => item?.id),
            productCode: quoteHistoryData.map((item: any) => item?.Product?.productCode),
            deliveryAddress: dataList?.deliveryAddress,
            POCustomer: dataList?.POCustomer,
            noteOrder: dataList?.noteOrder,
            timePurResponse: dataList?.timePurResponse,
            paymentDeadline: dataList?.paymentDeadline,
            producerName: quoteHistoryData.map((item: any) => item?.Product?.producerInfo?.name),
            supplierName: quoteHistoryData.map((item: any) => item?.Supplier?.name),
            describe: quoteHistoryData.map((item: any) => item?.Product?.describe),
            quantity: quoteHistoryData.map((item: any) => item?.quantity),
            unit: quoteHistoryData.map((item: any) => item?.unit),
            consultationCode: dataList?.OrderProducts?.map((item: any) => item?.consultationCode),
            itemCode: dataList?.OrderProducts?.map((item: any) => item?.itemCode),
            noteProductOrder: dataList?.OrderProducts?.map((item: any) => item?.noteProductOrder),
            priceSale: quoteHistoryData.map((item: any) => item?.priceSale),
            deliveryTime: quoteHistoryData.map((item: any) => item?.deliveryTime),
            VAT: quoteHistoryData.map((item: any) => item?.VATSale),
            fileOrderProduct: fileOrderProduct,
            salerId: dataList?.salerId,
            paymentMethodId: dataList?.paymentMethodId,
            reasonRefuse: dataList?.OrderProducts?.map((item: any) => item?.reasonRefuse),
            type: quoteHistoryData?.map((item: any) => item?.Product?.type),
        }));

        setFileUploaded(dataList?.OrderProducts?.map(() => false));
        setOrderFiles(dataList?.OrderProducts?.map(() => null));
        fileInputRefs.current = dataList?.OrderProducts?.map(() => null);
    };

    const handleFileUpload = (index: number, event: any) => {
        const file = event.target.files[0];

        if (file) {
            setFileUploaded((prev) => {
                const newUploaded = [...prev];
                newUploaded[index] = true;
                return newUploaded;
            });
            setOrderFiles((prev) => {
                const newFiles = [...prev];
                newFiles[index] = file;
                return newFiles;
            });
        }
    };

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            const hasFile = fileUploaded.map((uploaded) => (uploaded ? 1 : 0));
            const orderFile = orderFiles.filter((file) => file !== null);

            formData.append("POCustomer", listData.POCustomer || "");
            formData.append("deliveryAddress", listData.deliveryAddress || "");
            formData.append("timePurResponse", listData.timePurResponse.toString());
            formData.append("paymentDeadline", listData.paymentDeadline.toString());
            formData.append("noteOrder", listData.noteOrder || "");
            formData.append("salerId", listData.salerId.toString());
            formData.append("paymentMethodId", listData.paymentMethodId.toString());

            (listData.noteProductOrder || []).forEach((note) =>
                formData.append("noteProductOrder[]", note)
            );
            (listData.consultationCode || []).forEach((code) =>
                formData.append("consultationCode[]", code)
            );
            (listData.itemCode || []).forEach((code) =>
                formData.append("itemCode[]", code)
            );
            (listData.productQuotationId || []).forEach((id: any) =>
                formData.append("productQuotationId[]", id)
            );

            hasFile.forEach((fileFlag) =>
                formData.append("hasFile[]", fileFlag.toString())
            );

            orderFile.forEach((file) =>
                formData.append("fileOrders", file as Blob)
            );

            (listData.fileOrderProduct || []).forEach((file) =>
                formData.append("fileOrderProduct[]", file)
            );

            const result = await UpdateOrder({
                id: dataList?.id,
                data: formData,
            });

            if (result?.success) {
                setListData(initialData);
                setIsLoading(false);
                queryClient.invalidateQueries({
                    queryKey: ["listOrder"],
                });
                toast({
                    title: "Thành công",
                    description: "Cập nhật đơn hàng thành công"
                });
            } else {
                toast({ title: "Thất bại", description: "Cập nhật thất bại" });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const quoteHistoryData = dataList?.OrderProducts?.map((item: any) => item.Quote_History) || [];

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <div className={(timeLineEdit || quote_code) ? "" : "text-[17px] whitespace-nowrap overflow-hidden text-ellipsis"}>
                        {timeLineEdit ? "Cập nhật đơn hàng" : quote_code}
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1250px] mx-auto h-[650px] overflow-y-auto overflow-x-auto">
                    <DialogHeader>
                        <DialogTitle>Cập nhật lại đơn</DialogTitle>
                        <br />
                    </DialogHeader>
                    <div className='grid grid-cols-2 gap-10'>
                        <div>
                            <div className='font-bold'>Thông tin bán hàng</div>
                            <div className='mt-4 text-[16px]'>
                                <div>
                                    <div className='flex justify-between'>
                                        <div>Tên khách hàng</div>
                                        <h1>{dataList?.Customer?.customerName || ""}</h1>
                                    </div>
                                    <br />
                                    <div className='flex justify-between'>
                                        <div>SĐT</div>
                                        <h1>{dataList?.Customer?.phoneNumber || ""}</h1>
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div className="text-[15px] mb-1 mt-3 font-medium">Địa chỉ nhận hàng</div>
                            <Input
                                value={listData?.deliveryAddress}
                                onChange={(e) => handleInputChange(e, "deliveryAddress")}
                                placeholder="Nhập địa chỉ nhận hàng"
                            />
                            <div className="text-[15px] mb-1 mt-3 font-medium">Số P.O</div>
                            <Input
                                value={listData?.POCustomer}
                                onChange={(e) => handleInputChange(e, "POCustomer")}
                                placeholder="Nhập số P.O (Sale tự nhập vào hệ thống)"
                            />
                            <div>
                                <p className="text-[14px] mb-1 mt-3 font-medium">
                                    Hạn thanh toán
                                </p>
                                <div
                                    onClick={handlePaymentClick}
                                    className="flex items-center border border-gray-300 rounded-md pl-8 pr-3 py-2 cursor-pointer"
                                >
                                    <DatePicker
                                        ref={paymentDatePickerRef}
                                        selected={listData.paymentDeadline ? new Date(listData.paymentDeadline) : null}
                                        onChange={handlePaymentDateChange}
                                        showTimeSelect
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        placeholderText="Chọn ngày và giờ"
                                        className="w-full border-none focus:outline-none focus:ring-0 px-2"
                                        minDate={new Date()}
                                    />
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </div>
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
                            <div>
                                <div className="text-[14px] mb-1 mt-3 font-medium">Sale phụ trách</div>
                                <SelectComponent
                                    key="saleManager"
                                    label="Sale phụ trách"
                                    placeholder={dataList?.saleInfo?.fullName}
                                    data={listSale?.data?.data?.map((item: any) => ({
                                        value: item.id,
                                        name: item.fullName,
                                    }))}
                                    value={listData.saleManager}
                                    setValue={(val: number) =>
                                        setListData((prevState) => ({
                                            ...prevState,
                                            saleManager: val,
                                        }))
                                    }
                                    displayProps="name"
                                />
                            </div>
                            <div>
                                <p className="text-[14px] mb-1 mt-3 font-medium">
                                    Thời hạn yêu cầu Pur phản hồi
                                </p>
                                <div
                                    onClick={handleOrderDivClick}
                                    className="flex items-center border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
                                >
                                    <DatePicker
                                        ref={orderDatePickerRef}
                                        selected={listData.timePurResponse ? new Date(listData.timePurResponse) : null}
                                        onChange={handleOrderChange}
                                        showTimeSelect
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        placeholderText="Chọn ngày và giờ"
                                        className="w-full ml-3 border-none focus:outline-none focus:ring-0"
                                        minDate={new Date()}
                                    />
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </div>
                            </div>
                            <div>
                                <div className="text-[14px] mb-1 mt-3 font-medium">Pur phụ trách</div>
                                <SelectComponent
                                    key="purManager"
                                    label="Pur phụ trách"
                                    placeholder={dataList?.purchaseInfo?.fullName || "Chọn một purchase"}
                                    data={listPur?.data?.data?.map((item: any) => ({
                                        value: item.id,
                                        name: item.fullName,
                                    }))}
                                    value={listData.purManager}
                                    setValue={(val: number) =>
                                        setListData((prevState) => ({
                                            ...prevState,
                                            purManager: val,
                                        }))
                                    }
                                    displayProps="name"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between text-center">
                            <p className="text-[14px] w-[50px] translate-x-2">Mã SP</p>
                            <p className="text-[14px] w-[60px] translate-x-1">Mã tham vấn KH</p>
                            <p className="text-[14px] w-[50px] translate-x-2">Mã vật tư KH</p>
                            <p className="text-[14px] w-[50px] translate-x-6">Mô tả</p>
                            <p className="text-[14px] w-[60px] translate-x-8">Số lượng</p>
                            <p className="text-[14px] w-[50px] translate-x-8">Giá</p>
                            <p className="text-[14px] w-[50px] translate-x-8">VAT</p>
                            <p className="text-[14px] w-[50px] translate-x-8">
                                Đơn vị tính
                            </p>
                            <p className="text-[14px] w-[60px] translate-x-7">
                                Nhà sản xuất
                            </p>
                            <p className="text-[14px] w-[60px] translate-x-5">
                                Nhà cung cấp
                            </p>
                            <p className=" text-[14px] w-[80px]">
                                Thời gian giao hàng dự kiến
                            </p>
                            <p className="text-[14px] w-[50px] -translate-x-7">Dự án</p>
                            <p className="text-[14px] w-[55px] -translate-x-12">Tiêu hao</p>
                            <p className="text-[14px] w-[60px] -translate-x-14">Thông tin thêm</p>
                            <p className="text-[14px] w-[50px] -translate-x-12">Ghi chú</p>
                            <p className="text-[14px] w-[50px] -translate-x-6">Lý do từ chối</p>
                        </div>
                        {listData.productCode.map((item, index) => (
                            <div key={index} className='flex mt-1 gap-1'>
                                <Input
                                    className="w-[70px]"
                                    placeholder="Mã sản phẩm"
                                    value={listData.productCode[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[70px]"
                                    placeholder="Mã tham vấn KH"
                                    value={listData.consultationCode[index]}
                                    onChange={(e) =>
                                        handleArrayInputChange(e, index, "consultationCode")
                                    }
                                />
                                <Input
                                    className="w-[70px]"
                                    placeholder="Mã vật tư KH"
                                    value={listData.itemCode[index]}
                                    onChange={(e) =>
                                        handleArrayInputChange(e, index, "itemCode")
                                    }
                                />
                                <Input
                                    className='w-[100px]'
                                    placeholder="Mô tả"
                                    value={listData.describe[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[50px]"
                                    placeholder="Số lượng"
                                    value={listData.quantity[index]}
                                    disabled
                                />
                                <Input
                                    className='w-[90px]'
                                    placeholder="Giá"
                                    value={listData.priceSale[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[50px]"
                                    placeholder="VAT"
                                    value={listData.VAT[index]}
                                    disabled
                                />
                                <Input
                                    className='w-[70px]'
                                    placeholder="Đơn vị tính"
                                    value={listData.unit[index]}
                                    disabled
                                />
                                <Input
                                    placeholder="Nhà sản xuất"
                                    value={listData.producerName[index]}
                                    disabled
                                />
                                <Input
                                    placeholder="Nhà cung cấp"
                                    value={listData.supplierName[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[50px]"
                                    value={listData.deliveryTime[index]}
                                    disabled
                                />
                                <div className="w-[30px] ml-5 m-auto">
                                    <Checkbox
                                        checked={(quoteHistoryData[0]?.type === "D" || quoteHistoryData[0]?.type === "DT") ? true : false}
                                    />
                                </div>
                                <div className="w-[30px] mx-5 m-auto">
                                    <Checkbox
                                        checked={(quoteHistoryData[0]?.type === "T" || quoteHistoryData[0]?.type === "DT") ? true : false}
                                    />
                                </div>
                                <div className="flex items-center justify-center">
                                    <input
                                        type="file"
                                        id={`file-upload-${index}`}
                                        ref={(el) => (fileInputRefs.current[index] = el)}
                                        className="hidden"
                                        onChange={(event) => handleFileUpload(index, event)}
                                        name={`orderFile`}
                                    />
                                    <Button
                                        className="w-20 bg-blue-400 text-black border-none hover:bg-blue-500"
                                        style={{
                                            borderRadius: "8px",
                                            padding: "8px 16px",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => fileInputRefs.current[index]?.click()}
                                    >
                                        {listData?.hasFile[index] ? "Đã tải file" : (fileUploaded[index] ? "Đã tải file" : "Tải file")}
                                    </Button>
                                </div>
                                <Input
                                    className="w-[90px]"
                                    placeholder="Ghi chú"
                                    value={listData.noteProductOrder[index]}
                                    onChange={(e) => handleArrayInputChange(e, index, "noteProductOrder")}
                                />
                                <Input className="w-[90px]" value={listData.reasonRefuse[index]} disabled />
                            </div>
                        ))}
                    </div>
                    <div className='flex gap-10'>
                        <div className='w-[65%]'>
                            <p className="text-[14px] mb-1 font-medium">Phương thức thanh toán</p>
                            <SelectComponent
                                key="paymentMethodId"
                                label="Phương thức thanh toán"
                                placeholder={dataList?.Payment_Method?.name}
                                data={paymentMethodList?.data?.map((item: any) => ({
                                    value: item.id,
                                    name: item.name,
                                }))}
                                value={listData.paymentMethodId}
                                setValue={(val: number) =>
                                    setListData((prevState) => ({
                                        ...prevState,
                                        paymentMethodId: val,
                                    }))
                                }
                                displayProps="name"
                            />
                        </div>
                        <div className='w-[35%]'>
                            <div>Ghi chú</div>
                            <Input
                                value={listData.noteOrder}
                                onChange={(e) => handleInputChange(e, "noteOrder")}
                                placeholder="Nhập ghi chú"
                            />
                        </div>
                    </div>
                    <DialogDescription></DialogDescription>
                    <DialogFooter>
                        <div className="flex justify-between w-full">
                            <LostOrder id={dataList?.id} />
                            <div className="flex gap-3">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">
                                        Thoát
                                    </Button>
                                </DialogClose>
                                <Button onClick={handleUpdate} type="button" className="bg-blue-500 hover:bg-blue-600">Gửi</Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
