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

const phoneRegex = /^[0-9]+$/;
const formSchema = z.object({
  fullName: z.string().min(5, "Họ và tên phải có ít nhất 5 ký tự"),
  phoneNumber: z
    .string()
    .min(10, "Định dạng số điện thoại không đúng")
    .max(10, "Định dạng số điện thoại không đúng")
    .regex(phoneRegex, "Định dạng số điện thoại không đúng"),
  email: z.string().email("Định dang email không đúng"),
});

function AccountForm() {
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
      fullName: user?.fullName,
      phoneNumber: user?.phoneNumber || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
      });
    }
  }, [user, form.reset]);

  const handleChange = async (data: {
    fullName: string;
    phoneNumber: string;
    email: string;
  }) => {
    setIsLoading(true);
    const result = await updateProfile(data);
    if (result?.success) {
      setIsLoading(false);
      const currentUserData = localStorage.getItem("user");
      const currentUser = currentUserData ? JSON.parse(currentUserData) : {};
      const updatedUser = {
        ...currentUser,
        ...data,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast({
        title: "Thành công",
        description: "Cập nhật hồ sơ thành công",
      });
      setIsLoading(false);
    } else {
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
            name="fullName"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => {
                return (
                  <FormItem className="mt-3 w-full">
                    <FormLabel>Số điện thoại</FormLabel>
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
              name="email"
              render={({ field }) => {
                return (
                  <FormItem className="mt-3 w-full">
                    <FormLabel>Email</FormLabel>
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

export default AccountForm;
