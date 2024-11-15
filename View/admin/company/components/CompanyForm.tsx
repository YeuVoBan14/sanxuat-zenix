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
import { User } from "@/types/type";
import { updateProfile } from "@/api/auth";
import { useToast } from "@/components/ui/use-toast";
import { updateCompanyInfo } from "@/api/company";
import { cookies } from "next/headers";

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

function CompanyForm({ companyInfo, token }: CompanyFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Công ty TNHH MEGATOOL",
      address: companyInfo.address || "",
      abbreviation: companyInfo.abbreviation || "",
      phoneNumber: companyInfo.phoneNumber || "",
      taxCode: companyInfo.taxCode || "",
      fanpage: companyInfo.fanpage || "",
      website: companyInfo.website || "",
    },
  });

  // useEffect(() => {
  //   if (user) {
  //     form.reset({
  //       fullName: user.fullName,
  //       phoneNumber: user.phoneNumber,
  //       email: user.email,
  //     });
  //   }
  // }, [user, form.reset]);
  const handleChange = async () => {
    try {
      const formData = form.getValues();
      setIsLoading(true);

      const result = await updateCompanyInfo(companyInfo?.id, formData);
      if (result && result.success) {
        toast({
          title: "Thành công",
          description: "Cập nhật hồ sơ thành công",
        });
      } else {
        toast({ title: "Thất bại", description: "Cập nhật thất bại" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleChange)}
        className="w-full flex flex-col gap-4"
      >
        <CardContent className="lg:w-1/3">
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

          <FormField
            control={form.control}
            name="taxCode"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Mã số thuế</FormLabel>
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
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex mt-3">
                    <div className="text-red-500">*</div> Địa chỉ
                  </FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <h3 className="font-bold mt-4">Thông tin liên hệ</h3>
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => {
              return (
                <FormItem className="mt-3 w-full">
                  <FormLabel className="flex">
                    <div className="text-red-500">*</div> Số điện thoại
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
        <CardFooter>
          <Button
            className="bg-blue-500 hover:bg-blue-800 text-white hover:text-white border shadow-lg"
            disabled={isLoading}
          >
            {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}

export default CompanyForm;
