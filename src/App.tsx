import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/Skeleton";

const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Events = lazy(() =>
  import("@/pages/Events").then((m) => ({ default: m.Events })),
);
const Devices = lazy(() =>
  import("@/pages/Devices").then((m) => ({ default: m.Devices })),
);

function PageFallback() {
  return (
    <div className="space-y-3 px-6 py-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="events"
          element={
            <Suspense fallback={<PageFallback />}>
              <Events />
            </Suspense>
          }
        />
        <Route
          path="devices"
          element={
            <Suspense fallback={<PageFallback />}>
              <Devices />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
