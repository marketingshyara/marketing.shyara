import { PortalSegmentedNav } from "../ui/PortalSegmentedNav";

type Props = {
  reviewsBadge?: number;
};

export function AdminQueueNav({ reviewsBadge }: Props) {
  return (
    <PortalSegmentedNav
      segments={[
        { to: "/portal/reviews", label: "Reviews", badge: reviewsBadge },
        { to: "/portal/payments", label: "Payments" }
      ]}
    />
  );
}
