'use client'
import UserLayout from '@/components/layout/UserLayout'
import OrderHistory from '@/components/user/OrderHistory'
import React from 'react'
import useRouteGuard from "@/hooks/routeGuard";

function Page() {
  if (typeof window !== "undefined") {
    useRouteGuard();
  }

  return (
    <UserLayout>
      <OrderHistory />
    </UserLayout>
  )
}

export default Page;
