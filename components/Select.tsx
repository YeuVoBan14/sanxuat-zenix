import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectProps {
  label?: string;
  placeholder?: string;
  data: any;
  value: any;
  key: string;
  displayProps: string;
  setValue: (value: number) => void;
  disabled?: boolean;
}

export default function SelectComponent(props: SelectProps) {
  const { label, placeholder, data, value, setValue, displayProps, disabled } = props;
  const displayValue = (value: number) => {
    if (value) {
      const item = data.find((el: any) => el.value === value);
      const department = item?.department;
      if (department?.length > 4) return department.slice(0, 4) + "...";
      return department;
    } else {
      return "Chọn bộ phận...";
    }
  };
  return (
    <Select
      value={value > 0 ? value?.toString() : undefined}
      onValueChange={(val) => setValue(Number(val))}
    >
      <SelectTrigger disabled={disabled ? true : false} className="w-full focus:outline-none shadow-md">
        {displayProps === "department" ? (
          <span>{displayValue(value)}</span>
        ) : (
          <SelectValue className="text-xs" placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {data?.length > 0 ? (
            data?.map((item: any) => (
              <SelectItem
                className="w-full flex flex-row justify-between"
                key={item.id}
                value={item["value"]?.toString()}
              >
                <div className=" flex flex-row justify-between items-center">
                  <span>{item[displayProps]}</span>
                  {/* <span className="">10</span> */}
                </div>
              </SelectItem>
            ))
          ) : (
            <div className=" flex flex-col justify-between items-center">
              <img
                alt=""
                src="https://static.vecteezy.com/system/resources/thumbnails/007/104/553/small/search-no-result-not-found-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg"
                width={100}
                height={100}
              />
              <span className="text-[14px]">Không có dữ liệu</span>
            </div>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
