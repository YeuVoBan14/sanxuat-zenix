"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { LuLogOut } from "react-icons/lu";
import { FaRegCircleUser } from "react-icons/fa6";
import { AlertDialogForm } from "@/components/AlertDialogForm";
import { useRouter } from "next/navigation";
import { postLogout } from "@/api/auth";
import { useEffect, useState } from "react";
import { User } from "@/types/type";
import { bgAvatar } from "@/lib/bg-avatar";

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const router = useRouter();
  const handleLogout = async () => {
    const logoutSuccess = await postLogout();
    if (logoutSuccess) {
      router.push("/login");
    } else {
      console.error("Đăng xuất thất bại");
    }
  };
  return (
    <div className="flex gap-3 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="!border-transparent">
          <button
            className={` w-10 h-10 rounded-full  flex justify-center items-center text-white hover:bg-gray-600 hover:text-white `}
            style={{ backgroundColor: bgAvatar(user?.fullName[0]) }}
          >
            {user?.fullName[0]?.toUpperCase()}
            {user?.fullName.split(" ").pop()?.[0]?.toUpperCase()}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 z-[99998]">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1 justify-center items-center py-3 gap-1.5">
              <p className="text-xs leading-none text-muted-foreground">@{user?.userName}</p>
              <div
                className={` w-16 h-16 rounded-full flex justify-center text-xl items-center text-white  `}
                style={{ backgroundColor: bgAvatar(user?.fullName[0]) }}
              >
                {user?.fullName ? user?.fullName[0]?.toUpperCase() : "Q"}
                {user?.fullName ? user?.fullName.split(" ").pop()?.[0]?.toUpperCase() : "PQ"}
              </div>

              <div className="text-center">
                <p className="font-medium text-lg leading-none text-muted-foreground mb-1">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.department}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/admin/profile")} className="px-4">
              Hồ sơ cá nhân
              <DropdownMenuShortcut>
                <FaRegCircleUser size={20} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <AlertDialogForm
            title="Bạn có chắc muốn đăng xuất"
            action={
              (
                <Button variant="link" className="w-full">
                  <div className="flex justify-between items-center flex-1">
                    <div>Đăng xuất</div>
                    <LuLogOut size={18} />
                  </div>
                </Button>
              ) as any
            }
            handleSubmit={handleLogout}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
