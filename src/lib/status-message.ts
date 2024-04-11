export const getStatusMessage = (status: number) => {
  switch (status) {
    case 0:
      return "Baren er stengt.";
    case 1:
      return "Barne er åpen.";
    default:
      return "Ukjent status.";
  }
};
