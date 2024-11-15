import * as React from "react";
import { cn } from "@/lib/utils";

import { Check, X, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type OptionType = {
  label: string;
  value: number;
};

interface MultiSelectProps {
  options: OptionType[];
  selected: number[];
  onChange: (value: number[]) => void;
  className?: string;
  placeholder?: string;
  title?: string;
  width?: number;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder,
  title,
  width,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: number, selected: number[]) => {
    onChange(selected.filter((i) => i !== item));
  };

  const displayData = (options: any, item: number) => {
    const newItem = options.find(
      (ele: { value: number }) => ele.value === item
    );
    return newItem ? newItem["label"] : "Chưa xác định";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(`w-[${width}px] justify-between hover:bg-transparent focus:outline-none shadow-md ${selected?.length > 1 ? "h-full" : "h-10"
            }`, className)}
          onClick={() => setOpen(!open)}
        >
          {selected?.length > 0 ? (
            <div className="flex">
              {selected?.map(
                (item, index) =>
                  index === 0 && (
                    <Badge
                      variant="secondary"
                      key={item}
                      className="mr-1"
                      onClick={() => handleUnselect(item, selected)}
                    >
                      {displayData(options, item)?.length > 10
                        ? displayData(options, item).slice(0, 10) + "..."
                        : displayData(options, item)}
                      <X
                        onClick={() => handleUnselect(item, selected)}
                        className="h-4 w-4 text-muted-foreground hover:text-foreground ml-1"
                      />
                    </Badge>
                  )
              )}
              {selected?.length > 1 && (
                <Badge variant="secondary" className="mr-1">
                  +{selected?.length - 1}
                </Badge>
              )}
            </div>
          ) : (
            <span className="font-normal mr-1">{placeholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`w-[${width}px]`}>
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <div className="overflow-y-auto h-[280px]">
          {options?.map((option: any) => (
            <DropdownMenuItem
              className="cursor-pointer"
              key={option.value}
              onSelect={() => {
                onChange(
                  selected?.includes(option.value)
                    ? selected?.filter((item) => item !== option.value)
                    : [...selected, option.value]
                );
                setOpen(true);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selected?.includes(option.value) ? "opacity-100" : "opacity-0"
                )}
              />
              {option.label}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu >
  );
}
