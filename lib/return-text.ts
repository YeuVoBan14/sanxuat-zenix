
export const returnTextDepartment = (department: string) => {
  switch (department) {
    case "director":
      return "Ban giám đốc";
      break;
    case "purchase":
      return "Phòng mua";
      break;
    case "sale":
      return "Phòng kinh doanh";
      break;
    case "warehouse":
      return "Phòng kho";
      break;
    case "accounting":
      return "Phòng kế toán";
      break;
    default:
      break;
  }
};

export const returnTextRole = (role: string) => {
  switch (role) {
    case "manager":
      return "Quản lý";
      break;
    case "staff":
      return "Nhân viên";
      break;
    default:
      break;
  }
};