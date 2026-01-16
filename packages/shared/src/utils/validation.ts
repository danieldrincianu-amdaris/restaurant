/**
 * Shared validation utilities using Zod for type-safe validation
 * across frontend and backend
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */

// Table number: must be positive integer
export const tableNumberSchema = z.number().positive({
  message: 'Table number must be a positive integer',
}).int({
  message: 'Table number must be a whole number',
});

// Price: must be positive number with max 2 decimal places
export const priceSchema = z.number().positive({
  message: 'Price must be greater than 0',
}).refine(
  (val: number) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
  { message: 'Price must have at most 2 decimal places' }
);

// Non-empty string (trim before checking length)
export const requiredStringSchema = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

// Optional string (nullable or empty becomes undefined)
export const optionalStringSchema = z.string().optional().nullable().transform(
  (val: string | null | undefined) => val?.trim() || undefined
);

// Positive quantity
export const quantitySchema = z.number().int().positive({
  message: 'Quantity must be a positive integer',
});

/**
 * Validation helper functions for frontend forms
 */

export interface ValidationErrors {
  [key: string]: string | undefined;
}

/**
 * Validate price from string input (for form fields)
 */
export function validatePrice(priceStr: string): { valid: boolean; error?: string; value?: number } {
  if (!priceStr || priceStr.trim() === '') {
    return { valid: false, error: 'Price is required' };
  }

  const price = parseFloat(priceStr);
  
  if (isNaN(price)) {
    return { valid: false, error: 'Price must be a number' };
  }

  const result = priceSchema.safeParse(price);
  
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message || 'Invalid price' };
  }

  return { valid: true, value: price };
}

/**
 * Validate table number from string input (for form fields)
 */
export function validateTableNumber(tableStr: string | number): { valid: boolean; error?: string; value?: number } {
  let table: number;
  
  if (typeof tableStr === 'string') {
    // Check if string contains decimal point before parsing
    if (tableStr.includes('.')) {
      return { valid: false, error: 'Table number must be a whole number' };
    }
    table = parseInt(tableStr, 10);
  } else {
    table = tableStr;
  }
  
  if (isNaN(table)) {
    return { valid: false, error: 'Table number must be a number' };
  }

  const result = tableNumberSchema.safeParse(table);
  
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message || 'Invalid table number' };
  }

  return { valid: true, value: table };
}

/**
 * Validate required string field
 */
export function validateRequiredString(value: string, fieldName: string): { valid: boolean; error?: string } {
  const result = requiredStringSchema(fieldName).safeParse(value);
  
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message || `${fieldName} is required` };
  }

  return { valid: true };
}

/**
 * Validate quantity
 */
export function validateQuantity(qty: number): { valid: boolean; error?: string } {
  const result = quantitySchema.safeParse(qty);
  
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message || 'Invalid quantity' };
  }

  return { valid: true };
}
