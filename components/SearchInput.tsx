import React from "react";
import { Input } from "./ui/input";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";

interface InputProps {
  searchValue: string;
  placeholder: string;
  setSearchValue: (value: string) => void;
}

export default function SearchInput(props: InputProps) {
  const { searchValue, setSearchValue, placeholder } = props;
  return (
    <div className="relative">
      <Input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="text-sm w-[300px] pr-8 bg-gray-100  border shadow-lg rounded-xl "
        placeholder={placeholder}
      />
      {searchValue?.trim().length > 0 ? (
        <IoIosClose
          onClick={() => setSearchValue("")}
          className="absolute right-2 size-5 top-2.5 cursor-pointer"
        />
      ) : (
        <CiSearch className="absolute right-2 size-5 top-2.5" />
      )}
    </div>
  );
}
