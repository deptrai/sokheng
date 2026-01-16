import { isRestaurantOpen } from '../getTimesTillMidnight';

describe('isRestaurantOpen', () => {
    // Helper to create a date with specific time
    const createDate = (hours: number, minutes: number = 0) => {
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    describe('Normal working hours (same day)', () => {
        it('should return true when restaurant is open (current time within working hours)', () => {
            const currentTime = createDate(12, 0); // 12:00 PM
            const result = isRestaurantOpen('08:00', '22:00', currentTime);
            expect(result).toBe(true);
        });

        it('should return true at opening time', () => {
            const currentTime = createDate(8, 0); // 08:00 AM
            const result = isRestaurantOpen('08:00', '22:00', currentTime);
            expect(result).toBe(true);
        });

        it('should return true at closing time', () => {
            const currentTime = createDate(22, 0); // 10:00 PM
            const result = isRestaurantOpen('08:00', '22:00', currentTime);
            expect(result).toBe(true);
        });

        it('should return false when restaurant is closed (before opening)', () => {
            const currentTime = createDate(7, 0); // 07:00 AM
            const result = isRestaurantOpen('08:00', '22:00', currentTime);
            expect(result).toBe(false);
        });

        it('should return false when restaurant is closed (after closing)', () => {
            const currentTime = createDate(23, 0); // 11:00 PM
            const result = isRestaurantOpen('08:00', '22:00', currentTime);
            expect(result).toBe(false);
        });
    });

    describe('Overnight working hours (crosses midnight)', () => {
        it('should return true when open overnight and current time is after opening', () => {
            const currentTime = createDate(23, 0); // 11:00 PM
            const result = isRestaurantOpen('22:00', '02:00', currentTime);
            expect(result).toBe(true);
        });

        it('should return true when open overnight and current time is before closing (next day)', () => {
            const currentTime = createDate(1, 0); // 01:00 AM
            const result = isRestaurantOpen('22:00', '02:00', currentTime);
            expect(result).toBe(true);
        });

        it('should return false when open overnight but current time is in closed period', () => {
            const currentTime = createDate(12, 0); // 12:00 PM
            const result = isRestaurantOpen('22:00', '02:00', currentTime);
            expect(result).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('should return false when openTime is undefined', () => {
            const currentTime = createDate(12, 0);
            const result = isRestaurantOpen(undefined, '22:00', currentTime);
            expect(result).toBe(false);
        });

        it('should return false when closeTime is undefined', () => {
            const currentTime = createDate(12, 0);
            const result = isRestaurantOpen('08:00', undefined, currentTime);
            expect(result).toBe(false);
        });

        it('should return false when both times are undefined', () => {
            const currentTime = createDate(12, 0);
            const result = isRestaurantOpen(undefined, undefined, currentTime);
            expect(result).toBe(false);
        });

        it('should handle single-digit hour format', () => {
            const currentTime = createDate(9, 30); // 09:30 AM
            const result = isRestaurantOpen('9:00', '17:00', currentTime);
            expect(result).toBe(true);
        });

        it('should use current time when currentDate is not provided', () => {
            // This test will pass if current time is within 08:00-22:00
            // We just verify it doesn't throw an error
            const result = isRestaurantOpen('08:00', '22:00');
            expect(typeof result).toBe('boolean');
        });
    });

    describe('Real-world scenarios', () => {
        it('should work for Sokheng restaurant hours (08:00 - 22:00)', () => {
            // During lunch time
            expect(isRestaurantOpen('08:00', '22:00', createDate(13, 0))).toBe(true);

            // Early morning (closed)
            expect(isRestaurantOpen('08:00', '22:00', createDate(6, 0))).toBe(false);

            // Late night (closed)
            expect(isRestaurantOpen('08:00', '22:00', createDate(23, 30))).toBe(false);
        });

        it('should work for 24-hour restaurants', () => {
            const currentTime = createDate(3, 0); // 03:00 AM
            const result = isRestaurantOpen('00:00', '23:59', currentTime);
            expect(result).toBe(true);
        });

        it('should handle exact boundary times', () => {
            // At exact opening time
            expect(isRestaurantOpen('09:00', '17:00', createDate(9, 0))).toBe(true);

            // At exact closing time
            expect(isRestaurantOpen('09:00', '17:00', createDate(17, 0))).toBe(true);

            // One minute before opening
            expect(isRestaurantOpen('09:00', '17:00', createDate(8, 59))).toBe(false);

            // One minute after closing
            expect(isRestaurantOpen('09:00', '17:00', createDate(17, 1))).toBe(false);
        });
    });
});
