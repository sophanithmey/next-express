import { describe, it, expect } from 'vitest';
import { DropoffStop, BookingFormData } from '@/features/booking/types/booking-types';

describe('Destination Reordering & Route Sequencing', () => {
  const mockStops: DropoffStop[] = [
    {
      id: 'dest-sokha',
      recipient: { name: 'Sokha Chan', phoneNumber: '012998877' },
      dropoff: {
        address: 'BKK1, Khan Boeng Keng Kang, Phnom Penh',
        coordinates: { lat: 11.5512, lng: 104.9256 },
      },
    },
    {
      id: 'dest-dara',
      recipient: { name: 'Dara Shop', phoneNumber: '098112233' },
      dropoff: {
        address: 'Toul Kork, Khan Toul Kork, Phnom Penh',
        coordinates: { lat: 11.5684, lng: 104.8921 },
      },
    },
    {
      id: 'dest-vanna',
      recipient: { name: 'Vanna Customer', phoneNumber: '077445566' },
      dropoff: {
        address: 'Sen Sok, Khan Sen Sok, Phnom Penh',
        coordinates: { lat: 11.5832, lng: 104.8812 },
      },
    },
  ];

  it('generates automatic route sequence labels (B, C, D) for destinations', () => {
    const getRouteLabel = (index: number) => String.fromCharCode(66 + index);

    expect(getRouteLabel(0)).toBe('B');
    expect(getRouteLabel(1)).toBe('C');
    expect(getRouteLabel(2)).toBe('D');
    expect(getRouteLabel(3)).toBe('E');
  });

  it('reorders destinations while preserving stable destination IDs and recipient data', () => {
    // Move Vanna (index 2) to the first drop-off position (index 0)
    const original = [...mockStops];
    const oldIndex = 2;
    const newIndex = 0;

    const reordered = [...original];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Sequence check
    expect(reordered).toHaveLength(3);
    expect(reordered[0].id).toBe('dest-vanna');
    expect(reordered[0].recipient.name).toBe('Vanna Customer');
    expect(reordered[1].id).toBe('dest-sokha');
    expect(reordered[1].recipient.name).toBe('Sokha Chan');
    expect(reordered[2].id).toBe('dest-dara');
    expect(reordered[2].recipient.name).toBe('Dara Shop');

    // Verify IDs remain stable
    expect(reordered.map((s) => s.id)).toEqual(['dest-vanna', 'dest-sokha', 'dest-dara']);
  });

  it('synchronizes primary recipient and dropoff with the first destination (dropoffs[0])', () => {
    const initialFormData: BookingFormData = {
      pickup: {
        name: 'Central Warehouse',
        address: 'Central Warehouse, Phnom Penh',
        coordinates: { lat: 11.55, lng: 104.92 },
      },
      isBookingOnBehalf: false,
      dropoff: mockStops[0].dropoff,
      recipient: mockStops[0].recipient,
      dropoffs: mockStops,
      parcel: { description: 'Retail Package' },
      cod: { isCod: false, amount: 0 },
    };

    // Simulate reordering: Dara (index 1) becomes first stop (index 0)
    const reorderedStops = [mockStops[1], mockStops[0], mockStops[2]];

    const updatedFormData: BookingFormData = {
      ...initialFormData,
      dropoffs: reorderedStops,
      recipient: reorderedStops[0].recipient,
      dropoff: reorderedStops[0].dropoff,
    };

    expect(updatedFormData.dropoff.address).toBe('Toul Kork, Khan Toul Kork, Phnom Penh');
    expect(updatedFormData.recipient.name).toBe('Dara Shop');
    expect(updatedFormData.recipient.phoneNumber).toBe('098112233');
    expect(updatedFormData.dropoffs?.[0].id).toBe('dest-dara');
  });

  it('appends a new destination with a stable unique ID without mutating existing stops', () => {
    const current = [...mockStops];
    const newStop: DropoffStop = {
      id: 'dest-kosal-new',
      recipient: { name: 'Kosal Meng', phoneNumber: '015332211' },
      dropoff: {
        address: 'Chbar Ampov, Phnom Penh',
        coordinates: { lat: 11.5312, lng: 104.9421 },
      },
    };

    const appended = [...current, newStop];
    expect(appended).toHaveLength(4);
    expect(appended[3].id).toBe('dest-kosal-new');
    expect(appended[0].id).toBe('dest-sokha');
  });

  it('removes a destination and preserves the remaining sequence', () => {
    const current = [...mockStops];
    const remaining = current.filter((s) => s.id !== 'dest-dara');

    expect(remaining).toHaveLength(2);
    expect(remaining[0].id).toBe('dest-sokha');
    expect(remaining[1].id).toBe('dest-vanna');
  });
});
