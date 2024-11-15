
"use client";
import React, { useState, useRef, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import SelectComponent from "@/components/Select";
import { MdDelete } from "react-icons/md";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import { getListQuotationById, getListUserByDepartment, getListUserByDepartmentAndCustomerId } from "@/api/quotations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { createOrder } from "@/api/order";
import { getPaymentMethod } from "@/api/payment";
import { useParams, useRouter } from "next/navigation";

type TypeData = {
    saleManager: number;
    purManager: number;
    productCode: string[];
    productName: string[];
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
    fileOrders: string;
    deliveryTime: string[];
    producerName: string[];
    type: string[];
    supplierName: string[];
};

const initialData: TypeData = {
    saleManager: 0,
    purManager: 0,
    productCode: [],
    productName: [],
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
    fileOrders: "",
    deliveryTime: [],
    producerName: [],
    type: [],
    supplierName: [],
};

export default function CreateOrder() {
    const route = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [quoteRequirementData, setQuoteRequirementData] = useState<TypeData>(initialData);
    const [fileUploaded, setFileUploaded] = useState<boolean[]>([]);
    const [productFiles, setProductFiles] = useState<(File | null)[]>([]);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const quoteDatePickerRef = useRef<DatePicker>(null);
    const paymentDatePickerRef = useRef<DatePicker>(null);
    const [quoteDeadline, setQuoteDeadline] = useState<Date | null>(null);
    const [paymentDead, setPaymentDead] = useState<Date | null>(null);

    const {
        data: listQuotationById,
        error,
        refetch,
    } = useQuery({
        queryKey: ["listQuotationById", params?.id],
        queryFn: () => getListQuotationById(Number(params?.id)),
    });
    const dataList = listQuotationById?.data?.data;
    const { data: listSale } = useQuery({
        queryKey: ["listSale", dataList?.Customer?.id],
        queryFn: () => getListUserByDepartmentAndCustomerId("sale", Number(dataList?.Customer?.id)),
    });

    const { data: listPur } = useQuery({
        queryKey: ["listPur"],
        queryFn: () => getListUserByDepartment("purchase"),
    });

    const {
        data: paymentMethodList
    } = useQuery({
        queryKey: ["paymentMethodList"],
        queryFn: getPaymentMethod
    });

    const handleQuoteDivClick = () => {
        if (quoteDatePickerRef.current) {
            quoteDatePickerRef.current.setFocus();
        }
    };
    const handlePaymentClick = () => {
        if (paymentDatePickerRef.current) {
            paymentDatePickerRef.current.setFocus();
        }
    };

    const handleQuoteDateChange = (date: Date) => {
        setQuoteDeadline(date);
        setQuoteRequirementData({ ...quoteRequirementData, timePurResponse: date });
    };

    const handlePaymentDateChange = (date: Date) => {
        setPaymentDead(date);
        setQuoteRequirementData({ ...quoteRequirementData, paymentDeadline: date });
    };

    const handleFileUpload = (index: number, event: any) => {
        const file = event.target.files[0];
        if (file) {
            setFileUploaded((prev) => {
                const newUploaded = [...prev];
                newUploaded[index] = true;
                return newUploaded;
            });
            setProductFiles((prev) => {
                const newFiles = [...prev];
                newFiles[index] = file;
                return newFiles;
            });
        }
    };

    const handleArrayInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number,
        field: keyof TypeData
    ) => {
        const { value } = e.target;

        setQuoteRequirementData((prevState) => {
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: keyof TypeData
    ) => {
        const { value } = e.target;
        setQuoteRequirementData((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    useEffect(() => {
        if (dataList) {
            addProductsFromQuoteHistories(dataList);
        }
    }, [dataList]);

    const addProductsFromQuoteHistories = (quoteHistories: any) => {
        setQuoteRequirementData((prevState) => ({
            ...prevState,
            productQuotationId: quoteHistories?.Quote_Histories?.map((item: any) => item.id || ""),
            productCode: quoteHistories?.Quote_Histories?.map((item: any) => item.Product.productCode || ""),
            productName: quoteHistories?.Quote_Histories?.map((item: any) => item.Product.productName || ""),
            deliveryAddress: quoteHistories?.deliveryAddress || "",
            producerName: quoteHistories?.Quote_Histories?.map((item: any) => item.Product.producerInfo.name || ""),
            supplierName: quoteHistories?.Quote_Histories?.map((item: any) => item.Supplier.name || ""),
            describe: quoteHistories?.Quote_Histories?.map((item: any) => item.Product.describe || ""),
            quantity: quoteHistories?.Quote_Histories?.map((item: any) => item.quantity || ""),
            unit: quoteHistories?.Quote_Histories?.map((item: any) => item.unit || ""),
            consultationCode: quoteHistories?.Quote_Histories?.map((item: any) => item.consultationCode || ""),
            itemCode: quoteHistories?.Quote_Histories?.map((item: any) => item.itemCode || ""),
            noteProductOrder: quoteHistories?.Quote_Histories?.map((item: any) => item.noteProductOrder || ""),
            priceSale: quoteHistories?.Quote_Histories?.map((item: any) => item.priceSale || ""),
            deliveryTime: quoteHistories?.Quote_Histories?.map((item: any) => item.deliveryTime || ""),
            VAT: quoteHistories?.Quote_Histories?.map((item: any) => item.VATSale || ""),
            type: quoteHistories?.Quote_Histories?.map((item: any) => item.type || ""),
            purchaseId: dataList?.purchaseId || "",
            salerId: dataList?.saleId || "",
        }));
        setFileUploaded(quoteHistories?.Quote_Histories?.map(() => false));
        setProductFiles(quoteHistories?.Quote_Histories?.map(() => null));
        fileInputRefs.current = quoteHistories?.Quote_Histories?.map(() => null);
    };

    const removeProduct = (index: number) => {
        setQuoteRequirementData((prevState) => ({
            ...prevState,
            productQuotationId: prevState.productQuotationId.filter((_, i) => i !== index),
            productCode: prevState.productCode.filter((_, i) => i !== index),
            describe: prevState.describe.filter((_, i) => i !== index),
            quantity: prevState.quantity.filter((_, i) => i !== index),
            unit: prevState.unit.filter((_, i) => i !== index),
            note: prevState.note.filter((_, i) => i !== index),
            project: prevState.project.filter((_, i) => i !== index),
            consumption: prevState.consumption.filter((_, i) => i !== index),
            consultationCode: prevState.consultationCode.filter((_, i) => i !== index),
            deliveryTime: prevState.deliveryTime.filter((_, i) => i !== index),
            VAT: prevState.VAT.filter((_, i) => i !== index),
            itemCode: prevState.itemCode.filter((_, i) => i !== index),
            noteProductOrder: prevState.noteProductOrder.filter((_, i) => i !== index),
            priceSale: prevState.priceSale.filter((_, i) => i !== index),
            producerName: prevState.producerName.filter((_, i) => i !== index),
            supplierName: prevState.supplierName.filter((_, i) => i !== index),
            productName: prevState.productName.filter((_, i) => i !== index),

        }));
        setFileUploaded((prev) => prev.filter((_, i) => i !== index));
        setProductFiles((prev) => prev.filter((_, i) => i !== index));
        fileInputRefs.current.splice(index, 1);
    };

    const mutation = useMutation({
        mutationFn: (data: any) => createOrder(dataList?.id, data),
        onSuccess: () => {
            route.push("/admin/orders")
            setQuoteRequirementData(initialData);
            queryClient.invalidateQueries({
                queryKey: ["listOrder"],
            });
            setIsLoading(false);
            toast({
                title: "Thành công",
                description: `Tạo đơn hàng thành công`,
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

    const validateField = (field: any, message: string) => {
        if (!field) {
            toast({
                title: "Thất bại",
                description: message,
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        if (
            !validateField(quoteRequirementData.deliveryAddress, "Vui lòng nhập địa chỉ nhận hàng !") ||
            !validateField(quoteRequirementData.POCustomer, "Vui lòng nhập số PO !") ||
            !validateField(quoteRequirementData.paymentDeadline, "Vui lòng nhập hạn thanh toán !") ||
            !validateField(quoteRequirementData.salerId, "Vui lòng chọn Sale phụ trách !") ||
            !validateField(quoteRequirementData.timePurResponse, "Vui lòng nhập thời hạn yêu cầu Pur phản hồi !") ||
            !validateField(quoteRequirementData.purchaseId, "Vui lòng chọn Pur phụ trách !") ||
            !validateField(quoteRequirementData.consultationCode, "Vui lòng nhập mã tham vấn khách hàng !") ||
            !validateField(quoteRequirementData.itemCode, "Vui lòng nhập mã vật tư khách hàng !") ||
            !validateField(quoteRequirementData.paymentMethodId, "Vui lòng chọn phương thức thanh toán !")
        ) {
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        const hasFile = fileUploaded.map((uploaded) => (uploaded ? 1 : 0));
        const productFile = productFiles.filter((file) => file !== null);

        formData.append("POCustomer", quoteRequirementData.POCustomer.toString() || "");
        formData.append("deliveryAddress", quoteRequirementData.deliveryAddress || "");
        formData.append("timePurResponse", quoteRequirementData.timePurResponse.toString() || "");
        formData.append("paymentDeadline", quoteRequirementData.paymentDeadline.toString() || "");
        formData.append("noteOrder", quoteRequirementData.noteOrder.toString() || "");
        formData.append("salerId", quoteRequirementData.salerId.toString() || "");
        formData.append("purchaseId", quoteRequirementData.purchaseId?.toString() || "");
        formData.append("paymentMethodId", quoteRequirementData.paymentMethodId.toString() || "");

        quoteRequirementData.noteProductOrder.forEach((code) =>
            formData.append("noteProductOrder[]", code)
        );
        quoteRequirementData.consultationCode.forEach((code) =>
            formData.append("consultationCode[]", code)
        );
        quoteRequirementData.itemCode.forEach((code) =>
            formData.append("itemCode[]", code)
        );
        quoteRequirementData.productQuotationId.forEach((id: any) =>
            formData.append("productQuotationId[]", id)
        );

        hasFile.forEach((fileFlag) =>
            formData.append("hasFile[]", fileFlag.toString())
        );

        productFile.forEach((file) =>
            formData.append("fileOrders", file as Blob)
        );

        mutation.mutateAsync(formData);
    };

    return (
        <>
            <div >
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h1 className="font-bold text-center">Thông tin khách hàng</h1>
                        <div className="mt-4 text-[16px]">
                            <div>
                                <div className="flex justify-between">
                                    <div>Tên khách hàng</div>
                                    <h1>{dataList?.Customer?.customerName || ""}</h1>
                                </div>
                                <br />
                                <div className="flex justify-between">
                                    <div>SĐT</div>
                                    <h1>{dataList?.Customer?.phoneNumber || ""}</h1>
                                </div>
                                <br />
                                <div className="flex justify-between">
                                    <div>Địa chỉ</div>
                                    <h1>{dataList?.Customer?.address || ""}</h1>
                                </div>
                                <br />
                            </div>
                        </div>
                        <div className="text-[15px] mb-1 mt-3 font-medium">Địa chỉ nhận hàng</div>
                        <Input
                            value={quoteRequirementData?.deliveryAddress}
                            onChange={(e) => handleInputChange(e, "deliveryAddress")}
                            placeholder="Nhập địa chỉ nhận hàng"
                        />
                        <div className="text-[15px] mb-1 mt-3 font-medium">Số P.O</div>
                        <Input
                            value={quoteRequirementData?.POCustomer}
                            onChange={(e) => handleInputChange(e, "POCustomer")}
                            placeholder="Nhập số P.O (Sale tự nhập vào hệ thống)"
                        />
                        <div>
                            <p className="text-[15px] mb-1 mt-3 font-medium">
                                Hạn thanh toán
                            </p>
                            <div
                                onClick={handlePaymentClick}
                                className="flex items-center border shadow-md border-gray-300 rounded-md pl-1 pr-3 py-2 cursor-pointer"
                            >
                                <DatePicker
                                    ref={paymentDatePickerRef}
                                    selected={paymentDead}
                                    onChange={handlePaymentDateChange}
                                    showTimeSelect
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    placeholderText="Chọn ngày và giờ"
                                    className="w-[350px] focus:outline-none focus:ring-0 px-2"
                                    minDate={new Date()}
                                />
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h1 className="font-bold text-center">Thông tin báo giá</h1>
                        <div className="flex justify-between mt-4 text-[16px]">
                            <div className="leading-[18px]">
                                <div>Mã đơn hàng</div>
                                <div className="my-1">Ngày tạo đơn</div>
                                <div>Số YCBG</div>
                                <div className="my-1">Ngày tạo YCBG</div>
                                <div>Số BG</div>
                                <div className="my-1">Ngày BG</div>
                                {/* <div>Số lần chỉnh sửa</div> */}
                                <div className="mt-1">Người tạo đơn</div>
                            </div>
                            <div className="grid grid-rows-8 leading-[18px]">
                                <div>{dataList?.code}</div>
                                <div>{dataList?.createdAt ? format(dataList?.createdAt, "dd/MM/yyyy") : ""}</div>
                                <div>{dataList?.quoteRequirement?.RFQ}</div>
                                <div>
                                    {dataList?.quoteRequirement?.createdAt
                                        ? format(dataList?.quoteRequirement?.createdAt, "dd/MM/yyyy")
                                        : ""}
                                </div>
                                <div>{dataList?.Quotation?.code}</div>
                                <div>{dataList?.Quotation ? format(dataList?.Quotation?.createdAt, "dd/MM/yyyy") : ""}</div>
                                {/* <div>{dataList?.numberEditQuatation}</div> */}
                                <div>{dataList?.Customer?.customerName}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-[14px] mb-1 mt-3 font-medium">Sale phụ trách</div>
                            <SelectComponent
                                key="salerId"
                                label="Sale phụ trách"
                                placeholder={dataList?.saleInfo?.fullName || "Chọn một sale phụ trách"}
                                data={listSale?.data?.data?.map((item: any) => ({
                                    value: item.id,
                                    name: item.fullName,
                                }))}
                                value={quoteRequirementData.salerId}
                                setValue={(val: number) =>
                                    setQuoteRequirementData((prevState) => ({
                                        ...prevState,
                                        salerId: val,
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
                                onClick={handleQuoteDivClick}
                                className="flex items-center border shadow-md border-gray-300 rounded-md px-3 py-2 cursor-pointer"
                            >
                                <DatePicker
                                    ref={quoteDatePickerRef}
                                    selected={quoteDeadline}
                                    onChange={handleQuoteDateChange}
                                    showTimeSelect
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    placeholderText="Chọn ngày và giờ"
                                    className="w-full border-none focus:outline-none focus:ring-0"
                                    minDate={new Date()}
                                />
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </div>
                        </div>
                        <div>
                            <div className="text-[14px] mb-1 mt-3 font-medium">Pur phụ trách</div>
                            <SelectComponent
                                key="purchaseId"
                                label="Pur phụ trách"
                                placeholder={dataList?.purchaseInfo?.fullName || "Chọn một phụ trách"}
                                data={listPur?.data?.data?.map((item: any) => ({
                                    value: item.id,
                                    name: item.fullName,
                                }))}
                                value={quoteRequirementData.purchaseId}
                                setValue={(val: number) =>
                                    setQuoteRequirementData((prevState) => ({
                                        ...prevState,
                                        purchaseId: val,
                                    }))
                                }
                                displayProps="name"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <div>
                        <div className="flex items-center justify-between text-center text-[14px]">
                            <p className="w-[50px] translate-x-12">
                                Tên SP
                            </p>
                            <p className="w-[50px] translate-x-16">Mã SP</p>
                            <p className="w-[100px] translate-x-16">Mã tham vấn KH</p>
                            <p className="w-[100px] translate-x-12">Mã vật tư KH</p>
                            <p className="w-[60px] translate-x-10">Mô tả</p>
                            <p className="w-[60px] translate-x-[40px]">SL</p>
                            <p className="w-[50px] translate-x-16">Giá</p>
                            <p className="w-[50px] translate-x-14">VAT</p>
                            <p className="w-[50px] translate-x-8">ĐVT</p>
                            <p className="w-[20px] translate-x-8">NSX</p>
                            <p className="w-[100px] translate-x-12">
                                Nhà cung cấp
                            </p>
                            <p className=" w-[100px] translate-x-8">
                                Thời gian giao hàng dự kiến
                            </p>
                            <p className="w-[20px] translate-x-2">DA</p>
                            <p className="w-[20px] -translate-x-4">TH</p>
                            <p className="w-[60px] -translate-x-7">Thông tin thêm</p>
                            <p className="w-[50px] -translate-x-5">Ghi chú</p>
                        </div>
                        {quoteRequirementData?.productCode?.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between mb-2"
                            >
                                <button
                                    className="text-[14px] text-red-500 hover:bg-blue-100 border-none bg-transparent cursor-pointer"
                                    onClick={() => removeProduct(index)}
                                >
                                    <MdDelete color="red" size={16} />
                                </button>
                                <Input
                                    className="w-[103px] !shadow-none"
                                    placeholder="Tên sản phẩm"
                                    value={quoteRequirementData.productName[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[90px] !shadow-none"
                                    placeholder="Mã sản phẩm"
                                    value={quoteRequirementData.productCode[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[100px]"
                                    placeholder="Nhập mã"
                                    value={quoteRequirementData.consultationCode[index]}
                                    onChange={(e) =>
                                        handleArrayInputChange(e, index, "consultationCode")
                                    }
                                />
                                <Input
                                    className="w-[100px]"
                                    placeholder="Nhập mã"
                                    value={quoteRequirementData.itemCode[index]}
                                    onChange={(e) =>
                                        handleArrayInputChange(e, index, "itemCode")
                                    }
                                />
                                <Input
                                    className="w-[100px] !shadow-none"
                                    placeholder="Mô tả"
                                    value={quoteRequirementData.describe[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[70px] !shadow-none"
                                    placeholder="Số lượng"
                                    value={quoteRequirementData.quantity[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[70px] !shadow-none"
                                    placeholder="Giá"
                                    value={quoteRequirementData.priceSale[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[50px] !shadow-none"
                                    placeholder="VAT"
                                    value={quoteRequirementData.VAT[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[50px] !shadow-none"
                                    placeholder="Đơn vị tính"
                                    value={quoteRequirementData.unit[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[85px] !shadow-none"
                                    placeholder="Nhà sản xuất"
                                    value={quoteRequirementData.producerName[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[120px] !shadow-none"
                                    placeholder="Nhà cung cấp"
                                    value={quoteRequirementData.supplierName[index]}
                                    disabled
                                />
                                <Input
                                    className="w-[80px] !shadow-none"
                                    value={quoteRequirementData.deliveryTime[index]}
                                    onChange={(e) =>
                                        handleArrayInputChange(e, index, "note")
                                    }
                                    disabled
                                />
                                <Checkbox
                                    checked={(quoteRequirementData.type[index] === "D" || quoteRequirementData.type[index] === "DT") ? true : false}
                                    disabled
                                />
                                <Checkbox
                                    checked={(quoteRequirementData.type[index] === "T" || quoteRequirementData.type[index] === "DT") ? true : false}
                                    disabled
                                />

                                <div className="flex items-center justify-center w-[80px]">
                                    <input
                                        type="file"
                                        id={`file-upload-${index}`}
                                        ref={(el) => (fileInputRefs.current[index] = el)}
                                        className="hidden"
                                        onChange={(event) => handleFileUpload(index, event)}
                                        name={`productFile`}
                                    />
                                    <Button
                                        className="w-24 bg-blue-400 text-black border-none hover:bg-blue-500"
                                        style={{
                                            borderRadius: "8px",
                                            padding: "8px 16px",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => fileInputRefs.current[index]?.click()}
                                    >
                                        {fileUploaded[index] ? "Đã tải file" : "Tải file"}
                                    </Button>
                                </div>
                                <Input
                                    className="w-[80px]"
                                    placeholder="Ghi chú"
                                    value={quoteRequirementData.noteProductOrder[index] || ""}
                                    onChange={(e) => handleArrayInputChange(e, index, "noteProductOrder")}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-10 mb-5">
                        <div>
                            <p className="text-[14px] mb-1 font-medium">Phương thức thanh toán</p>
                            <SelectComponent
                                key="paymentMethodId"
                                label="Phương thức thanh toán"
                                placeholder="Chọn phương thức thanh toán"
                                data={paymentMethodList?.data?.map((item: any) => ({
                                    value: item.id,
                                    name: item.name,
                                }))}
                                value={quoteRequirementData.paymentMethodId}
                                setValue={(val: number) =>
                                    setQuoteRequirementData((prevState) => ({
                                        ...prevState,
                                        paymentMethodId: val,
                                    }))
                                }
                                displayProps="name"
                            />
                        </div>
                        <div>
                            <p className="text-[14px] mb-1 font-medium">Ghi chú</p>
                            <Input
                                placeholder="Nhập ghi chú"
                                value={quoteRequirementData.noteOrder}
                                onChange={(e) =>
                                    handleInputChange(e, "noteOrder")
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mb-4">
                    <Button type="button" variant="secondary" onClick={() => route.push("/admin/quotation/")}>
                        Quay lại
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-blue-600"
                        disabled={isLoading}
                    >
                        Gửi
                    </Button>
                </div>
            </div >
        </>
    );
}
