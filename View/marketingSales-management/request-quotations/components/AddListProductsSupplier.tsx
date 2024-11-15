import { getListProduct } from "@/api/product";
import { getListProductQuotation } from "@/api/quotations";
import { getSupplierListByProduct } from "@/api/supply";
import ErrorViews from "@/components/ErrorViews";
import { Paginations } from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import MenuAdd from "@/components/icons/MenuAdd";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/custom/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Products } from "@/types/type";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

type AddListProductsProps = {
  onAddProducts: (products: Products[]) => void;
  productId: number | undefined;
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  supplierSelected: number[]
};

interface Suppliers {
  name: string;
  address: string;
  phoneNumber: string;
  userContact: string;
  id: number;
}

export default function AddListProductsSupplier({
  onAddProducts,
  productId,
  isDialogOpen,
  setIsDialogOpen,
  supplierSelected
}: AddListProductsProps) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    keySearch: string,
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
  });

  const { data: supplierList, isLoading, error } = useQuery({
    queryKey: ["supplierList", productId],
    queryFn: () => getSupplierListByProduct(productId ? productId : 0),
    enabled: productId ? true : false,
  });

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-15 w-15 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, keySearch: searchValue, page: 0 });
    }, 500);
    return () => clearTimeout(timeId);
  }, [searchValue]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      const allProductCodes = supplierList?.data?.data?.suppliers?.map(
        (supplier: Suppliers) => supplier.id
      );
      setSelectedRows(allProductCodes);
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((newId) => newId !== id)
        : [...prevSelected, id]
    );
  };

  const handleAddProducts = () => {
    const selectedSuppliers = supplierList?.data[0].suppliers?.filter((supplier: Suppliers) =>
      selectedRows.includes(supplier.id) && !supplierSelected.includes(supplier.id)
    );
    onAddProducts(selectedSuppliers);
    setIsDialogOpen(false);
  };

  const columns: ColumnDef<Suppliers>[] = [
    {
      id: "select",
      header: () => (
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.original.id)}
          onChange={() => handleCheckboxChange(row.original.id)}
          disabled={supplierSelected.includes(row.original.id)}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Tên nhà cung cấp",
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      cell: ({ row }) => <div>{row.original.address}</div>,
    },
    {
      accessorKey: "phoneNumber",
      header: "Số điện thoại",
      cell: ({ row }) => <div>{row.original.phoneNumber}</div>,
    },
    {
      accessorKey: "userContact",
      header: "Người liên hệ",
      cell: ({ row }) => <div>{row.original.userContact}</div>,
    }
  ];

  if (isLoading) return <LoadingSpinner />;
  if (error instanceof Error && "response" in error) {
    const status = (error as any).response?.status;
    const type = (error as any).response?.type;
    const statusText = (error as any).response?.statusText;
    const message = (error as any).response?.data?.message;
    return (
      <ErrorViews status={status} statusText={statusText} message={message} type={type} />
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[800px] sm:max-h-[700px]">
        <DialogHeader>
          <DialogTitle>Danh sách nhà cung cấp</DialogTitle>
        </DialogHeader>
        <div className="h-[480px] overflow-y-auto overflow-x-hidden">
          <div className="flex justify-between items-center mb-3">
            <SearchInput
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              placeholder="Tìm kiếm nhà cung cấp"
            />
          </div>
          <DataTable data={supplierList?.data[0].suppliers || []} columns={columns} />
          {/* <div className="mt-5 flex justify-end">
            <Paginations
              currentPage={pagination.page}
              pageCount={supplierList?.data?.data?.numberPages}
              pagination={pagination}
              setPagination={setPagination}
              onPageChange={(value: number) => setPagination({ ...pagination, page: value })}
            />
          </div> */}
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Huỷ
            </Button>
          </DialogClose>
          <Button type="button" variant="default" onClick={handleAddProducts}>
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
