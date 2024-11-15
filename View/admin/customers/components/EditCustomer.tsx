
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCustomer, updateCustomer } from "@/api/customer";
import Edit from "@/components/icons/Edit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Customer } from "@/types/type";

const initialState = {
  email: "",
  abbreviations: "",
  taxCode: "",
  customerName: "",
  address: "",
  phoneNumber: "",
  departments: [],
};

export default function EditCustomer({ customerData }: { customerData: any }) {
  const { toast } = useToast();
  const [departmentInputs, setDepartmentInputs] = useState<string[]>([]);
  const [dataInput, setDataInput] = useState<Customer>(initialState);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function getCustomerData() {
      try {
        setDataInput({
          email: customerData?.email || "",
          abbreviations: customerData?.abbreviations || "",
          taxCode: customerData?.taxCode || "",
          customerName: customerData?.customerName || "",
          address: customerData?.address || "",
          phoneNumber: customerData?.phoneNumber || "",
          departments: customerData?.departments?.map((department: any) => ({
            id: department?.id,
            department: department?.department,
          })) || []
        });

        setDepartmentInputs(
          customerData?.departments?.map((department: any) => ({
            id: department?.id,
            department: department?.department,
          })) || []
        );
      } catch (error) {
        console.log("Error fetching customer data", error);
      }
    }
    getCustomerData();
  }, [customerData?.id]);

  const handleChangeInput = (value: string, key: keyof Customer) => {
    setDataInput({ ...dataInput, [key]: value });
  };

  const handleAddDepartmentInput = () => {
    setDepartmentInputs([...departmentInputs, ""]);
  };

  const handleDepartmentInputChange = (value: string, index: number) => {
    const updatedDepartmentInputs = [...departmentInputs];
    updatedDepartmentInputs[index] = value;
    setDepartmentInputs(updatedDepartmentInputs);

    // Cập nhật lại dataInput với giá trị mới của departmentInputs
    const departments = updatedDepartmentInputs
      .filter((input) => typeof input === 'string' && input?.trim() !== "")
      .map((input) => ({ department: input.trim() }));

    setDataInput({ ...dataInput, departments });
  };

  const handleRemoveDepartmentInput = (index: number) => {
    const updatedDepartmentInputs = [...departmentInputs];
    updatedDepartmentInputs.splice(index, 1);
    setDepartmentInputs(updatedDepartmentInputs);

    const departments = updatedDepartmentInputs
      .filter((input) => typeof input === 'string' && input.trim() !== "")
      .map((input) => ({ department: input.trim() }));

    setDataInput({ ...dataInput, departments });
  };

  const id = customerData?.id;
  const mutation = useMutation({
    mutationFn: (data: any) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCustomer"],
      });
      toast({
        title: "Thành công",
        description: `Cập nhập thông tin khách hàng thành công`,
      });
    },
    onError: (error) => {
      toast({
        title: "Thất bại",
        description: error?.message,
      });
    },
  });

  const handleSubmit = async () => {
    const formattedDepartments = departmentInputs.map((input: any, index) => {
      if (typeof input === 'object' && input.id) {
        return {
          id: input.id,
          department: input.department
        };
      } else if (typeof input === 'string') {
        return { department: input };
      }
    });

    const payload = {
      ...dataInput,
      departments: formattedDepartments
    };

    mutation.mutateAsync(payload);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div>
          <Edit width="20" height="20" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] h-[650px] mx-auto overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Sửa thông tin khách hàng</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-[14px] mb-1">
            <span className="text-red-500">*</span> Tên khách hàng
          </p>
          <Input
            placeholder={"Nhập tên khách hàng"}
            value={dataInput.customerName}
            onChange={(e) => handleChangeInput(e.target.value, "customerName")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[14px] mb-1">
              <span className="text-red-500">*</span> Tên viết tắt
            </p>
            <Input
              value={dataInput.abbreviations}
              onChange={(e) =>
                handleChangeInput(e.target.value, "abbreviations")
              }
            />
          </div>
          <div>
            <p className="text-[14px] mb-1">
              <span className="text-red-500">*</span> Mã số thuế
            </p>
            <Input
              value={dataInput.taxCode}
              onChange={(e) => handleChangeInput(e.target.value, "taxCode")}
            />
          </div>
        </div>
        <div>
          <p className="text-[14px] mb-1">
            <span className="text-red-500">*</span> Địa chỉ
          </p>
          <Input
            value={dataInput.address}
            onChange={(e) => handleChangeInput(e.target.value, "address")}
          />
        </div>
        <div>
          <p className="text-[14px] mb-1">
            <span className="text-red-500">*</span> Email
          </p>
          <Input
            value={dataInput.email}
            onChange={(e) => handleChangeInput(e.target.value, "email")}
          />
        </div>
        <div>
          <p className="text-[14px] mb-1">
            <span className="text-red-500">*</span> Số điện thoại công ty
          </p>
          <Input
            value={dataInput.phoneNumber}
            onChange={(e) => handleChangeInput(e.target.value, "phoneNumber")}
          />
        </div>
        {/* Các phần input */}
        <div className="mb-2 flex flex-col">
          <p className="text-[14px] mb-1">
            <span className="text-red-500">*</span> Bộ phận liên hệ
          </p>
          {departmentInputs.map((input: any, index) => (
            <div key={index} className="flex items-center mb-2">
              <Input
                placeholder="Nhập bộ phận liên hệ"
                value={input?.department}
                onChange={(e) =>
                  handleDepartmentInputChange(e.target.value, index)
                }
                className={`${index > 0 && "mr-4"} flex-grow`}
              />
              {index > 0 && (
                <Button
                  onClick={() => handleRemoveDepartmentInput(index)}
                  variant={"destructive"}
                >
                  {/* <CloseIcon /> */} Xóa
                </Button>
              )}
            </div>
          ))}
          <Button onClick={handleAddDepartmentInput} className="mt-3">
            + Thêm dòng
          </Button>
        </div>
        {/* Phần footer */}
        <DialogFooter>
          <DialogClose>
            <Button type="button" variant="secondary">
              Huỷ
            </Button>
          </DialogClose>
          <DialogClose>
            <Button type="submit" variant="default" onClick={handleSubmit}>
              Sửa
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
