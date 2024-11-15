export type SideNavItem = {
  title: string;
  path: string;
  icon?: JSX.Element;
  submenu?: boolean;
  isAdmin?: boolean;
  subMenuItems?: SideNavItem[];
};

export type SideNavItemGroup = {
  id: number;
  title: string;
  icon: string;
  menuList: SideNavItem[];
};

export type User = {
  id: number;
  userName: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: string;
  department: string;
  functions: number[];
};

export type Supplier = {
  paymentMethodId: number | null;
  abbreviation: string;
  userContact: string;
  name: string;
  taxCode: string;
  rate: number;
  address: string;
  phoneNumber: string;
  bankAccount: string;
  fileSupplier: File | null;
  subEmail: string[] | { email: string }[];
};

export type Customer = {
  email: string;
  abbreviations: string;
  taxCode: string;
  customerName: string;
  address: string;
  phoneNumber: string;
  departments: { department: string }[];
};

export type Products = {
  producer: string;
  productCode: string;
  productName: string;
  describe: string;
  unit: string;
  type: string;
  MMQ: number;
  image: File | undefined;
  producerInfo: {
    name: string;
  };
}

export type PurchaseOrder = {
  id: number;
  User: {
    fullName: string;
    phoneNumber: string;
  };
  Order: {
    codeOrder: string;
    timePurResponse: string;
    statusNameOrder: string
  }
}

export type PaginationType = {
  page: number,
  pageSize: number,
  keySearch: string,
  startDate: string,
  endDate: string,
}