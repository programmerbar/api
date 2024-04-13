import { numberOrDefault } from "../utils/number";

export const STATUS_KEY = "status";

export const STATUS = {
  CLOSED: 0,
  OPEN: 1,
} as const;

export const getStatusMessage = (status: number) => {
  switch (status) {
    case 0:
      return "Baren er nå stengt! 🚪";
    case 1:
      return "Baren er nå åpen! 🍻";
    default:
      return "Ukjent status.";
  }
};

export type StatusService = ReturnType<typeof createStatusService>;

export const createStatusService = (kv: KVNamespace) => {
  return {
    async getStatus() {
      return numberOrDefault(await kv.get(STATUS_KEY));
    },
    async setStatus(status: number) {
      await kv.put(STATUS_KEY, String(status));
    },
  };
};
