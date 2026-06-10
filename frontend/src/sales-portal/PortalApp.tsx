import { PortalRoutes } from "./PortalRoutes";

/** Lazy entry for `/portal/*`. */
export default function PortalApp() {
  return (
    <div className="portal-site min-h-dvh bg-[#FAFAFA] text-[#0A0A0A] antialiased">
      <PortalRoutes />
    </div>
  );
}
