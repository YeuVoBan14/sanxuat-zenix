
import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import * as XLSX from 'xlsx';


export default function ExcelExport({
    open,
    setOpen,
    pageSize,
    setPageSize,
    data,
}: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
    data: any;
}) {

    const handlePageSizeChange = (value: number) => {
        setPageSize(value);
    };

    const handleExport = () => {
        exportToExcel(data);
        setOpen(false);
    };

    const exportToExcel = (data: any) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, 'data.xlsx');
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Xuất excel</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xuất file Excel</DialogTitle>
                    </DialogHeader>
                    <div>
                        <div>Số hàng cần xuất: </div>
                        <Select
                            defaultValue={`${pageSize}`}
                            onValueChange={(value) => handlePageSizeChange(Number(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn kích cỡ trang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Kích cỡ trang</SelectLabel>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleExport}>Xuất</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}