'use client'

import React, { useEffect, useState } from 'react';
import UserLayout from '@/components/layout/UserLayout'
import PaymentHistory from '@/components/user/PaymentHistory'
import useRouteGuard from '@/hooks/routeGuard';

function PaymentsPage() {
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    useRouteGuard(); // ตรวจสอบ login
    setTokenReady(true); // รอ client-side ก่อน
  }, []);

  if (!tokenReady) return <p>Loading...</p>;

  return (
    <UserLayout>
      <PaymentHistory />
    </UserLayout>
  );
}

export default PaymentsPage;
