"use client";

import { useContext } from "react";
import { LoomerContext } from "@/context/LoomerContext";

const useLoomer = () => {
  const context = useContext(LoomerContext);
  if (!context) {
    throw new Error("useLoomer must be used within a LoomerProvider");
  }
  return context;
};

export default useLoomer;
