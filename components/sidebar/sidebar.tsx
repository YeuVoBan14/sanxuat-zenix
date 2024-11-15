"use client";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useSideBarToggle } from "@/hooks/use-sidebar-toggle";
import SideBarMenuGroup from "./sidebar-menu-group";
import { SideBarLogo } from "./sidebar-logo";
import { SideNavItemGroup } from "@/types/type";

export const SideBar = ({ data }: { data: SideNavItemGroup[] }) => {
  const [mounted, setMounted] = useState(false);
  const { toggleCollapse } = useSideBarToggle();

  const asideStyle = classNames(
    "sidebar overflow-y-auto overflow-x-auto fixed bg-sidebar h-full shadow-sm shadow-slate-500/40 transition duration-300 ease-in-out z-[40]",
    {
      ["w-[17rem]"]: !toggleCollapse,
      ["sm:w-[5.4rem] sm:left-0 left-[-100%]"]: toggleCollapse,
    }
  );

  useEffect(() => setMounted(true), []);

  return (
    <aside className={asideStyle}>
      <div className="sidebar-top relative flex items-center px-3.5 py-5">{mounted && <SideBarLogo />}</div>
      <nav className="flex flex-col gap-2 transition duration-300 ease-in-out">
        <div className="flex flex-col gap-2 px-4">
          {data?.map((item, idx) => {
            return <SideBarMenuGroup key={idx} menuGroup={item} />;
          })}
        </div>
      </nav>
    </aside>
  );
};
