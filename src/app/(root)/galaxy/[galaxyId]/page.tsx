import React from "react";

interface Params {
  galaxyId: string;
}

export default async function Subdomain({
  params,
}: {
  params: Promise<Params>;
}) {
  const { galaxyId } = await params;
  console.log(`The Galaxy id is: `, galaxyId);

  return <>The Galaxy id is: {galaxyId}</>;
}