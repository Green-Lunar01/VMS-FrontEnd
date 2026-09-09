"use client";

import { HomeBoard } from "@/components/dashboard/HomeBoard";

export default function SecurityHomePage() {
  // Security can onboard walk-ins and sign visitors in/out from the queues.
  return <HomeBoard canOnboardWalkIn canApprove />;
}
