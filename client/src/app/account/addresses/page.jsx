'use client'

import React, { useEffect, useState } from 'react';
import UserLayout from '@/components/layout/UserLayout'
import AddressManagement from '@/components/user/AddressManagement'
import useRouteGuard from '@/hooks/routeGuard';

function AddressPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useRouteGuard(); // ตรวจสอบ login
    setReady(true); // รอ client-side ก่อน
  }, []);

  if (!ready) return <p>Loading...</p>;

  return (
    <UserLayout>
      <AddressManagement />
    </UserLayout>
  );
}

export default AddressPage;
