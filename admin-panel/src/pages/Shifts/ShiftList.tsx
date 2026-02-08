import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/Common/Card';
import { Table } from '../../components/Common/Table';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Select } from '../../components/Common/Select';
import { Modal } from '../../components/Common/Modal';
import { shiftService } from '../../services/shiftService';
import { userService } from '../../services/userService';
import { locationService } from '../../services/locationService';
import type { Shift, PaginatedResponse, Guard, Location } from '../../types';
import { format } from 'date-fns';

export const ShiftList: React.FC = () => {
  const [shifts, setShifts] = useState<PaginatedResponse<Shift>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [guards, setGuards] = useState<Guard[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Partial<Shift> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [shiftsData, guardsData, locationsData] = await Promise.all([
        shiftService.getShifts({ page: 1, limit: 10 }),
        userService.getGuards({ limit: 100 }),
        locationService.getAllLocations(),
      ]);
      setShifts(shiftsData);
      setGuards(guardsData.data);
      setLocations(locationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      try {
        await shiftService.deleteShift(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete shift:', error);
      }
    }
  };

  const columns = [
    {
      key: 'guard',
      header: 'Guard',
      render: (shift: Shift) => shift.guard?.name || 'N/A',
    },
    {
      key: 'location',
      header: 'Location',
      render: (shift: Shift) => shift.location?.name || 'N/A',
    },
    {
      key: 'startTime',
      header: 'Start Time',
      render: (shift: Shift) => format(new Date(shift.startTime), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'endTime',
      header: 'End Time',
      render: (shift: Shift) => format(new Date(shift.endTime), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (shift: Shift) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            shift.status === 'SCHEDULED'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : shift.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : shift.status === 'COMPLETED'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {shift.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (shift: Shift) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setCurrentShift(shift);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(shift.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shifts</h1>
          <Button
            onClick={() => {
              setCurrentShift(null);
              setIsModalOpen(true);
            }}
          >
            Add Shift
          </Button>
        </div>

        <Card>
          <Table data={shifts.data} columns={columns} isLoading={isLoading} />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentShift ? 'Edit Shift' : 'Add Shift'}
      >
        <ShiftForm
          shift={currentShift}
          guards={guards}
          locations={locations}
          onClose={() => {
            setIsModalOpen(false);
            loadData();
          }}
        />
      </Modal>
    </Layout>
  );
};

const ShiftForm: React.FC<{
  shift: Partial<Shift> | null;
  guards: Guard[];
  locations: Location[];
  onClose: () => void;
}> = ({ shift, guards, locations, onClose }) => {
  const [formData, setFormData] = useState<Partial<Shift>>({
    guardId: shift?.guardId || '',
    locationId: shift?.locationId || '',
    startTime: shift?.startTime ? format(new Date(shift.startTime), "yyyy-MM-dd'T'HH:mm") : '',
    endTime: shift?.endTime ? format(new Date(shift.endTime), "yyyy-MM-dd'T'HH:mm") : '',
    status: shift?.status || 'SCHEDULED',
    notes: shift?.notes || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (shift?.id) {
        await shiftService.updateShift(shift.id, formData);
      } else {
        await shiftService.createShift(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save shift:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Guard"
        required
        value={formData.guardId}
        onChange={(e) => setFormData({ ...formData, guardId: e.target.value })}
        options={guards.map((g) => ({ value: g.id, label: `${g.name} (${g.employeeId})` }))}
        placeholder="Select a guard"
      />
      <Select
        label="Location"
        required
        value={formData.locationId}
        onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
        options={locations.map((l) => ({ value: l.id, label: l.name }))}
        placeholder="Select a location"
      />
      <Input
        label="Start Time"
        type="datetime-local"
        required
        value={formData.startTime}
        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
      />
      <Input
        label="End Time"
        type="datetime-local"
        required
        value={formData.endTime}
        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
      />
      <Select
        label="Status"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value as Shift['status'] })}
        options={[
          { value: 'SCHEDULED', label: 'Scheduled' },
          { value: 'ACTIVE', label: 'Active' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'CANCELLED', label: 'Cancelled' },
        ]}
      />
      <Input
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {shift ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
