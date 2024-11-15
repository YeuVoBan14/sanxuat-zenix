"use client";

import SearchInput from "@/components/SearchInput";
import React, { useState } from "react";

export default function Quote_requirement() {
  const [functions, setFunctions] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");

  return (
    <div>
      <div
        className="flex justify-between w-full mb-2"
        onClick={() => setFunctions(false)}
      >
        <div className="flex justify-between items-center">
          <SearchInput
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder="Tìm kiếm YCBG"
          />
        </div>
        <div className="flex">{/* <AddAndUpdateQuotation /> */}</div>
      </div>
      {/* <DataTable  
      data={QuotationData}
      columns={columns}
    /> */}
    </div>
  );
}
