"use client";
import { useSideBarToggle } from "@/hooks/use-sidebar-toggle";
import classNames from "classnames";
import { BsList } from "react-icons/bs";
import { UserNav } from "./usernavbar";
import { ThemeSwitcher } from "./theme-switcher";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { SideNavItemGroup } from "@/types/type";

export default function Navbar({ data }: { data: SideNavItemGroup[] }) {
  const { toggleCollapse, invokeToggleCollapse, setToggleCollapse } = useSideBarToggle();
  const pathname = usePathname();
  const sidebarToggle = () => {
    invokeToggleCollapse();
  };
  const headerStyle = classNames("bg-sidebar fixed w-full z-[30] px-4 shadow-sm shadow-slate-500/40", {
    ["sm:pl-[17rem]"]: !toggleCollapse,
    ["sm:pl-[5.6rem]"]: toggleCollapse,
  });
  const pathNameArray = [
    "/admin/quote-requirement/edit-requirement/",
    "/admin/customers/create-quote-request",
    "/admin/quotation/create-quick-quotation",
    "/admin/quotation/create-quotation",
    "/admin/quotation/history-quotation",
    "/admin/quote-requirement/create-goods",
    "/admin/purchase/order-request",
    "/admin/purchase/input-proposal",
    "/admin/purchase/output-proposal",
    "/admin/customers",
    "/admin/supplier",
    "/admin/quotation/create-order",
  ]
  const { title } = useMemo(() => {
    if (data) {
      const menuList = data.reduce((acc: any, item: any) => acc.concat(item?.menuList), []);
      for (let item of menuList) {
        if (pathname === item.path) {
          return { title: item.title };
        }
        if (pathname === "/admin/profile") {
          return { title: "Hồ sơ cá nhân" };
        }

        if (pathname === "/admin/company") {
          return { title: "Quản trị công ty" };
        }

        if (pathname === "/admin/payment") {
          return { title: "Quản trị thanh toán" };
        }

      }
    }
    return { title: "" };
  }, [pathname]);

  // useEffect(() => {
  //   if (!pathNameArray.every((item: string) => !pathname.startsWith(item))) {
  //     setToggleCollapse(true);
  //   } else {
  //     setToggleCollapse(false);
  //   }
  // }, [pathname, setToggleCollapse]);

  return (
    <header className={headerStyle}>
      <div className="h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={sidebarToggle}
            className="bg-sidebar-muted text-sidebar-muted-foreground hover:bg-foreground hover:text-background ml-3 rounded-md w-[30px] h-[30px] flex items-center justify-center shadow-md shadow-black/10  transition duration-300 ease-in-out"
          >
            <BsList />
          </button>
          <h5 className="ml-5 font-bold">{title}</h5>
        </div>

        <div className="flex items-center justify-between sm:order-2 order-1">
          <div className="p-2">
            <ThemeSwitcher></ThemeSwitcher>
          </div>
          <div className="bg-bg-sidebar-muted flex items-center justify-center text-center">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
