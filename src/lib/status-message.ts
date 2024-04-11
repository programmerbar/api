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
