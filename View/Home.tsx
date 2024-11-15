import { UserNav } from "@/components/navbar/usernavbar";

import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SideNavItemGroup } from "@/types/type";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Home({ data }: { data: SideNavItemGroup[] }) {
  return (
    <div className="w-full">
      <div className="flex flex-1 h-full flex-col items-center justify-between">
        <header className="bg-sidebar fixed w-full z-[99997] px-4 shadow-sm shadow-slate-500/40">
          <div className=" h-16 flex items-center justify-between sm:order-2 order-1 ">
            <Image
              width={100}
              alt="logo"
              className="max-w-[100px] "
              height={60}
              src="/logo-mega.png"
              layout="responsive"
              quality={100}
            />
            <div className="h-10 w-10 rounded-full bg-bg-sidebar-muted flex items-center justify-center text-center">
              <UserNav />
            </div>
          </div>
        </header>
        <Image alt="logo" src="/background_homepage.jpg" fill className="" />

        <div className="relative flex-1 flex items-center justify-between gap-5">
          {data?.map((item) => {
            return (
              <div className="text-white font-semibold gap-5" key={item.id}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-2xl w-60 h-[400px] border rounded-lg">
                      <div>
                        <Image
                          alt="logo"
                          className="object-cover w-[150px] h-[170px] m-auto mb-5"
                          src={item.icon}
                          width={120}
                          height={120}
                        />
                        <h1>{item.title}</h1>
                      </div>
                      <div className="h-[100px]">
                        <ul className="text-base">
                          {item.menuList.map((subItem) => (
                            <li className=" mt-2">
                              <Link
                                href={"admin/" +subItem.path}
                                className=" hover:underline hover:text-lg "
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
