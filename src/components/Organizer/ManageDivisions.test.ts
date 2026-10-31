import { describe, expect, it } from 'vitest';
import { buildRouteSearch } from './ManageDivisions';

describe('buildRouteSearch', () => {
  it('removes all filter params when filters are cleared', () => {
    const currentSearch = {
      pageSize: 20,
      fullName: 'Alice',
      eventName: ['Kata'],
      participantGender: ['Male'],
    };

    expect(buildRouteSearch(currentSearch, {})).toEqual({ pageSize: 20 });
  });

  it('preserves page size while updating filter values', () => {
    const currentSearch = {
      pageSize: 20,
      fullName: 'Alice',
      eventName: ['Kata'],
    };

    expect(buildRouteSearch(currentSearch, { eventName: ['Kumite'] })).toEqual({
      pageSize: 20,
      eventName: ['Kumite'],
    });
  });
});
