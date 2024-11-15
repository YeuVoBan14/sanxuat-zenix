import { Slash } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export default function BreadcrumbFunction({
  functionName,
  title,
  nameFunction,
  hasChildFunc,
  link,
}: {
  functionName: string;
  title: string;
  nameFunction?: string;
  hasChildFunc: boolean;
  link: string;
}) {
  //   const t: any = useTranslations();

  return (
    <div className="my-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>{functionName}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${link}`}>{title}</BreadcrumbLink>
          </BreadcrumbItem>
          {hasChildFunc && (
            <>
              <BreadcrumbSeparator>
                <Slash />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{nameFunction}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
