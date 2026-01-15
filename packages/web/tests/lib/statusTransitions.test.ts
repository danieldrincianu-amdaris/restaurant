import { describe, it, expect } from 'vitest';
import { OrderStatus } from '@restaurant/shared';
import {
  isValidTransition,
  getValidTargetStatuses,
  STATUS_TRANSITIONS,
} from '../../src/lib/statusTransitions';

describe('statusTransitions', () => {
  describe('STATUS_TRANSITIONS constant', () => {
    it('should define valid transitions for PENDING', () => {
      expect(STATUS_TRANSITIONS[OrderStatus.PENDING]).toEqual([
        OrderStatus.IN_PROGRESS,
        OrderStatus.CANCELED,
      ]);
    });

    it('should define valid transitions for IN_PROGRESS', () => {
      expect(STATUS_TRANSITIONS[OrderStatus.IN_PROGRESS]).toEqual([
        OrderStatus.COMPLETED,
        OrderStatus.HALTED,
        OrderStatus.CANCELED,
      ]);
    });

    it('should define valid transitions for HALTED', () => {
      expect(STATUS_TRANSITIONS[OrderStatus.HALTED]).toEqual([
        OrderStatus.IN_PROGRESS,
        OrderStatus.CANCELED,
      ]);
    });

    it('should have no transitions for COMPLETED (terminal state)', () => {
      expect(STATUS_TRANSITIONS[OrderStatus.COMPLETED]).toEqual([]);
    });

    it('should have no transitions for CANCELED (terminal state)', () => {
      expect(STATUS_TRANSITIONS[OrderStatus.CANCELED]).toEqual([]);
    });
  });

  describe('isValidTransition', () => {
    it('should return true for PENDING → IN_PROGRESS', () => {
      expect(isValidTransition(OrderStatus.PENDING, OrderStatus.IN_PROGRESS)).toBe(true);
    });

    it('should return true for PENDING → CANCELED', () => {
      expect(isValidTransition(OrderStatus.PENDING, OrderStatus.CANCELED)).toBe(true);
    });

    it('should return false for PENDING → COMPLETED', () => {
      expect(isValidTransition(OrderStatus.PENDING, OrderStatus.COMPLETED)).toBe(false);
    });

    it('should return false for PENDING → HALTED', () => {
      expect(isValidTransition(OrderStatus.PENDING, OrderStatus.HALTED)).toBe(false);
    });

    it('should return true for IN_PROGRESS → COMPLETED', () => {
      expect(isValidTransition(OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED)).toBe(true);
    });

    it('should return true for IN_PROGRESS → HALTED', () => {
      expect(isValidTransition(OrderStatus.IN_PROGRESS, OrderStatus.HALTED)).toBe(true);
    });

    it('should return true for IN_PROGRESS → CANCELED', () => {
      expect(isValidTransition(OrderStatus.IN_PROGRESS, OrderStatus.CANCELED)).toBe(true);
    });

    it('should return false for IN_PROGRESS → PENDING', () => {
      expect(isValidTransition(OrderStatus.IN_PROGRESS, OrderStatus.PENDING)).toBe(false);
    });

    it('should return true for HALTED → IN_PROGRESS', () => {
      expect(isValidTransition(OrderStatus.HALTED, OrderStatus.IN_PROGRESS)).toBe(true);
    });

    it('should return true for HALTED → CANCELED', () => {
      expect(isValidTransition(OrderStatus.HALTED, OrderStatus.CANCELED)).toBe(true);
    });

    it('should return false for HALTED → COMPLETED', () => {
      expect(isValidTransition(OrderStatus.HALTED, OrderStatus.COMPLETED)).toBe(false);
    });

    it('should return false for COMPLETED → any status', () => {
      expect(isValidTransition(OrderStatus.COMPLETED, OrderStatus.PENDING)).toBe(false);
      expect(isValidTransition(OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS)).toBe(false);
      expect(isValidTransition(OrderStatus.COMPLETED, OrderStatus.HALTED)).toBe(false);
      expect(isValidTransition(OrderStatus.COMPLETED, OrderStatus.CANCELED)).toBe(false);
    });

    it('should return false for CANCELED → any status', () => {
      expect(isValidTransition(OrderStatus.CANCELED, OrderStatus.PENDING)).toBe(false);
      expect(isValidTransition(OrderStatus.CANCELED, OrderStatus.IN_PROGRESS)).toBe(false);
      expect(isValidTransition(OrderStatus.CANCELED, OrderStatus.HALTED)).toBe(false);
      expect(isValidTransition(OrderStatus.CANCELED, OrderStatus.COMPLETED)).toBe(false);
    });
  });

  describe('getValidTargetStatuses', () => {
    it('should return valid targets for PENDING', () => {
      const result = getValidTargetStatuses(OrderStatus.PENDING);
      expect(result).toEqual([OrderStatus.IN_PROGRESS, OrderStatus.CANCELED]);
    });

    it('should return valid targets for IN_PROGRESS', () => {
      const result = getValidTargetStatuses(OrderStatus.IN_PROGRESS);
      expect(result).toEqual([OrderStatus.COMPLETED, OrderStatus.HALTED, OrderStatus.CANCELED]);
    });

    it('should return valid targets for HALTED', () => {
      const result = getValidTargetStatuses(OrderStatus.HALTED);
      expect(result).toEqual([OrderStatus.IN_PROGRESS, OrderStatus.CANCELED]);
    });

    it('should return empty array for COMPLETED', () => {
      const result = getValidTargetStatuses(OrderStatus.COMPLETED);
      expect(result).toEqual([]);
    });

    it('should return empty array for CANCELED', () => {
      const result = getValidTargetStatuses(OrderStatus.CANCELED);
      expect(result).toEqual([]);
    });
  });
});
