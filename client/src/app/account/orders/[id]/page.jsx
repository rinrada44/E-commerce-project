'use client'

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/main';
import SingleOrder from '@/components/user/SingleOrder';
import { useParams } from 'next/navigation';

function OrderPage() {
  const { id } = useParams(); // dynamic route /order/[id]
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true); // รอ client-side ก่อน
  }, []);

  if (!ready) return <p>Loading...</p>;

  return (
    <MainLayout>
      <SingleOrder id={id} />
    </MainLayout>
  );
}

export default OrderPage;
