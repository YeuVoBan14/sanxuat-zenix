"use client";
import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { BsFileEarmarkExcelFill } from "react-icons/bs";

import { toast } from "@/components/ui/use-toast";
import SelectComponent from "@/components/Select";
import {
  addQuoteRequirementExcel,
  addQuoteRequirementNormal,
} from "@/api/quote-requirement";
import AddListProducts from "./components/AddListProductsQuote";
import { Products } from "@/types/type";
import { MdDelete } from "react-icons/md";
import {
  getListUserByDepartment,
  getListUserByDepartmentAndCustomerId,
} from "@/api/quotations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TypeData = {
  endUser: string;
  deliveryAddress: string;
  customerQuoteCode: string;
  purchaseManager: number;
  saleManager: number;
  productCode: string[];
  productName: string[];
  customerConsultCode: string[];
  customerMaterialCode: string[];
  description: string[];
  contactDepartment: number[];
  quantity: string[];
  unit: string[];
  manufacturer: string[];
  note: string[];
  project: boolean[];
  consumption: boolean[];
  type: string[];
  id: number;
  file: string;
};

type CustomerData = {
  id: number;
  customerName: string;
  phoneNumber: string;
  address: string;
  departments: any[];
};

const initialData: TypeData = {
  endUser: "",
  deliveryAddress: "",
  customerQuoteCode: "",
  purchaseManager: 0,
  saleManager: 0,
  productCode: [],
  productName: [],
  customerConsultCode: [],
  customerMaterialCode: [],
  description: [],
  contactDepartment: [],
  quantity: [],
  unit: [],
  manufacturer: [],
  note: [],
  project: [],
  consumption: [],
  type: [],
  id: 0,
  file: "",
};

