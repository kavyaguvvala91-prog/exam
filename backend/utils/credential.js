export const USERNAME_PATTERN = /^2451-\d{2}-\d{3}-\d{3}$/;

export const normalizeUsername = (value = "") => value.trim();

export const isValidUsername = (value = "") => USERNAME_PATTERN.test(normalizeUsername(value));
