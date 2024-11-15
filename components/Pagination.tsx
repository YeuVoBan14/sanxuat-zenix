
import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

interface PaginationProps {
    currentPage: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    pagination?: {
        page: number;
        pageSize: number;
    };
    setPagination?: any;
}

export const Paginations: React.FC<PaginationProps> = ({
    currentPage,
    pageCount,
    onPageChange,
    pagination,
    setPagination,
}) => {
    if (isNaN(pageCount) || pageCount < 1) {
        pageCount = 1;
    }
    const pageNumbers = [...Array(pageCount).keys()];
    const renderArray = (value: number, totalPage: number) => {
        const newPage = totalPage - 4;
        if (value > 3 && value < totalPage - 4) {
            return [value - 2, value - 1, value, value + 1, value + 2];
        } else if (value > totalPage - 5) {
            return [newPage, newPage + 1, newPage + 2];
        }
    };
    return (
        <div className="flex justify-end">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            className="cursor-pointer"
                            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                        />
                    </PaginationItem>
                    <PaginationItem key={0}>
                        <PaginationLink
                            isActive={0 === currentPage}
                            onClick={() => onPageChange(0)}
                            className="cursor-pointer"
                        >
                            {1}
                        </PaginationLink>
                    </PaginationItem>
                    {currentPage > 3 && pageCount > 5 ? (
                        <>
                            <PaginationItem>
                                <PaginationEllipsis
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (currentPage === 4) {
                                            onPageChange(0);
                                        } else {
                                            onPageChange(currentPage - 5);
                                        }
                                    }}
                                />
                            </PaginationItem>
                            {renderArray(currentPage, pageCount)?.map((number) => {
                                return (
                                    <PaginationItem key={number}>
                                        <PaginationLink
                                            className="cursor-pointer"
                                            isActive={number === currentPage}
                                            onClick={() => onPageChange(number)}
                                        >
                                            {number + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            {pageNumbers.map((number) => {
                                if (number < 5 && number > 0) {
                                    return (
                                        <PaginationItem key={number}>
                                            <PaginationLink
                                                isActive={number === currentPage}
                                                onClick={() => onPageChange(number)}
                                                className="cursor-pointer"
                                            >
                                                {number + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                }
                            })}
                        </>
                    )}
                    {pageNumbers?.length > 6 &&
                        currentPage < pageCount - (currentPage === 3 ? 3 : 4) && (
                            <PaginationItem>
                                <PaginationEllipsis
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (currentPage < pageCount - 5) {
                                            onPageChange(currentPage + 5);
                                        } else {
                                            onPageChange(pageCount - 1);
                                        }
                                    }}
                                />
                            </PaginationItem>
                        )}
                    {pageCount > 5 && (
                        <PaginationItem key={pageCount}>
                            <PaginationLink
                                isActive={pageCount === currentPage + 1}
                                onClick={() => onPageChange(pageCount - 1)}
                                className="cursor-pointer"
                            >
                                {pageCount}
                            </PaginationLink>
                        </PaginationItem>
                    )}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                onPageChange(Math.min(pageCount - 1, currentPage + 1))
                            }
                            className="cursor-pointer"
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
            {pagination && <>
                <Select
                    onValueChange={(value) => setPagination({ ...pagination, pageSize: Number(value) })}
                    defaultValue={pagination?.pageSize.toString()}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Chọn kích cỡ trang" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Kích cỡ trang</SelectLabel>
                            <SelectItem value="10">10 / trang</SelectItem>
                            <SelectItem value="20">20 / trang</SelectItem>
                            <SelectItem value="50">50 / trang</SelectItem>
                            <SelectItem value="100">100 / trang</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </>}
        </div>
    );
};
