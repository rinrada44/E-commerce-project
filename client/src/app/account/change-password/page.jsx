'use client'

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/main';
import { ChangePasswordForm } from '@/components/ChangePsw-form';
import useRouteGuard from '@/hooks/routeGuard';

function ChangePasswordPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useRouteGuard(); // ตรวจสอบ login
    setReady(true); // รอ client-side ก่อน render
  }, []);

  if (!ready) return <p>Loading...</p>;

  return (
    <MainLayout>
      <div className="mx-16 p-8">
        <ChangePasswordForm />
      </div>
    </MainLayout>
  );
}

export default ChangePasswordPage;
