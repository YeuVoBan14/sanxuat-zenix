import {
  getAllListProduct,
  getListProduct,
  getListQuotedProduct,
} from "@/api/product";
import { getListProductQuotation } from "@/api/quotations";
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
  productCodes: string[];
  option?: string;
  selectedRows: string[];
  setSelectedRows: (value: string[]) => void;
};

export default function AddListProducts({
  onAddProducts,
  productCodes,
  option,
  selectedRows,
  setSelectedRows,
}: AddListProductsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    keySearch: string;
  }>({
    page: 0,
    pageSize: 10,
    keySearch: "",
  });

  const {
    data: productsData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["productsData", pagination],
    queryFn: () => getListProduct(pagination),
  });

  const {
    data: quotedProductsData,
    error: errorQuoted,
    isLoading: loadingQuoted,
  } = useQuery({
    queryKey: ["quotedProductsData", pagination],
    queryFn: () => getListQuotedProduct(pagination),
    enabled: option === "create_quick_quoted" ? true : false,
  });

  const { data: allProductsData } = useQuery({
    queryKey: ["allProductsData"],
    queryFn: getAllListProduct,
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
      const allProductCodes = productsData?.data?.data?.products?.map(
        (product: Products) => product.productCode
      );
      setSelectedRows(allProductCodes);
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (productCode: string) => {
    if (selectedRows.includes(productCode)) {
      setSelectedRows(selectedRows.filter((code) => code !== productCode));
    } else {
      setSelectedRows([...selectedRows, productCode]);
    }
    // setSelectedRows((prevSelected) =>
    //   prevSelected.includes(productCode)
    //     ? prevSelected.filter((code) => code !== productCode)
    //     : [...prevSelected, productCode]
    // );
  };

  const handleAddProducts = () => {
    // const selectedProducts =
    //   option === "create_quick_quoted"
    //     ? quotedProductsData?.data?.data?.products?.filter(
    //         (product: Products) =>
    //           selectedRows.includes(product.productCode) &&
    //           !productCodes.includes(product.productCode)
    //       )
    //     : productsData?.data?.data?.products?.filter(
    //         (product: Products) =>
    //           selectedRows.includes(product.productCode) &&
    //           !productCodes.includes(product.productCode)
    //       );
    const selectedProducts = allProductsData?.data?.data.filter(
      (product: Products) =>
        selectedRows.includes(product.productCode) &&
        !productCodes.includes(product.productCode)
    );
    onAddProducts(selectedProducts);
    setIsDialogOpen(false);
  };

  const columns: ColumnDef<Products>[] = [
    {
      id: "select",
      header: () => (
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.original.productCode)}
          onChange={() => handleCheckboxChange(row.original.productCode)}
          disabled={productCodes.includes(row.original.productCode)}
        />
      ),
    },
    {
      accessorKey: "productCode",
      header: "Mã sản phẩm",
      cell: ({ row }) => <div>{row.original.productCode}</div>,
    },
    {
      accessorKey: "productName",
      header: "Tên sản phẩm",
      cell: ({ row }) => <div>{row.original.productName}</div>,
    },
    {
      accessorKey: "image",
      header: "Ảnh",
      cell: ({ row }) => {
        return (
          <>
            {row.original.image !== null && (
              <img
                src={`${row.original.image}`}
                alt="product"
                width={"10px"}
                height={"10px"}
              />
            )}
          </>
        );
      },
    },
    {
      accessorKey: "producerInfo",
      header: "Nhà sản xuất",
      cell: ({ row }) => <div>{row.original.producerInfo?.name}</div>,
    },
    {
      accessorKey: "unit",
      header: "Đơn vị tính",
      cell: ({ row }) => <div>{row.original.unit}</div>,
    },
  ];
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
      <DialogTrigger asChild>
        <div
          onClick={() => {
            setIsDialogOpen(true);
          }}
        >
          <MenuAdd width="20" height="20" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] sm:max-h-[700px]">
        <DialogHeader>
          <DialogTitle>Danh sách sản phẩm</DialogTitle>
        </DialogHeader>
        <div className="h-[480px] overflow-y-auto overflow-x-hidden">
          <div className="flex justify-between items-center mb-3">
            <SearchInput
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              placeholder="Tìm kiếm sản phẩm"
            />
          </div>
          {[isLoading, loadingQuoted].includes(true) ? (
            <LoadingSpinner />
          ) : (
            <>
              <DataTable
                data={
                  option === "create_quick_quoted"
                    ? quotedProductsData?.data?.data?.products
                    : productsData?.data?.data?.products || []
                }
                columns={columns}
              />
              <div className="mt-5 flex justify-end">
                <Paginations
                  currentPage={pagination.page}
                  pageCount={
                    option === "create_quick_quoted"
                      ? quotedProductsData?.data?.data?.numberPages
                      : productsData?.data?.data?.numberPages
                  }
                  pagination={pagination}
                  setPagination={setPagination}
                  onPageChange={(value: number) =>
                    setPagination({ ...pagination, page: value })
                  }
                />
              </div>
            </>
          )}
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
