import React from "react";

import { PiUserList } from "react-icons/pi";
import { MdOutlineCardGiftcard } from "react-icons/md";
import { TbShoppingCartDollar } from "react-icons/tb";
import { LuWarehouse } from "react-icons/lu";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { GrDocumentUpload } from "react-icons/gr";
import { TbShoppingCartPlus } from "react-icons/tb";
import { IoGitPullRequestOutline } from "react-icons/io5";
import { TiDocumentText } from "react-icons/ti";
import { MdOutlineRequestQuote } from "react-icons/md";
import { LuImport } from "react-icons/lu";
import { PiExportBold } from "react-icons/pi";
import { RiFileHistoryFill } from "react-icons/ri";
import { TbReportMoney } from "react-icons/tb";
import { FaRegMoneyBillAlt } from "react-icons/fa";


const iconsMap: { [key: string]: React.ComponentType } = {
  CgUserList: PiUserList,
  MdOutlineCardGiftcard: MdOutlineCardGiftcard,
  TbShoppingCartDollar: TbShoppingCartDollar,
  LuWarehouse: LuWarehouse,
  HiOutlineBuildingOffice: HiOutlineBuildingOffice,
  FaMoneyCheckDollar: FaMoneyCheckDollar,
  GrDocumentUpload: GrDocumentUpload,
  TbShoppingCartPlus: TbShoppingCartPlus,
  IoGitPullRequestOutline: IoGitPullRequestOutline,
  TiDocumentText: TiDocumentText,
  MdOutlineRequestQuote: MdOutlineRequestQuote,
  LuImport: LuImport,
  PiExportBold: PiExportBold,
  RiFileHistoryFill: RiFileHistoryFill,
  TbReportMoney: TbReportMoney,
  FaRegMoneyBillAlt: FaRegMoneyBillAlt,
};

interface IconProps {
  name: string;
}

const Icons: React.FC<IconProps> = ({ name }) => {
  const IconComponent = iconsMap[name];
  if (!IconComponent) {
    return null;
  }

  return <IconComponent />;
};

export default Icons;
