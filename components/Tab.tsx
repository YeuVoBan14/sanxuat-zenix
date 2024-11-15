import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tab({
  defaults,
  defaultValue,
  handleOnclickTab,
}: {
  defaults: any;
  defaultValue: number;
  handleOnclickTab?: any;
}) {
  return (
    <>
      <Tabs
        onClick={handleOnclickTab}
        defaultValue={`${defaultValue}`}
        className="w-full"
      >
        <div className="border-b-2 border-b-gray-300">
          <TabsList>
            {defaults.map((item: any) => (
              <TabsTrigger
                className="relative"
                key={item.key}
                value={`${item.key}`}
              >
                {item.quantity !== undefined ? (
                  <p>{`${item.label} (${item.quantity})`}</p>
                ) : (
                  <p>{item.label}</p>
                )}
                {/* <div className=" rounded-full p-1 text-xs bg-red-500 h-4 w-4 text-white flex items-center justify-center font-medium absolute bottom-[13px] right-[-6px]">
                                    {item.quantity}
                                </div> */}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {defaults.map((item: any) => (
          <TabsContent key={item.key} value={`${item.key}`}>
            {item.children}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
