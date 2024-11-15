"use client";
import { useSideBarToggle } from "@/hooks/use-sidebar-toggle";
import { SideNavItem } from "@/types/type";
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import Icons from "@/components/Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export const SideBarMenuItem = ({ item }: { item: SideNavItem }) => {
  const { toggleCollapse } = useSideBarToggle();

  const pathname = usePathname();

  const [subMenuOpen, setSubMenuOpen] = useState(false);

  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  const inactiveLink = classNames(
    "flex items-center min-h-[40px] h-full text-sidebar-foreground py-2 px-4 hover:text-sidebar-muted-foreground  hover:bg-sidebar-muted rounded-md transition duration-200"
  );

  const activeLink = classNames(
    "active text-sidebar-muted-foreground bg-sidebar-muted"
  );

  const navMenuDropdownItem =
    "text-red py-2 px-4 light:hover:text-black hover:text-sidebar-muted-foreground transition duration-200 rounded-md";

  const dropdownMenuHeaderLink = classNames(inactiveLink, {
    ["bg-sidebar-muted rounded-b-none"]: subMenuOpen,
  });
  return (
    <>
      {item.submenu ? (
        <div className="min-w-[18px]">
          <Link
            href={`/admin/${item.path}`}
            className={`${dropdownMenuHeaderLink} ${
              pathname.includes(item.path) ? activeLink : ""
            }`}
          >
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div>
                    <Icons name={item.icon as any} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {!toggleCollapse && (
              <>
                <span className="ml-3 text-base leading-6 font-semibold">
                  {item.title}
                </span>
                <BsChevronRight
                  className={`${
                    subMenuOpen ? "rotate-90" : ""
                  } ml-auto stroke-2 text-xs`}
                  onClick={toggleSubMenu}
                />
              </>
            )}
          </Link>
          {subMenuOpen && !toggleCollapse && (
            <div className="bg-sidebar-muted border-l-4">
              <div className="grid gap-y-2 px-6 leading-5 py-3">
                {item.subMenuItems?.map((subItem, idx) => {
                  return (
                    <Link
                      key={idx}
                      href={`/admin/${subItem.path}`}
                      className={`${navMenuDropdownItem} ${
                        subItem.path === pathname
                          ? "text-white "
                          : "text-sidebar-foreground"
                      }`}
                    >
                      <span>{subItem.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          href={`/admin/${item.path}`}
          className={`${inactiveLink} ${
            item.path === pathname ? activeLink : ""
          }`}
        >
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div>
                  <Icons name={item.icon as any} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {!toggleCollapse && (
            <span className="ml-3 leading-6 font-semibold">{item.title}</span>
          )}
        </Link>
      )}
    </>
  );
};
