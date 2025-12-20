'use client'
import Image from "next/image";
import Link from "next/link";
import AppTable from "@/components/app.table";
import useSWR from "swr";

export default function Home() {

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR(
    "http://127.0.0.1:5000/data",
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return (
    <div className="min-h-screen bg-white">
      
    </div>
  );
}
