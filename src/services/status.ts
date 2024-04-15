import { numberOrDefault } from "../utils/number";

export const STATUS_KEY = "status";

export const STATUS = {
  CLOSED: 0,
  OPEN: 1,
  PRIVATE: 2,
} as const;

export const getStatusMessage = (status: number) => {
  switch (status) {
    case STATUS.CLOSED:
      return "Baren er nå stengt! 🚪";
    case STATUS.OPEN:
      return "Baren er nå åpen! 🍻";
    case STATUS.PRIVATE:
      return "Lukket arrangement. 🎉";
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
