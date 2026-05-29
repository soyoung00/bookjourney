import { Suspense } from "react";
import LevelUpClient from "./LevelUpClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LevelUpClient />
    </Suspense>
  );
}