export const FON_BANK_CODE = "555";

const CURRENCY_MARKERS = {
  RSD: "10",
  EUR: "20",
} as const;

export function normalizeAccountNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function formatAccountNumber(value: string) {
  const digits = normalizeAccountNumber(value).slice(0, 18);

  if (digits.length <= 3) return digits;
  if (digits.length <= 16) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

  return `${digits.slice(0, 3)}-${digits.slice(3, 16)}-${digits.slice(16)}`;
}

export function isValidDomesticAccount(value: string) {
  const number = normalizeAccountNumber(value);
  if (number.length !== 18) return false;

  let remainder = 0;
  for (const digit of `${number.slice(0, 16)}00`) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }

  return number.slice(-2) === String(98 - remainder).padStart(2, "0");
}

export function isFonAccountForCurrency(value: string, currency: "RSD" | "EUR") {
  const number = normalizeAccountNumber(value);
  return (
    isValidDomesticAccount(number) &&
    number.startsWith(FON_BANK_CODE) &&
    number.slice(3, 5) === CURRENCY_MARKERS[currency]
  );
}

export function formatIban(value: string) {
  return value.replace(/\s/g, "").match(/.{1,4}/g)?.join(" ") ?? value;
}
