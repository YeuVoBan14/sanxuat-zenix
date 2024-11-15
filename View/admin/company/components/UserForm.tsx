"use client";
import React, { useState } from "react";
import AddUser from "./AddUser";
import { BsThreeDotsVertical } from "react-icons/bs";
import { ColumnDef } from "@tanstack/react-table";
import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/ui/custom/data-table";
import Edit from "@/components/icons/Edit";
import Delete from "@/components/icons/Delete";

interface DataType {
  id: number;
  userName: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: string;
  department: string;
}

function UsersForm({ users }: { users: DataType[] }) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [functions, setFunctions] = useState(false);
  const [proposalId, setProposalId] = useState(0);

  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "STT",
      cell: ({ row }) => {
        return (
          <div key={row["index"]} className="capitalize">
            {row["index"] + 1}
          </div>
        );
      },
    },
    {
      accessorKey: "userName",
      header: "Tên người dùng",
      cell: ({ row }) => {
        return <div>{row.original["userName"]}</div>;
      },
    },
    {
      accessorKey: "fullName",
      header: "Họ tên",
      cell: ({ row }) => {
        return <div>{row.original["fullName"]}</div>;
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "SĐT",
      cell: ({ row }) => {
        return <div>{row.original["phoneNumber"]}</div>;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <div>{row.original["email"]}</div>;
      },
    },
    {
      accessorKey: "department",
      header: "Phòng ban",
      cell: ({ row }) => {
        return <div>{row.original["department"]}</div>;
      },
    },
    {
      accessorKey: "role",
      header: "Chức vụ",
      cell: ({ row }) => {
        return <div>{row.original["role"]}</div>;
      },
    },

    {
      id: "id",
      header: "",
      cell: ({ row }) => {
        return (
          <div className="relative">
            <BsThreeDotsVertical
              className="cursor-pointer"
              size={20}
              onClick={() => {
                setFunctions(!functions);
                setProposalId(row.original["id"]);
              }}
            />
            {functions && proposalId === row.original["id"] && (
              <div className="flex bg-white z-50 flex-row items-center justify-between absolute right-2 top-[-35px] py-1 shadow-md rounded-sm">
                <div className="px-2 py-1 cursor-pointer border-r-2 border-[##E2E2E2]">
                  <div className="hover:animate-bounce">
                    <Edit width="20" height="20" />
                  </div>
                </div>
                <div className="px-2 py-1 cursor-pointer">
                  <div className="hover:animate-bounce">
                    <Delete width="20" height="20" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-between w-full mb-2 mt-5">
        <div className="  ">
          <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm"
          />
        </div>
        <div className="flex">
          <div className="mr-2">
            <AddUser />
          </div>
        </div>
      </div>
      <DataTable data={users} columns={columns} />
    </div>
  );
}

export default UsersForm;
