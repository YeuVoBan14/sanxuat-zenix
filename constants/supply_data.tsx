export const ProductsList = [
  {
    id: 1,
    code: "SP001",
    name: "Áo pô lô Newseven",
    attachment: "https://i.ytimg.com/vi/OJHhkSL-PEI/maxresdefault.jpg",
    supplierInfo: {
      name: "Tiệp Lê",
    },
    supplier: 1,
    unit: "Cái",
    productType: "D",
    min_quantity: 1000,
    producer: "Công ty cổ phần Tiệp Lê",
    description: "Ngoài mặc ra áo còn có thể để lau nhà",
    // quote_history: [
    //   {
    //     id: 1,
    //     code: "BG123",
    //     created: "30/03/2024",
    //     price: 1000,
    //     quantity: 120,
    //     customer: "Vũ Quốc Hưng",
    //     purchase_order: "1232.32",
    //   },
    //   {
    //     id: 2,
    //     code: "BG234",
    //     created: "30/03/2024",
    //     price: 1000,
    //     quantity: 120,
    //     customer: "Hoàng Văn Hiệp",
    //     purchase_order: "1232.32",
    //   },
    //   {
    //     id: 3,
    //     code: "BG345",
    //     created: "30/03/2024",
    //     price: 1000,
    //     quantity: 120,
    //     customer: "Nguyễn Đức Huy",
    //     purchase_order: "1232.32",
    //   },
    // ],
  },
  {
    id: 2,
    code: "SP002",
    name: "Áo pô lô Boo",
    supplierInfo: {
      name: "Quốc Hưng",
    },
    supplier: 2,
    unit: "Cái",
    productType: "T",
    min_quantity: 1200,
    producer: "Công ty cổ phần Quốc Hưng",
    description: "Áo có thể mặc thay cho quần",
    attachment: "https://i.ytimg.com/vi/OJHhkSL-PEI/maxresdefault.jpg",
    // quote_history: [
    //   {
    //     id: 1,
    //     code: "BG123",
    //     created: "30/03/2024",
    //     price: 1000,
    //     quantity: 120,
    //     customer: "Vũ Quốc Hưng",
    //     purchase_order: "1232.32",
    //   },
    //   {
    //     id: 2,
    //     code: "BG234",
    //     created: "30/03/2024",
    //     price: 1000,
    //     quantity: 120,
    //     customer: "Hoàng Văn Hiệp",
    //     purchase_order: "1232.32",
    //   },
    //   {
    //     id: 3,
    //     code: "BG345",
    //     created: "30/03/2024",
    //     price: 1000,
    //     quantity: 120,
    //     customer: "Nguyễn Đức Huy",
    //     purchase_order: "1232.32",
    //   },
    // ],
  },
];

export const supplierData = [
  {
    id: 1,
    name: "Tiệp Lê",
    value: 1,
    MST: 8973817348,
    rate: 79,
    phoneNumber: "0343414908",
    email: "phamq@gmail.com",
    shortName: "TLinh",
    address: "Thanh Hoá",
    accountNumber: "0343414909",
    paymentMethod: 1,
    paymentInfo: {
      name: "Thanh toán sau khi nhận hàng",
    },
  },
  {
    id: 2,
    name: "Quốc Hưng",
    value: 2,
    MST: 8973427348,
    rate: 129,
    phoneNumber: "0343541264",
    email: "hiepHIV@gmail.com",
    shortName: "HiepHIV",
    address: "Hà Nội",
    accountNumber: "0343414909",
    paymentMethod: 1,
    paymentInfo: {
      name: "Thanh toán qua ví online",
    },
  },
];

export const paymentMethodData = [
  { id: 1, title: "Thanh toán sau khi nhận hàng" },
  { id: 2, title: "Thanh toán qua ví online" },
];

export const typeData = [
  { id: 1, name: "D", value: 1 },
  { id: 2, name: "T", value: 2 },
  { id: 3, name: "DT", value: 3 },
];

export const filterData = [
  {
    id: 1,
    title: "Nhà cung cấp",
    data: supplierData,
    key: "supplier",
    displayProps: "name",
    placeholder: "Nhà cung cấp",
  },
];

export const QuotationData = [
  {
    id: 1,
    numberQuotation: "RFQ1232341",
    created: "02/04/2024",
    customer: 1,
    customerInfo: {
      firstName: "Hoàng Văn",
      lastName: "Hiệp",
      phoneNumber: "0239872573",
      addressReceive: "Lê Văn Lương, Thanh Xuân",
      contactName: "Nguyễn Đức Huy",
    },
    sale: 1,
    saleInfo: {
      firstName: "Nguyễn Đức",
      lastName: "Huy",
    },
    admin: 2,
    adminInfo: {
      firstName: "Vũ Quốc",
      lastName: "Hưng",
    },
    email: "hiephiv@gmail.com",
    status: 1,
    statusInfo: {
      title: "Xuất YCBG",
      color: "#666768",
    },
  },
  {
    id: 2,
    numberQuotation: "RFQ959868",
    created: "02/04/2024",
    customer: 2,
    customerInfo: {
      firstName: "Phạm Đình",
      lastName: "Quang",
      phoneNumber: "0239872573",
      addressReceive: "Lê Văn Lương, Thanh Xuân",
      contactName: "Cao Văn Long",
    },
    sale: 1,
    saleInfo: {
      firstName: "Nguyễn Đức",
      lastName: "Huy",
    },
    admin: 2,
    adminInfo: {
      firstName: "Vũ Quốc",
      lastName: "Hưng",
    },
    email: "quangpd@gmail.com",
    status: 2,
    statusInfo: {
      title: "Tạo TTHH",
      color: "#2B5885",
    },
  },
];

export const purchaseData = [
  {
    id: 1,
    numberQuotation: "RFQ1232341",
    created: "12/04/2024",
    customerName: "Vũ Quốc Hưng",
    saleName: "Nguyễn Thùy Trang",
    responseTime: "Còn 4 ngày",
    status: "Sale đã tạo đơn",
    statusColor: "#22C55E",
  },
  {
    id: 2,
    numberQuotation: "RFQ1232342",
    created: "10/05/2024",
    customerName: "Lê Văn Tiệp",
    saleName: "Nguyễn Đức Huy",
    responseTime: "Còn 5 ngày",
    status: "Pur từ chối",
    statusColor: "#EF4444",
  },
  {
    id: 3,
    numberQuotation: "RFQ1232343",
    created: "09/04/2024",
    customerName: "Hoàng Văn Cường",
    saleName: "Hoàng Văn hiệp",
    responseTime: "Còn 2 ngày",
    status: "Sale đã cập nhật",
    statusColor: "#F97316",
  },
];
