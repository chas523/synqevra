export class EmailAddress {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValidEmail(value)) {
      throw new Error('Invalid email address');
    }
    this.value = value;
  }
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  public getValue(): string {
    return this.value;
  }
  public equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }
}
