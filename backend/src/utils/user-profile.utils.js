export const calculateAgeFromBirthDate = (birthDate) => {
  if (!birthDate) {
    return null;
  }

  const parsedBirthDate = birthDate instanceof Date ? birthDate : new Date(birthDate);

  if (Number.isNaN(parsedBirthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getUTCFullYear() - parsedBirthDate.getUTCFullYear();

  const hasHadBirthdayThisYear =
    today.getUTCMonth() > parsedBirthDate.getUTCMonth() ||
    (today.getUTCMonth() === parsedBirthDate.getUTCMonth() &&
      today.getUTCDate() >= parsedBirthDate.getUTCDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

export const parseBirthDateInput = (birthDate) => {
  if (birthDate === undefined) {
    return undefined;
  }

  if (birthDate === null || birthDate === "") {
    return null;
  }

  const parsedBirthDate = new Date(birthDate);

  if (Number.isNaN(parsedBirthDate.getTime())) {
    throw new Error("INVALID_BIRTH_DATE");
  }

  return parsedBirthDate;
};

export const toUserResponse = (user) => {
  if (!user) {
    return user;
  }

  return {
    ...user,
    age: calculateAgeFromBirthDate(user.birthDate),
  };
};
