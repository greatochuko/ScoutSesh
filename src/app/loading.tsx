"use client";
import React from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { usePathname } from "next/navigation";

export default function FullPageLoader() {
  const pathname = usePathname();
  return (
    <>
      {pathname.startsWith("/dashboard") && (
        <DashboardHeader invitationCode={null} notifications={[]} />
      )}
      <div className="flex-center flex-1">
        <LoadingIndicator color="#16A34A" size={28} />
      </div>
    </>
  );
}
