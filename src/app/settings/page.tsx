import { Suspense } from "react";
import SettingTabController from "./(tabs)/SettingTabController";

export default function Settings() {
  return (
    <main className="mx-auto min-h-[50vh] w-full max-w-2xl px-6 py-10">
      <Suspense fallback={<div className="min-h-[280px]" aria-hidden />}>
        <SettingTabController />
      </Suspense>
    </main>
  );
}