const nameSanitizer = (value: string) => {
  const regex = /^[a-zA-Z\s]+$/;
  if (!regex.test(value)) {
    throw new Error("Name must be a string with only letters and spaces");
  }
};

const inviteCodeSanitizer = (value: string) => {
  return Number.parseInt(value);
};

export { nameSanitizer, inviteCodeSanitizer };
