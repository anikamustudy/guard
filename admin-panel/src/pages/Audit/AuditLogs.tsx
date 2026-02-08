import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/Common/Card';
import { Table } from '../../components/Common/Table';
import { Input } from '../../components/Common/Input';
import { Select } from '../../components/Common/Select';
import { auditService } from '../../services/auditService';
import type { AuditLog, PaginatedResponse } from '../../types';
import { format } from 'date-fns';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<PaginatedResponse<AuditLog>>({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    entity: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadAuditLogs();
  }, [logs.page, filters]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await auditService.getAuditLogs({
        page: logs.page,
        limit: logs.limit,
        ...filters,
      });
      setLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (log: AuditLog) => format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss'),
    },
    {
      key: 'user',
      header: 'User',
      render: (log: AuditLog) => log.user?.name || 'System',
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: AuditLog) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            log.action.includes('CREATE')
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : log.action.includes('UPDATE')
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : log.action.includes('DELETE')
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}
        >
          {log.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Entity',
      render: (log: AuditLog) => `${log.entity} (${log.entityId})`,
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (log: AuditLog) => log.ipAddress || 'N/A',
    },
    {
      key: 'changes',
      header: 'Changes',
      render: (log: AuditLog) => (
        <button
          onClick={() => alert(JSON.stringify(log.changes, null, 2))}
          className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              label="Search"
              placeholder="Search by user or entity..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              label="Entity Type"
              value={filters.entity}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
              options={[
                { value: '', label: 'All Entities' },
                { value: 'USER', label: 'Users' },
                { value: 'LOCATION', label: 'Locations' },
                { value: 'SHIFT', label: 'Shifts' },
                { value: 'ATTENDANCE', label: 'Attendance' },
                { value: 'EMERGENCY', label: 'Emergencies' },
              ]}
            />
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
          </div>

          <Table data={logs.data} columns={columns} isLoading={isLoading} />
        </Card>
      </div>
    </Layout>
  );
};
