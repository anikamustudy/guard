import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/Common/Card';
import { Table } from '../../components/Common/Table';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Select } from '../../components/Common/Select';
import { attendanceService } from '../../services/attendanceService';
import type { Attendance, PaginatedResponse } from '../../types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const AttendanceList: React.FC = () => {
  const [attendance, setAttendance] = useState<PaginatedResponse<Attendance>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    search: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadAttendance();
  }, [attendance.page, filters]);

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const data = await attendanceService.getAttendances({
        page: attendance.page,
        limit: attendance.limit,
        ...filters,
      });
      setAttendance(data);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await attendanceService.exportAttendance(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export attendance:', error);
    }
  };

  const columns = [
    {
      key: 'guard',
      header: 'Guard',
      render: (att: Attendance) => att.guard?.name || 'N/A',
    },
    {
      key: 'location',
      header: 'Location',
      render: (att: Attendance) => att.location?.name || 'N/A',
    },
    {
      key: 'date',
      header: 'Date',
      render: (att: Attendance) => format(new Date(att.checkInTime), 'MMM dd, yyyy'),
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
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : att.status === 'CHECKED_OUT'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : att.status === 'LATE'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {att.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (att: Attendance) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate(`/attendance/${att.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={handleExport}>
              Export CSV
            </Button>
            <Button onClick={() => navigate('/attendance/reports')}>
              View Reports
            </Button>
          </div>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              type="date"
              label="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <Input
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: '', label: 'All Status' },
                { value: 'CHECKED_IN', label: 'Checked In' },
                { value: 'CHECKED_OUT', label: 'Checked Out' },
                { value: 'LATE', label: 'Late' },
                { value: 'ABSENT', label: 'Absent' },
              ]}
            />
            <Input
              label="Search"
              placeholder="Search guard..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <Table data={attendance.data} columns={columns} isLoading={isLoading} />
        </Card>
      </div>
    </Layout>
  );
};
