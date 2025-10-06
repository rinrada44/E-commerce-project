"use client";

import React from "react";
import MainLayout from "@/components/layout/main";
import SingleProduct from "@/components/SingleProduct";
import { useParams } from "next/navigation";

function Page() {
  const { id } = useParams();

  return (
    <MainLayout>
      <SingleProduct id={id} />
    </MainLayout>
  );
}

export default Page;
