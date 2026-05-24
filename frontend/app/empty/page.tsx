"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmptyGatePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    router.push("/login");
  }, [ready, router]);

  return (
    <div className="h-screen w-full bg-black" aria-label="loading" />
  );
}

