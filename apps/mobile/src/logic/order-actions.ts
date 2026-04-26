import { Order } from "@repo/shared";

export type OrderActionVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";

export interface OrderAction {
  zzz_id: string;
  label: string;
  variant: OrderActionVariant;
  onPress: () => void;
}

interface OrderActionCallbacks {
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}

/**
 * Returns the available actions for a given order based on the user's role and order status.
 */
export const getOrderActions = (
  order: Order,
  role: "entrepreneur" | "tourist",
  t: (key: string) => string,
  callbacks: OrderActionCallbacks,
): OrderAction[] => {
  const { zzz_global_status } = order;
  const actions: OrderAction[] = [];

  if (role === "entrepreneur") {
    if (zzz_global_status === "OFFER_PENDING") {
      if (callbacks.onDecline) {
        actions.push({
          zzz_id: "decline",
          label: t("common.decline"),
          variant: "danger",
          onPress: callbacks.onDecline,
        });
      }
      if (callbacks.onAccept) {
        actions.push({
          zzz_id: "accept",
          label: t("common.accept"),
          variant: "primary",
          onPress: callbacks.onAccept,
        });
      }
    }
  } else if (role === "tourist") {
    const isCancellable = ["SEARCHING", "OFFER_PENDING"].includes(zzz_global_status);
    if (isCancellable && callbacks.onCancel) {
      actions.push({
        zzz_id: "reject",
        label: t("orders.reject"),
        variant: "outline",
        onPress: callbacks.onCancel,
      });
    }
  }

  return actions;
};
