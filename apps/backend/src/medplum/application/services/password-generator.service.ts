import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordGeneratorService {
  private readonly DIGITS = '0123456789';
  private readonly LOWER = 'abcdefghijklmnopqrstuvwxyz';
  private readonly UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly SPECIAL = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  private readonly ALL: string;

  constructor() {
    this.ALL = this.DIGITS + this.LOWER + this.UPPER + this.SPECIAL;
  }

  private pick(charset: string, count: number): string[] {
    const chars: string[] = [];
    for (let i = 0; i < count; i++) {
      chars.push(charset[Math.floor(Math.random() * charset.length)]);
    }
    return chars;
  }

  /** Fisher-Yates shuffle */
  private shuffle(arr: string[]): string[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Generates a 16-character password containing:
   * - at least 2 digits
   * - at least 2 lowercase letters
   * - at least 2 uppercase letters
   * - at least 2 special characters
   * The characters are shuffled (transmuted) after assembly.
   */
  generate(): string {
    const mandatory: string[] = [
      ...this.pick(this.DIGITS, 2),
      ...this.pick(this.LOWER, 2),
      ...this.pick(this.UPPER, 2),
      ...this.pick(this.SPECIAL, 2),
    ];

    // Fill remaining 8 characters from the full charset
    const remaining = this.pick(this.ALL, 16 - mandatory.length);

    const password = this.shuffle([...mandatory, ...remaining]);
    return password.join('');
  }
}
