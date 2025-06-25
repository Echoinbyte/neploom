import React from "react";

interface Params {
  neplerId: string;
}

export default async function Subdomain({
  params,
}: {
  params: Promise<Params>;
}) {
  const { neplerId } = await params;
  console.log(`The nepler id is: `, neplerId);

  return <>The nepler id is: {neplerId}</>;
}
