// Server component — generates static params for export
// then delegates to the client component for interactive rendering
import WatchVideoClient from "./WatchVideoClient";

export async function generateStaticParams() {
  // Return placeholder for export build — real IDs loaded at runtime
  return [{ id: "placeholder" }];
}

export default function WatchVideoPage() {
  return <WatchVideoClient />;
}
