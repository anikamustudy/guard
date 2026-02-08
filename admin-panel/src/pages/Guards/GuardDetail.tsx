import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Table } from '../../components/Common/Table';
import { userService } from '../../services/userService';
import { attendanceService } from '../../services/attendanceService';
import type { Guard, Attendance, PaginatedResponse } from '../../types';
import { format } from 'date-fns';

export const GuardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guard, setGuard] = useState<Guard | null>(null);
  const [attendance, setAttendance] = useState<PaginatedResponse<Attendance>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGuardData();
    }
  }, [id]);

  const loadGuardData = async () => {
    try {
      const [guardData, attendanceData] = await Promise.all([
        userService.getGuardById(id!),
        attendanceService.getAttendanceByGuard(id!, { page: 1, limit: 10 }),
      ]);
      setGuard(guardData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Failed to load guard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (att: Attendance) => format(new Date(att.checkInTime), 'MMM dd, yyyy'),
    },
    {
      key: 'location',
      header: 'Location',
      render: (att: Attendance) => att.location?.name || 'N/A',
    },
    {
      key: 'checkIn',
      header: 'Check In',
      render: (att: Attendance) => format(new Date(att.checkInTime), 'HH:mm'),
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      render: (att: Attendance) =>
        att.checkOutTime ? format(new Date(att.checkOutTime), 'HH:mm') : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (att: Attendance) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            att.status === 'CHECKED_IN'
              ? 'bg-blue-100 text-blue-800'
              : att.status === 'CHECKED_OUT'
              ? 'bg-green-100 text-green-800'
              : att.status === 'LATE'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {att.status}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!guard) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Guard not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guard Details</h1>
          <Button variant="secondary" onClick={() => navigate('/guards')}>
            Back to List
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Personal Information">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{guard.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
                <p className="font-medium text-gray-900 dark:text-white">{guard.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{guard.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{guard.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    guard.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {guard.status}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Statistics" className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{attendance.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Attendance</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {attendance.data.filter((a) => a.status === 'CHECKED_OUT').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {attendance.data.filter((a) => a.status === 'LATE').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Late</p>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Attendance History">
          <Table data={attendance.data} columns={columns} isLoading={false} />
        </Card>
      </div>
    </Layout>
  );
};
