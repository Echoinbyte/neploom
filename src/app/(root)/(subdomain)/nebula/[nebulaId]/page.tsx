import React from "react";

interface Params {
  nebulaId: string;
}

export default async function Subdomain({
  params,
}: {
  params: Promise<Params>;
}) {
  const { nebulaId } = await params;
  console.log(`The Nebula id is: `, nebulaId);

  return <>The Nebula id is: {nebulaId}</>;
}
