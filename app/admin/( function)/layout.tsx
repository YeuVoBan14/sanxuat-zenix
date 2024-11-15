import { SideBar } from "@/components/sidebar/sidebar";
import Header from "@/components/navbar/navbar";
import PageWrapper from "@/components/sidebar/pagewrapper";
import { getUserFunctions } from "@/api/auth";
import { cookies } from "next/headers";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  let response;
  if (token) {
    response = await getUserFunctions({ token });
  }

  return (
    <>
      <SideBar data={response?.data?.data}></SideBar>
      <Header data={response?.data?.data}></Header>
      <PageWrapper children={children}></PageWrapper>
    </>
  );
}
