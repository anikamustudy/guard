import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/Common/Card';
import { Table } from '../../components/Common/Table';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Pagination } from '../../components/Common/Pagination';
import { Modal } from '../../components/Common/Modal';
import { Select } from '../../components/Common/Select';
import { userService } from '../../services/userService';
import type { Guard, PaginatedResponse } from '../../types';
import { useNavigate } from 'react-router-dom';

export const GuardList: React.FC = () => {
  const [guards, setGuards] = useState<PaginatedResponse<Guard>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGuard, setCurrentGuard] = useState<Partial<Guard> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadGuards();
  }, [guards.page, search, statusFilter]);

  const loadGuards = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getGuards({
        page: guards.page,
        limit: guards.limit,
        search,
        status: statusFilter,
      });
      setGuards(data);
    } catch (error) {
      console.error('Failed to load guards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'employeeId',
      header: 'Employee ID',
    },
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'status',
      header: 'Status',
      render: (guard: Guard) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            guard.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : guard.status === 'INACTIVE'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}
        >
          {guard.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (guard: Guard) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/guards/${guard.id}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setCurrentGuard(guard);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guards</h1>
          <Button onClick={() => {
            setCurrentGuard(null);
            setIsModalOpen(true);
          }}>
            Add Guard
          </Button>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'ON_LEAVE', label: 'On Leave' },
              ]}
              placeholder="Filter by status"
            />
          </div>

          <Table data={guards.data} columns={columns} isLoading={isLoading} />
          
          {guards.totalPages > 1 && (
            <Pagination
              currentPage={guards.page}
              totalPages={guards.totalPages}
              totalItems={guards.total}
              itemsPerPage={guards.limit}
              onPageChange={(page) => setGuards({ ...guards, page })}
            />
          )}
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentGuard ? 'Edit Guard' : 'Add Guard'}
      >
        <GuardForm
          guard={currentGuard}
          onClose={() => {
            setIsModalOpen(false);
            loadGuards();
          }}
        />
      </Modal>
    </Layout>
  );
};

const GuardForm: React.FC<{ guard: Partial<Guard> | null; onClose: () => void }> = ({
  guard,
  onClose,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    status: string;
    password: string;
  }>({
    name: guard?.name || '',
    email: guard?.email || '',
    phone: guard?.phone || '',
    employeeId: guard?.employeeId || '',
    status: guard?.status || 'ACTIVE',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (guard?.id) {
        await userService.updateUser(guard.id, formData);
      } else {
        await userService.createUser({ ...formData, role: 'GUARD' });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save guard:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        label="Email"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Input
        label="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <Input
        label="Employee ID"
        required
        value={formData.employeeId}
        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
      />
      {!guard && (
        <Input
          label="Password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      )}
      <Select
        label="Status"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        options={[
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
          { value: 'ON_LEAVE', label: 'On Leave' },
        ]}
      />
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {guard ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
