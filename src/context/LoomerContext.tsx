"use client";
import React, { createContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Loomer } from "@/types/Loomer";
import { DEFAULT_LOOMER_DATA } from "@/config/constants/navigation-header";
import { LoomerContextType, LoomerProviderProps } from "@/types/LoomerContext";


const LoomerContext = createContext<LoomerContextType | undefined>(undefined);

const LoomerProvider = ({ children }: LoomerProviderProps) => {
  const [loomer, setLoomer] = useState<Loomer | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  // Function to fetch loomer data from API
  const fetchLoomerData = async (hashId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/getLoomer?hashId=${hashId}`);
      const data = response.data;
      setLoomer(data.data);

      if (data.success) {
        localStorage.setItem("loomer", JSON.stringify(data.data));
      }
    } catch (error) {
      console.error("Failed to fetch loomer data:", error);
      const localLoomer = JSON.parse(localStorage.getItem("loomer") || "null");
      if (localLoomer) {
        setLoomer(localLoomer);
      } else {
        setLoomer(DEFAULT_LOOMER_DATA);
      }
    } finally {
      setLoading(false);
    }
  };

  const logoutLoomer = async () => {
    setLoading(true);
    try {
      setLoomer(null);
      localStorage.removeItem("loomer");
    } catch (error) {
      console.log("Failed to remove loomer", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (status === "authenticated" && session?.user) {
      setLoomer(session?.user)
      // const { hashId } = session.user as { hashId: string };
      // fetchLoomerData(hashId);
    } else {
      const localLoomer = JSON.parse(localStorage.getItem("loomer") || "null");
      if (localLoomer) {
        setLoomer(localLoomer);
      } else {
        setLoomer(DEFAULT_LOOMER_DATA);
      }
    }
    setLoading(false);
  }, [session, status]);

  return (
    <LoomerContext.Provider
      value={{ loomer, setLoomer, fetchLoomerData, logoutLoomer, loading }}
    >
      {children}
    </LoomerContext.Provider>
  );
};

export { LoomerContext, LoomerProvider };