export default function QuoteRequirementView() {
  const route = useRouter();
  const queryClient = useQueryClient();
  const [quoteDeadline, setQuoteDeadline] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState<Date | null>(null);
  const [productCodes, setProductCodes] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [fileProductsExist, setFileProductsExist] = useState<string[]>([]);
  const [quoteRequirementData, setQuoteRequirementData] =
    useState<TypeData>(initialData);
  const [data, setData] = useState<CustomerData | null>(null);

  const { data: listSale } = useQuery({
    queryKey: ["listSale", data?.id],
    queryFn: () =>
      getListUserByDepartmentAndCustomerId("sale", Number(data?.id)),
  });

  const { data: listPurchase } = useQuery({
    queryKey: ["listPurchase"],
    queryFn: () => getListUserByDepartment("purchase"),
  });

  useEffect(() => {
    const rowData = localStorage.getItem("rowData");
    if (rowData) {
      const rowDataJson = JSON.parse(rowData);
      setData(rowDataJson);
      // localStorage.removeItem("rowData");
      if ("quoteProducts" in rowDataJson) {
        setData(rowDataJson.Customer);
        const products = rowDataJson["quoteProducts"];
        setQuoteRequirementData({
          ...quoteRequirementData,
          id: rowDataJson.id,
          endUser: rowDataJson.endUser,
          deliveryAddress: rowDataJson.address,
          customerQuoteCode: rowDataJson.RFQCustomer,
          purchaseManager: rowDataJson.purchaseId,
          saleManager: rowDataJson.saleId,
          file: rowDataJson?.file,
          productCode: products.map(
            (product: any) => product?.Product.productCode
          ),
          productName: products.map(
            (product: any) => product?.Product.productName
          ),
          customerConsultCode: products.map(
            (product: any) => product?.consultationCode
          ),
          customerMaterialCode: products.map(
            (product: any) => product?.itemCode
          ),
          description: products.map(
            (product: any) => product?.Product.describe || ""
          ),
          contactDepartment: products.map(
            (product: any) => product.departmentId || 0
          ),
          quantity: products.map((product: any) => product.quantity),
          unit: products.map((product: any) => product.unit),
          manufacturer: products.map(
            (product: any) => product.Product.producerInfo?.name || ""
          ),
          note: products.map((product: any) => product.note),
          project: products.map((product: any) => {
            if (["D", "DT"].includes(product.type)) return true;
            return false;
          }),
          consumption: products.map((product: any) => {
            if (["T", "DT"].includes(product.type)) return true;
            return false;
          }),
        });
        setFileUploaded([...products.map(() => false)]);
        setProductFiles((prev) => [...prev, ...products.map(() => null)]);
        setFileProductsExist([
          ...products.map((product: { file: string }) =>
            product.file ? product.file : null
          ),
        ]);
        setQuoteDeadline(new Date(rowDataJson.durationQuoteForCustomer));
        setResponseTime(new Date(rowDataJson.durationFeedback));
        products.forEach(() => fileInputRefs.current.push(null));
      }
    }
  }, []);

  const quoteDatePickerRef = useRef<DatePicker>(null);
  const responseDatePickerRef = useRef<DatePicker>(null);
  const [fileUploaded, setFileUploaded] = useState<boolean[]>([]);
  const [ycbgFileUploaded, setYcbgFileUploaded] = useState(false);
  const [ycbgFile, setYcbgFile] = useState<File | null>(null);
  const [productFiles, setProductFiles] = useState<(File | null)[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const ycbgFileInputRef = useRef<HTMLInputElement | null>(null);
  const excelFileInputRef = useRef<HTMLInputElement | null>(null);
  const [inputMethod, setInputMethod] = useState<"manual" | "file">("manual");

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

  const handleYcbgFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setYcbgFileUploaded(true);
      setYcbgFile(file);
    }
  };

  const handleExcelFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setExcelFile(file);
      setUploadedFileName(file.name);
    }
  };

  const handleQuoteDateChange = (date: Date | null) => {
    setQuoteDeadline(date);
  };

  const handleResponseDateChange = (date: Date | null) => {
    setResponseTime(date);
  };

  const handleQuoteDivClick = () => {
    if (quoteDatePickerRef.current) {
      quoteDatePickerRef.current.setFocus();
    }
  };

  const handleResponseDivClick = () => {
    if (responseDatePickerRef.current) {
      responseDatePickerRef.current.setFocus();
    }
  };

  const handleSingleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof TypeData
  ) => {
    const { value } = e.target;
    setQuoteRequirementData((prevState) => ({
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

  const handleCheckboxChange = (
    checked: boolean,
    index: number,
    field: keyof TypeData
  ) => {
    const dataField: any = quoteRequirementData[field];
    dataField[index] = checked;
    setQuoteRequirementData({ ...quoteRequirementData, [field]: dataField });
    // setQuoteRequirementData((prevState) => {
    //   const fieldData = prevState[field];
    //   if (Array.isArray(fieldData)) {
    //     return {
    //       ...prevState,
    //       [field]: fieldData.map((item, i) => (i === index ? checked : item)),
    //     };
    //   }
    //   return prevState;
    // });
  };

  const addProduct = () => {
    setQuoteRequirementData((prevState) => ({
      ...prevState,
      productCode: [...prevState.productCode, ""],
      productName: [...prevState.productName, ""],
      customerConsultCode: [...prevState.customerConsultCode, ""],
      customerMaterialCode: [...prevState.customerMaterialCode, ""],
      description: [...prevState.description, ""],
      contactDepartment: [...prevState.contactDepartment, 0],
      quantity: [...prevState.quantity, ""],
      unit: [...prevState.unit, ""],
      manufacturer: [...prevState.manufacturer, ""],
      note: [...prevState.note, ""],
      project: [...prevState.project, false],
      consumption: [...prevState.consumption, false],
      type: [...prevState.type, ""],
    }));
    setFileUploaded((prev) => [...prev, false]);
    setProductFiles((prev) => [...prev, null]);
    fileInputRefs.current.push(null);
  };

  const returnType = (project: boolean, consumption: boolean) => {
    if (project && consumption) return "DT";
    else if (!project && !consumption) return "";
    else if (project && !consumption) return "D";
    else return "T";
  };

  const removeProduct = (index: number) => {
    setQuoteRequirementData((prevState) => ({
      ...prevState,
      productCode: prevState.productCode.filter((_, i) => i !== index),
      productName: prevState.productName.filter((_, i) => i !== index),
      customerConsultCode: prevState.customerConsultCode.filter(
        (_, i) => i !== index
      ),
      customerMaterialCode: prevState.customerMaterialCode.filter(
        (_, i) => i !== index
      ),
      description: prevState.description.filter((_, i) => i !== index),
      contactDepartment: prevState.contactDepartment.filter(
        (_, i) => i !== index
      ),
      quantity: prevState.quantity.filter((_, i) => i !== index),
      unit: prevState.unit.filter((_, i) => i !== index),
      manufacturer: prevState.manufacturer.filter((_, i) => i !== index),
      note: prevState.note.filter((_, i) => i !== index),
      project: prevState.project.filter((_, i) => i !== index),
      consumption: prevState.consumption.filter((_, i) => i !== index),
      type: prevState.type.filter((_, i) => i !== index),
    }));
    setFileUploaded((prev) => prev.filter((_, i) => i !== index));
    setProductFiles((prev) => prev.filter((_, i) => i !== index));
    fileInputRefs.current.splice(index, 1);
  };

  const handleSaveOrSend = async (action: "save" | "send") => {
    let error: string | null = null;
    const durationQuoteForCustomer = quoteDeadline
      ? `${quoteDeadline.getFullYear()}-${
          quoteDeadline.getMonth() + 1
        }-${quoteDeadline.getDate()} ${quoteDeadline.getHours()}:${quoteDeadline.getMinutes()}:00`
      : "";
    const durationFeedback = responseTime
      ? `${responseTime.getFullYear()}-${
          responseTime.getMonth() + 1
        }-${responseTime.getDate()} ${responseTime.getHours()}:${responseTime.getMinutes()}:00`
      : "";

    const type = quoteRequirementData.productCode.map((_, idx) =>
      returnType(
        quoteRequirementData.project[idx],
        quoteRequirementData.consumption[idx]
      )
    );

    const formData = new FormData();

    formData.append("keyFunction", action === "save" ? "0" : "1");
    quoteRequirementData?.id > 0 &&
      formData.append("quoteId", quoteRequirementData?.id.toString());
    quoteRequirementData?.file &&
      formData.append("fileQuoteExits", quoteRequirementData?.file);
    if (fileProductsExist && quoteRequirementData?.id > 0) {
      fileProductsExist?.forEach((fileProduct: string) =>
        formData.append("fileProductExits[]", fileProduct)
      );
    }
    formData.append("customerId", data?.id.toString() || "");
    formData.append("saleId", quoteRequirementData.saleManager.toString());
    formData.append(
      "purchaseId",
      quoteRequirementData.purchaseManager.toString()
    );
    formData.append("durationQuoteForCustomer", durationQuoteForCustomer);
    formData.append("durationFeedback", durationFeedback);
    formData.append("endUser", quoteRequirementData.endUser);
    formData.append("address", quoteRequirementData.deliveryAddress);
    formData.append("RFQCustomer", quoteRequirementData.customerQuoteCode);
    if (ycbgFile) {
      formData.append("fileQuote", ycbgFile);
    }

    if (inputMethod === "manual") {
      const hasFile = fileUploaded.map((uploaded) => (uploaded ? 1 : 0));
      const productFile = productFiles.filter((file) => file !== null);

      quoteRequirementData.productCode.forEach((code) =>
        formData.append("productCode[]", code)
      );
      quoteRequirementData.productName.forEach((name) =>
        formData.append("productName[]", name)
      );
      quoteRequirementData.description.forEach((desc) =>
        formData.append("describe[]", desc)
      );
      quoteRequirementData.customerConsultCode.forEach((code) =>
        formData.append("consultationCode[]", code)
      );
      quoteRequirementData.customerMaterialCode.forEach((code) =>
        formData.append("itemCode[]", code)
      );
      quoteRequirementData.quantity.forEach((qty) =>
        formData.append("quantity[]", qty)
      );
      quoteRequirementData.unit.forEach((unit) =>
        formData.append("unit[]", unit)
      );
      quoteRequirementData.manufacturer.forEach((manufacturer) =>
        formData.append("producer[]", manufacturer)
      );
      quoteRequirementData.contactDepartment.forEach((department) =>
        formData.append("departmentId[]", JSON.stringify(department))
      );
      type.forEach((typeValue) => formData.append("type[]", typeValue));
      quoteRequirementData.note.forEach((note) =>
        formData.append("note[]", note)
      );
      hasFile.forEach((fileFlag) =>
        formData.append("hasFile[]", fileFlag.toString())
      );
      productFile.forEach((file) =>
        formData.append("productFile", file as Blob)
      );

      try {
        const result = await addQuoteRequirementNormal({ formData });
        if (result?.success) {
          route.push("/admin/quote-requirement");
          toast({
            title: "Thành công",
            description: "Tạo YCBG thành công",
          });
          queryClient.invalidateQueries({
            queryKey: ["listQuotationRequest"],
          });
          setQuoteRequirementData(initialData);
        } else {
          error = result?.message || "Có lỗi xảy ra";
          toast({
            title: "Thất bại",
            description: error,
          });
        }
      } catch (err: any) {
        error = err.message;
        toast({
          title: "Thất bại",
          description: error,
        });
      }
    } else {
      formData.append("fileExcel", excelFile as Blob);

      try {
        const result = await addQuoteRequirementExcel({ formData });
        if (result?.success) {
          route.push("/admin/quote-requirement");
          toast({
            title: "Thành công",
            description: "Tạo YCBG thành công",
          });
          setQuoteRequirementData(initialData);
        } else {
          error = result?.message || "Có lỗi xảy ra";
          setExcelFile(null);
          toast({
            title: "Thất bại",
            description: error,
          });
        }
      } catch (err: any) {
        error = err.message;
        toast({
          title: "Thất bại",
          description: error,
        });
      }
    }
  };

  const handleAddProducts = (products: Products[]) => {
    setQuoteRequirementData((prevState) => ({
      ...prevState,
      productCode: [
        ...prevState.productCode,
        ...products.map((product) => product.productCode),
      ],
      productName: [
        ...prevState.productName,
        ...products.map((product) => product.productName),
      ],
      customerConsultCode: [
        ...prevState.customerConsultCode,
        ...products.map(() => ""),
      ],
      customerMaterialCode: [
        ...prevState.customerMaterialCode,
        ...products.map(() => ""),
      ],
      description: [
        ...prevState.description,
        ...products.map((product) => product.describe || ""),
      ],
      contactDepartment: [
        ...prevState.contactDepartment,
        ...products.map(() => 0),
      ],
      quantity: [...prevState.quantity, ...products.map(() => "")],
      unit: [...prevState.unit, ...products.map((product) => product.unit)],
      manufacturer: [
        ...prevState.manufacturer,
        ...products.map((product) => product.producerInfo?.name || ""),
      ],
      note: [...prevState.note, ...products.map(() => "")],
      project: [
        ...prevState.project,
        ...products.map((product) => ["D", "DT"].includes(product.type)),
      ],
      consumption: [
        ...prevState.consumption,
        ...products.map((product) => ["T", "DT"].includes(product.type)),
      ],
      // type: [...prevState.type, ...products.map((product) => product.type)],
    }));
    setFileUploaded((prev) => [...prev, ...products.map(() => false)]);
    setProductFiles((prev) => [...prev, ...products.map(() => null)]);
    products.forEach(() => fileInputRefs.current.push(null));
  };

  return (
    <>
      <div className="mx-auto">
        <div className="grid grid-cols-2">
          <div className="mr-10">
            <h1 className="font-bold text-center">Thông tin khách hàng</h1>
            <div className="mt-5 grid grid-cols-3 justify-center">
              <div className="ps-5">
                <h1>Tên khách hàng</h1>
                <h1>SĐT</h1>
                <h1>Địa chỉ</h1>
              </div>
              <div></div>
              <div>
                <h1>{data?.customerName || ""}</h1>
                <h1>{data?.phoneNumber || ""}</h1>
                <h1>{data?.address || ""}</h1>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-[14px] mt-5 mb-1 font-medium">End-user</p>
              <Input
                value={quoteRequirementData.endUser}
                onChange={(e) => handleSingleInputChange(e, "endUser")}
                placeholder="Nhập thông tin"
              />
            </div>
            <div className="mb-2">
              <p className="text-[14px] mb-1 font-medium">Địa chỉ giao hàng</p>
              <Input
                value={quoteRequirementData.deliveryAddress}
                onChange={(e) => handleSingleInputChange(e, "deliveryAddress")}
                placeholder="Nhập thông tin"
              />
            </div>
            <div className="mb-2">
              <p className="text-[14px] mb-1 font-medium">
                Số YCBG của khách hàng
              </p>
              <Input
                value={quoteRequirementData.customerQuoteCode}
                onChange={(e) =>
                  handleSingleInputChange(e, "customerQuoteCode")
                }
                placeholder="Nhập thông tin"
              />
            </div>
            <div className="mb-2">
              <p className="text-[14px] mb-1 font-medium">
                Tải file YCBG của KH
              </p>
              <Input
                type="file"
                id="file-upload"
                ref={ycbgFileInputRef}
                className="hidden"
                onChange={handleYcbgFileUpload}
                name="fileQuote"
              />
              {quoteRequirementData?.file ? (
                <div className="flex">
                  <Button
                    className="w-32 bg-blue-100 text-black border-none hover:bg-blue-200"
                    style={{
                      borderRadius: "8px",
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      window.open(quoteRequirementData?.file, "_blank")
                    }
                  >
                    Xem file
                  </Button>
                  <Button
                    className="w-32 bg-blue-100 text-black border-none hover:bg-blue-200 ml-2"
                    style={{
                      borderRadius: "8px",
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                    onClick={() => ycbgFileInputRef.current?.click()}
                  >
                    {ycbgFileUploaded ? "Đã tải file" : "Tải file"}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-32 bg-blue-100 text-black border-none hover:bg-blue-200"
                  style={{
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                  onClick={() => ycbgFileInputRef.current?.click()}
                >
                  {ycbgFileUploaded ? "Đã tải file" : "Tải file"}
                </Button>
              )}
            </div>
          </div>
          <div className="ml-10">
            <h1 className="font-bold text-center">Thông tin báo giá</h1>
            <div className="mb-2">
              <p className="text-[14px] mb-1 font-medium">
                Người mua phụ trách
              </p>
              <SelectComponent
                key="purchaseManager"
                label="Người mua phụ trách"
                placeholder="Chọn một trong các người trong phòng mua"
                data={listPurchase?.data?.data?.map((item: any) => ({
                  value: item.id,
                  fullName: item.fullName,
                }))}
                value={quoteRequirementData.purchaseManager}
                setValue={(val: number) =>
                  setQuoteRequirementData((prevState) => ({
                    ...prevState,
                    purchaseManager: val,
                  }))
                }
                displayProps="fullName"
              />
            </div>
            <div>
              <p className="text-[14px] mb-1 font-medium">Sale phụ trách</p>
              <SelectComponent
                key="saleManager"
                label="Sale phụ trách"
                placeholder="Chọn một trong các người trong phòng sale"
                data={listSale?.data?.data?.map((item: any) => ({
                  value: item.id,
                  fullName: item.fullName,
                }))}
                value={quoteRequirementData.saleManager}
                setValue={(val: number) =>
                  setQuoteRequirementData((prevState) => ({
                    ...prevState,
                    saleManager: val,
                  }))
                }
                displayProps="fullName"
              />
            </div>
            <div>
              <p className="text-[14px] mb-1 mt-3 font-medium">
                Thời gian phản hồi
              </p>
              <div
                onClick={handleResponseDivClick}
                className="flex items-center border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
              >
                <DatePicker
                  ref={responseDatePickerRef}
                  selected={responseTime}
                  onChange={handleResponseDateChange}
                  showTimeSelect
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Chọn ngày và giờ"
                  className="w-full ml-3 border-none focus:outline-none focus:ring-0"
                />
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </div>
            </div>
            <div>
              <p className="text-[14px] mb-1 mt-3 font-medium">
                Thời hạn báo giá cho khách hàng
              </p>
              <div
                onClick={handleQuoteDivClick}
                className="flex items-center border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
              >
                <DatePicker
                  ref={quoteDatePickerRef}
                  selected={quoteDeadline}
                  onChange={handleQuoteDateChange}
                  showTimeSelect
                  minDate={responseTime ? responseTime : new Date()}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Chọn ngày và giờ"
                  className="w-full ml-3 border-none focus:outline-none focus:ring-0"
                />
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center mb-5">
            <input
              type="radio"
              id="manualInput"
              name="inputMethod"
              value="manual"
              checked={inputMethod === "manual"}
              onChange={() => setInputMethod("manual")}
            />
            <label htmlFor="manualInput" className="ml-2">
              Nhập tay
            </label>
            <input
              type="radio"
              id="fileUpload"
              name="inputMethod"
              value="file"
              checked={inputMethod === "file"}
              onChange={() => setInputMethod("file")}
              className="ml-5"
            />
            <label htmlFor="fileUpload" className="ml-2">
              Tải file lên
            </label>
          </div>

          {inputMethod === "manual" ? (
            <div>
              <div className="flex items-center justify-between text-center">
                <div
                  onClick={() => {
                    setProductCodes(quoteRequirementData.productCode);
                  }}
                  className="cursor-pointer"
                >
                  <AddListProducts
                    onAddProducts={handleAddProducts}
                    productCodes={productCodes}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                  />
                </div>
                <div className="w-[100px] flex justify-center text-center">
                  <p className="w-[100px] text-[14px]">Mã sản phẩm</p>
                </div>
                <div className="w-[100px] flex justify-center text-center">
                  <p className="w-[100px] text-[14px]">Tên sản phẩm</p>
                </div>
                <div className="w-[100px] flex justify-center text-center">
                  <p className="w-[100px] text-[14px]">
                    Mã tham vấn khách hàng
                  </p>
                </div>
                <div className="w-[100px] flex justify-center text-center">
                  <p className="w-[100px] text-[14px]">Mã vật tư khách hàng</p>
                </div>
                <div className="w-[100px] flex justify-center text-center">
                  <p className="w-[100px] text-[14px]">Mô tả</p>
                </div>
                <div className="w-[150px] flex justify-center text-center">
                  <p className="w-[150px] text-[14px]">
                    Bộ phận liên hệ (nếu có)
                  </p>
                </div>
                <div className="w-[100px] flex justify-center text-center">
                  <p className="w-[100px] text-[14px]">Số lượng</p>
                </div>
                <div className="w-[100px] flex justify-center text-center">
                  <p className="w-[100px] text-[14px]">Đơn vị tính</p>
                </div>
                <div className="w-[100px] flex justify-center text-center">
                  <p className="w-[100px] text-[14px]">Nhà sản xuất</p>
                </div>
                <div className="w-[100px] flex justify-center text-center">
                  <p className="w-[100px] text-[14px]">Ghi chú</p>
                </div>
                <div className="w-[25px] flex justify-center text-center">
                  <p className="w-[25px] text-[14px]">DA</p>
                </div>
                <div className="w-[25px] flex justify-center text-center">
                  <p className="w-[25px] text-[14px]">TH</p>
                </div>
                <div className="w-[100px] flex justify-center text-center">
                  <p className="w-[100px] text-[14px]">Thông tin thêm</p>
                </div>
              </div>
              {quoteRequirementData.productCode.map((item, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-1 mb-2"
                >
                  <button
                    className="w-[20px] text-[14px] text-red-500 hover:bg-blue-100 border-none bg-transparent cursor-pointer "
                    onClick={() => removeProduct(index)}
                  >
                    <MdDelete color="red" size={16} />
                  </button>
                  <Input
                    className="w-[100px]"
                    placeholder="Mã sản phẩm"
                    value={quoteRequirementData.productCode[index]}
                    onChange={(e) =>
                      handleArrayInputChange(e, index, "productCode")
                    }
                  />
                  <Input
                    className="w-[100px]"
                    placeholder="Tên sản phẩm"
                    value={quoteRequirementData.productName[index]}
                    onChange={(e) =>
                      handleArrayInputChange(e, index, "productName")
                    }
                  />
                  <Input
                    className="w-[100px]"
                    placeholder="Mã tham vấn KH"
                    value={quoteRequirementData.customerConsultCode[index]}
                    onChange={(e) =>
                      handleArrayInputChange(e, index, "customerConsultCode")
                    }
                  />
                  <Input
                    className="w-[100px]"
                    placeholder="Mã vật tư KH"
                    value={quoteRequirementData.customerMaterialCode[index]}
                    onChange={(e) =>
                      handleArrayInputChange(e, index, "customerMaterialCode")
                    }
                  />
                  <Input
                    className="w-[100px]"
                    placeholder="Mô tả"
                    value={quoteRequirementData.description[index]}
                    onChange={(e) =>
                      handleArrayInputChange(e, index, "description")
                    }
                  />
                  <div className="w-[150px]">
                    <SelectComponent
                      key="id"
                      label=""
                      placeholder="Bộ phận liên hệ"
                      data={data?.departments?.map((item: any) => ({
                        value: item.id,
                        department: item.department,
                      }))}
                      value={quoteRequirementData.contactDepartment[index]}
                      setValue={(val: number) => {
                        setQuoteRequirementData((prevState) => {
                          const fieldData = prevState["contactDepartment"];
                          if (Array.isArray(fieldData)) {
                            return {
                              ...prevState,
                              contactDepartment: fieldData.map((item, i) =>
                                i === index ? val : item
                              ),
                            };
                          }
                          return prevState;
                        });
                      }}
                      displayProps="department"
                    />
                  </div>
                  {/* <Input
                    className="w-[100px]"
                    placeholder="Bộ phận liên hệ (nếu có)"
                    value={quoteRequirementData.contactDepartment[index]}
                    onChange={(e) =>
                      handleArrayInputChange(e, index, "contactDepartment")
                    }
                  /> */}
                  <Input
                    className="w-[100px]"
                    placeholder="Số lượng"
                    value={quoteRequirementData.quantity[index]}
                    onChange={(e) =>
                      handleArrayInputChange(e, index, "quantity")
                    }
                  />
                  <Input
                    className="w-[100px]"
                    placeholder="Đơn vị tính"
                    value={quoteRequirementData.unit[index]}
                    onChange={(e) => handleArrayInputChange(e, index, "unit")}
                  />
                  <Input
                    className="w-[100px]"
                    placeholder="Nhà sản xuất"
                    value={quoteRequirementData.manufacturer[index]}
                    onChange={(e) =>
                      handleArrayInputChange(e, index, "manufacturer")
                    }
                  />
                  <Input
                    className="w-[100px]"
                    placeholder="Ghi chú"
                    value={quoteRequirementData.note[index]}
                    onChange={(e) => handleArrayInputChange(e, index, "note")}
                  />
                  <div className="w-[25px] flex justify-center">
                    <Checkbox
                      id={`project-${index}`}
                      checked={quoteRequirementData.project[index]}
                      onCheckedChange={(checked: boolean) =>
                        handleCheckboxChange(checked, index, "project")
                      }
                    />
                  </div>
                  <div className="w-[25px] flex justify-center">
                    <Checkbox
                      id={`consumption-${index}`}
                      checked={quoteRequirementData.consumption[index]}
                      onCheckedChange={(checked: boolean) =>
                        handleCheckboxChange(checked, index, "consumption")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-center w-[100px]">
                    <input
                      type="file"
                      id={`file-upload-${index}`}
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      className="hidden"
                      onChange={(event) => handleFileUpload(index, event)}
                      name={`productFile`}
                      accept="image/*"
                    />
                    <Button
                      className="w-24 bg-blue-100 text-black border-none hover:bg-blue-200"
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
                </div>
              ))}
              <Button
                className="w-full bg-white text-blue-400 border border-blue-400 hover:bg-blue-100"
                onClick={addProduct}
              >
                Thêm sản phẩm
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2">
              <div className="flex flex-col justify-center items-center">
                <BsFileEarmarkExcelFill
                  onClick={() => excelFileInputRef.current?.click()}
                  fill="#117D43"
                  className="w-[80px] h-[80px] cursor-pointer"
                />
                <p className="mt-2">Tải lên file excel</p>
                <input
                  ref={excelFileInputRef}
                  className="hidden"
                  type="file"
                  accept="xlsx"
                  onChange={handleExcelFileUpload}
                />
                <div className="mt-5">
                  <Link
                    href="/excels/Mẫu thông tin sản phẩm từ YCBG.xlsx"
                    download
                  >
                    <Button variant={"outline"}>
                      Tải xuống File Excel mẫu
                    </Button>
                  </Link>
                </div>
                {excelFile && (
                  <p className="text-gray-600 mt-4">
                    Tệp <strong>{uploadedFileName}</strong> đã được tải lên
                    thành công.
                  </p>
                )}
              </div>
              <div>
                <div className="flex">
                  <p className="font-bold mr-3">Bộ phận liên hệ</p>
                  <p>(Mã / Tên bộ phận)</p>
                </div>
                {data?.departments?.map((item: any, index: number) => (
                  <div key={item?.id} className="flex mt-3">
                    <p>{item?.id}</p>
                    <p className="mx-2">{"/"}</p>
                    <p>{item?.department}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-5 mt-5 mb-10 w-full">
          <Button
            variant="outline"
            onClick={() => route.push("/admin/customers")}
          >
            Quay lại
          </Button>
          <Button
            className="w-16 bg-blue-300 hover:bg-blue-400 text-white hover:text-white border shadow-lg"
            type="button"
            onClick={() => handleSaveOrSend("save")}
            variant="default"
          >
            Lưu
          </Button>
          <Button
            className="w-16 bg-blue-500 hover:bg-blue-800 text-white hover:text-white border shadow-lg"
            type="button"
            onClick={() => handleSaveOrSend("send")}
            variant="default"
          >
            Gửi
          </Button>
        </div>
      </div>
    </>
  );
}
