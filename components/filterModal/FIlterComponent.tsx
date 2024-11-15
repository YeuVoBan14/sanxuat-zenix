import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CiFilter } from "react-icons/ci";
import MultiSelect from "../multiSelect/MultiSelect";

interface FilterModalProps {
  dataFilter?: any;
  setDataFilter?: any;
  filterArray?: any;
  pagination?: any;
  setPagination?: any;
}

export default function FilterModal(props: FilterModalProps) {
  const { dataFilter, setDataFilter, filterArray, pagination, setPagination } =
    props;
  const handleFilterSubmit = (dataFilter: any) => {
    pagination["page"] = 0;
    setPagination({ ...pagination, ...dataFilter });
  };
  return (
    <Dialog>
      <DialogTrigger className="shadow-md" asChild>
        <Button variant="outline">
          <CiFilter size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Bộ lọc</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {filterArray?.map((item: any) => (
            <MultiSelect
              options={item.data?.map((ele: any) => {
                return {
                  value: ele.id,
                  label: ele[item.displayProps],
                };
              })}
              selected={dataFilter[item.key]}
              onChange={(valueArr: any) =>
                setDataFilter({ ...dataFilter, [item.key]: valueArr })
              }
              width={200}
              placeholder={item.title}
              title={item.title}
            />
          ))}
        </div>
        <DialogFooter>
          <DialogClose>
            <Button
              onClick={() => handleFilterSubmit(dataFilter)}
              type="button"
            >
              Tiến hành lọc
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
