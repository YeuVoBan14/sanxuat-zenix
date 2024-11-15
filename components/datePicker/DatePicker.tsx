import React, { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface DatePickerType {
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
}

export default function DatePicker(props: DatePickerType) {
  const { date, setDate } = props;
  return (
    <div>
      <Popover>
        <PopoverTrigger className="shadow-md w-full" asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Chọn ngày</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="single"
            selected={date}
            onSelect={setDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
