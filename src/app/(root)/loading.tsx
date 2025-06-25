import PageLoader from "@/components/shared/PageLoader";
import React from "react";

function loading() {
  return (
    <div className="w-full h-[calc(100vh-14px)] flex flex-row justify-center items-center ">
      <PageLoader />
    </div>
  );
}

export default loading;
