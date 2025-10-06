'use client'

import React from 'react';
import MainLayout from '@/components/layout/main';
import UserReviewManager from '@/components/user/ReviewManager';

export default function Page() {
  return (
    <MainLayout>
      <UserReviewManager />
    </MainLayout>
  );
}
