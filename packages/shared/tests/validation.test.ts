import { describe, it, expect } from 'vitest';
import {
  validatePrice,
  validateTableNumber,
  validateRequiredString,
  validateQuantity,
  priceSchema,
  tableNumberSchema,
  quantitySchema,
  requiredStringSchema,
} from '../src/utils/validation';

describe('Shared Validation Utilities', () => {
  describe('validatePrice', () => {
    it('accepts valid prices', () => {
      expect(validatePrice('10').valid).toBe(true);
      expect(validatePrice('10.99').valid).toBe(true);
      expect(validatePrice('0.01').valid).toBe(true);
      expect(validatePrice('100').valid).toBe(true);
    });

    it('rejects zero and negative prices', () => {
      expect(validatePrice('0').valid).toBe(false);
      expect(validatePrice('-5').valid).toBe(false);
      expect(validatePrice('-0.01').valid).toBe(false);
    });

    it('rejects prices with more than 2 decimal places', () => {
      const result = validatePrice('10.999');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2 decimal places');
    });

    it('rejects empty or invalid strings', () => {
      expect(validatePrice('').valid).toBe(false);
      expect(validatePrice('abc').valid).toBe(false);
      expect(validatePrice('$10').valid).toBe(false);
    });

    it('returns parsed value for valid prices', () => {
      const result = validatePrice('10.50');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(10.50);
    });
  });

  describe('validateTableNumber', () => {
    it('accepts valid table numbers', () => {
      expect(validateTableNumber('1').valid).toBe(true);
      expect(validateTableNumber('10').valid).toBe(true);
      expect(validateTableNumber(5).valid).toBe(true);
    });

    it('rejects zero and negative numbers', () => {
      expect(validateTableNumber('0').valid).toBe(false);
      expect(validateTableNumber('-1').valid).toBe(false);
      expect(validateTableNumber(-5).valid).toBe(false);
    });

    it('rejects decimal numbers', () => {
      expect(validateTableNumber('1.5').valid).toBe(false);
    });

    it('rejects non-numeric strings', () => {
      expect(validateTableNumber('abc').valid).toBe(false);
      expect(validateTableNumber('').valid).toBe(false);
    });

    it('returns parsed value for valid table numbers', () => {
      const result = validateTableNumber('5');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(5);
    });
  });

  describe('validateRequiredString', () => {
    it('accepts non-empty strings', () => {
      expect(validateRequiredString('test', 'Name').valid).toBe(true);
      expect(validateRequiredString('John Doe', 'Name').valid).toBe(true);
    });

    it('rejects empty strings', () => {
      const result = validateRequiredString('', 'Name');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Name');
    });

    it('rejects whitespace-only strings', () => {
      const result = validateRequiredString('   ', 'Server name');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Server name');
    });

    it('uses custom field name in error message', () => {
      const result = validateRequiredString('', 'Email');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Email');
    });
  });

  describe('validateQuantity', () => {
    it('accepts positive integers', () => {
      expect(validateQuantity(1).valid).toBe(true);
      expect(validateQuantity(10).valid).toBe(true);
      expect(validateQuantity(100).valid).toBe(true);
    });

    it('rejects zero and negative numbers', () => {
      expect(validateQuantity(0).valid).toBe(false);
      expect(validateQuantity(-1).valid).toBe(false);
      expect(validateQuantity(-5).valid).toBe(false);
    });

    it('rejects decimal numbers', () => {
      expect(validateQuantity(1.5).valid).toBe(false);
      expect(validateQuantity(0.5).valid).toBe(false);
    });
  });

  describe('Zod schemas', () => {
    describe('priceSchema', () => {
      it('validates prices correctly', () => {
        expect(priceSchema.safeParse(10.99).success).toBe(true);
        expect(priceSchema.safeParse(0).success).toBe(false);
        expect(priceSchema.safeParse(-5).success).toBe(false);
      });
    });

    describe('tableNumberSchema', () => {
      it('validates table numbers correctly', () => {
        expect(tableNumberSchema.safeParse(1).success).toBe(true);
        expect(tableNumberSchema.safeParse(10).success).toBe(true);
        expect(tableNumberSchema.safeParse(0).success).toBe(false);
        expect(tableNumberSchema.safeParse(-1).success).toBe(false);
        expect(tableNumberSchema.safeParse(1.5).success).toBe(false);
      });
    });

    describe('quantitySchema', () => {
      it('validates quantities correctly', () => {
        expect(quantitySchema.safeParse(1).success).toBe(true);
        expect(quantitySchema.safeParse(100).success).toBe(true);
        expect(quantitySchema.safeParse(0).success).toBe(false);
        expect(quantitySchema.safeParse(-1).success).toBe(false);
        expect(quantitySchema.safeParse(1.5).success).toBe(false);
      });
    });

    describe('requiredStringSchema', () => {
      it('validates required strings correctly', () => {
        const schema = requiredStringSchema('Field');
        expect(schema.safeParse('test').success).toBe(true);
        expect(schema.safeParse('').success).toBe(false);
        expect(schema.safeParse('   ').success).toBe(false);
      });
    });
  });
});
