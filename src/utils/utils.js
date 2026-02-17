export const isValidPassword = password => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/;
  return regex.test(password);
};

export const handleAlphaNumericInput = (
  value,
  setValue,
  alphaLength = 1,
  numericLength = 4,
) => {
  // Remove spaces
  const cleanedValue = value.replace(/\s/g, '');

  const maxLength = alphaLength + numericLength;
  if (cleanedValue.length > maxLength) return;

  // Letters validation
  if (cleanedValue.length <= alphaLength && !/^[A-Za-z]*$/.test(cleanedValue)) {
    return;
  }

  // Numbers validation
  if (
    cleanedValue.length > alphaLength &&
    !new RegExp(`^[A-Za-z]{${alphaLength}}[0-9]*$`).test(cleanedValue)
  ) {
    return;
  }

  setValue(cleanedValue);
};
