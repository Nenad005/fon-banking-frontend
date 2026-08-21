export const FON_BANK_CODE = "555";

const CURRENCY_MARKERS = {
  RSD: "10",
  EUR: "20",
} as const;

export class AccountNumber {
  readonly normalized: string;

  constructor(value: string) {
    this.normalized = value.replace(/\D/g, "");
  }

  format() {
    const digits = this.normalized.slice(0, 18);

    if (digits.length <= 3) return digits;
    if (digits.length <= 16) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

    return `${digits.slice(0, 3)}-${digits.slice(3, 16)}-${digits.slice(16)}`;
  }

  isValid() {
    if (this.normalized.length !== 18) return false;

    let remainder = 0;
    for (const digit of `${this.normalized.slice(0, 16)}00`) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }

    return (
      this.normalized.slice(-2) === String(98 - remainder).padStart(2, "0")
    );
  }

  equals(other: AccountNumber | string) {
    const normalizedOther =
      typeof other === "string" ? new AccountNumber(other).normalized : other.normalized;
    return this.normalized === normalizedOther;
  }

  isFonAccount(currency: "RSD" | "EUR") {
    return (
      this.isValid() &&
      this.normalized.startsWith(FON_BANK_CODE) &&
      this.normalized.slice(3, 5) === CURRENCY_MARKERS[currency]
    );
  }

  toString() {
    return this.normalized;
  }
}

export function formatIban(value: string) {
  return value.replace(/\s/g, "").match(/.{1,4}/g)?.join(" ") ?? value;
}
