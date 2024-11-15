import { getUserFunctions } from "@/api/auth";
import Home from "@/View/Home";
import { cookies } from "next/headers";

async function page() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  let response;
  if (token) {
    response = await getUserFunctions({ token });
  }
  return <Home />;
}

export default page;
