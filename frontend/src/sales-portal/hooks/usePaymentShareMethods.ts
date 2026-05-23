import { useMemo } from "react";
import { usePortalSettingsQuery } from "./useSalesQueries";
import {
  defaultPaymentShareMethods,
  mergePaymentShareMethods,
  type PaymentShareMethodConfig
} from "../lib/paymentShareMethods";

/** Merged portal payment share methods for rep/admin payment modals. */
export function usePaymentShareMethods(enabled = true): PaymentShareMethodConfig[] {
  const settingsQr = usePortalSettingsQuery(enabled);
  return useMemo(
    () =>
      mergePaymentShareMethods(
        settingsQr.data?.settings?.paymentShareMethods ?? defaultPaymentShareMethods()
      ),
    [settingsQr.data?.settings?.paymentShareMethods]
  );
}
