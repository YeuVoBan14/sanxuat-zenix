import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AccountForm from "./components/AccountForm";
import PasswordForm from "./components/PasswordForm";

export default function Profile() {
  return (
    <Tabs defaultValue="account">
      <TabsList className="grid w-full grid-cols-2 sm:w-2/3 md:w-1/3">
        <TabsTrigger value="account">Thông tin tài khoản</TabsTrigger>
        <TabsTrigger value="password">Thay đổi mật khẩu</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Tài khoản</CardTitle>
            <CardDescription>
              Thực hiện thay đổi cho tài khoản của bạn tại đây. Nhấp vào lưu khi bạn hoàn tất..
            </CardDescription>
          </CardHeader>
          <AccountForm />
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Mật khẩu</CardTitle>
            <CardDescription>Thay đổi mật khẩu của bạn ở đây. Sau khi lưu, bạn sẽ đăng xuất.</CardDescription>
          </CardHeader>
          <PasswordForm />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
