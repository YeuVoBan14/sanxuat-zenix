"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { getCompanyInfo, updateCompanyInfo } from "@/api/company";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const phoneRegex = /^[0-9]+$/;
const formSchema = z.object({
  name: z.string(),
  address: z.string(),
  abbreviation: z.string(),
  taxCode: z.string(),
  phoneNumber: z.string(),
  fanpage: z.string(),
  website: z.string(),
});

interface DataType {
  id: number;
  name: string;
  address: string;
  abbreviation: string;
  taxCode: string;
  phoneNumber: string;
  fanpage: string;
  website: string;
}
interface CompanyFormProps {
  companyInfo: DataType;
  token: string;
}

function CompanyInfos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const {
    data: companyInfo,
    error,
    isLoading,
  } = useQuery({ queryKey: ["companyInfo"], queryFn: getCompanyInfo });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (companyInfo) {
      form.reset({
        name: companyInfo?.data?.name,
        address: companyInfo?.data?.address,
        abbreviation: companyInfo?.data?.abbreviation,
        phoneNumber: companyInfo?.data?.phoneNumber,
        taxCode: companyInfo?.data?.taxCode,
        fanpage: companyInfo?.data?.fanpage,
        website: companyInfo?.data?.website,
      });
    }
  }, [companyInfo, form]);

  const id = companyInfo?.data?.id;

  const mutation = useMutation({
    mutationFn: (data: any) => updateCompanyInfo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companyInfo"],
      });
      setIsLoadingSubmit(false);
      form.reset();
      toast({
        title: "Thành công",
        description: `Sửa thông tin công ty thành công`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Thất bại",
        description: error?.response?.data?.message,
      });
    },
  });

  const onSubmits = async (data: any) => {
    let result = false;
    try {
      await mutation.mutateAsync({ id, ...data });
      result = true;
    } catch (error) {
      console.error("Error submitting form:", error);
    }
    return result;
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmits)}
        className="w-full flex flex-col gap-4"
      >
        <div className="flex">
          <CardContent className="lg:w-1/2">
            <h3 className="font-bold mt-4">Thông tin công ty</h3>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Tên công ty</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-gray-300"
                        type="text"
                        disabled={true}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="mt-3">
              <FormField
                control={form.control}
                name="abbreviation"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Tên viết tắt</FormLabel>
                      <FormControl>
                        <Input className="bg-gray-300" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="mt-3">
              <FormField
                control={form.control}
                name="taxCode"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="mt-3">Mã số thuế</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-gray-300"
                          type="text"
                          {...field}
                          disabled={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="mt-3">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="flex mt-3">
                        <div className="text-red-500">* </div> Địa chỉ
                      </FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </CardContent>
          <CardContent className="lg:w-1/2">
            <h3 className="font-bold mt-4">Thông tin liên hệ</h3>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => {
                return (
                  <FormItem className="mt-3 w-full">
                    <FormLabel className="flex">
                      <div className="text-red-500">* </div> Số điện thoại
                    </FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="fanpage"
              render={({ field }) => {
                return (
                  <FormItem className="mt-3 w-full">
                    <FormLabel>Fanpage</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => {
                return (
                  <FormItem className="mt-3 w-full">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </CardContent>

        </div>
        <CardFooter>
          <Button
            className="border shadow-lg"
            disabled={isLoadingSubmit}
          >
            {isLoadingSubmit && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}

export default CompanyInfos;
