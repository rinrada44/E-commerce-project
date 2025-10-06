'use client'
import React, { useEffect, useState } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import SingleOrder from '@/components/user/SingleOrder';
import { useParams } from 'next/navigation';

function OrderPage() {
  const { id } = useParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return <p>Loading...</p>;

  return (
    <UserLayout>
      <SingleOrder id={id} />
    </UserLayout>
  );
}

export default OrderPage;
