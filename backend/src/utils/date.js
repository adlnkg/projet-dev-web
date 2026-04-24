export const parseDateValue = (value, fieldName) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} doit etre une date valide.`);
  }

  return parsed;
};

