"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { postLogin } from "@/api/auth";
import { useState, useEffect } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const formSchema = z.object({
  userName: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(3, "Mật khẩu phải có ít nhất 3 ký tự"),
});

export default function Home() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "giap",
      password: "1234",
    },
  });

  const handleLogin = async (values: {
    userName: string;
    password: string;
  }) => {
    setIsLoading(true);
    const result = await postLogin(values.userName, values.password);

    if (result?.success) {
      setIsLoading(false);
      if (searchParams) {
        window.location.href = searchParams[1];
      } else {
        window.location.href = "/admin";
      }
    } else {
      setIsLoading(false);
      if (result?.type === "userName") {
        form.setError("userName", {
          type: result?.type,
          message: result?.message,
        });
      } else {
        form.setError("password", {
          type: result?.type,
          message: result?.message,
        });
      }
    }
  };

  // useEffect để tự động đăng nhập khi trang tải lên
  useEffect(() => {
    const autoLogin = async () => {
      await handleLogin({ userName: "giap", password: "123456" });
    };
    autoLogin();
  }, []); // Chỉ chạy khi trang được tải lên lần đầu

  return (
    <div className="flex justify-center items-center w-full">
      <Card className="mx-auto max-w-sm md:w-[370px]">
        <CardHeader className="space-y-1 ">
          <Image
            width={225}
            alt=""
            className="mx-auto min-h-fit"
            height={94}
            src="/logo-mega.png"
          />
          <CardTitle className="text-2xl font-bold flex justify-center">
            Đăng nhập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLogin)}
              className="max-w-md w-full flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên đăng nhập" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input placeholder="Mật khẩu" type="password" {...field} />
                    </FormControl>
                    {error && <FormMessage>{error.message}</FormMessage>}
                  </FormItem>
                )}
              />
              <Button disabled={isLoading}>
                {isLoading && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Đăng nhập
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
