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
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postChangePassword } from "@/api/auth";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    passwordOld: z.string().nonempty("Vui long nhập mật khẩu hiện tại"),
    passwordNew: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
      .nonempty("Vui long nhập mật khẩu hiện tại"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.passwordNew === data.confirmPassword, {
    message: "Mật khẩu mới không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.passwordNew !== data.passwordOld, {
    message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
    path: ["passwordNew"],
  });

function PasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passwordOld: "",
      passwordNew: "",
      confirmPassword: "",
    },
  });

  const handleChange = async ({
    passwordOld,
    passwordNew,
  }: {
    passwordOld: string;
    passwordNew: string;
  }) => {
    setIsLoading(true);
    const result = await postChangePassword(passwordOld, passwordNew);
    if (result?.success) {
      setIsLoading(false);
      router.push("/login");
    } else {
      setIsLoading(false);
      form.setError("passwordOld", {
        type: "manual",
        message: result?.message,
      });
      form.setError("passwordNew", {
        type: "manual",
        message: result?.message,
      });
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
            name="passwordOld"
            render={({ field, fieldState: { error } }) => {
              return (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  {error && <FormMessage>{error.message}</FormMessage>}
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="passwordNew"
            render={({ field }) => {
              return (
                <FormItem className="mt-3">
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => {
              return (
                <FormItem className="mt-3">
                  <FormLabel>Xác nhận lại mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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

export default PasswordForm;
