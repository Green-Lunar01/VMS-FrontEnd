"use client";

import { HomeBoard } from "@/components/dashboard/HomeBoard";
import { mockVisitors } from "@/data/mock-data";

export default function SecurityHomePage() {
  return <HomeBoard visitors={mockVisitors} board="default" />;
}
