import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/Common/Card';
import { Table } from '../../components/Common/Table';
import { Button } from '../../components/Common/Button';
import { MapComponent } from '../../components/Map/MapComponent';
import { emergencyService } from '../../services/emergencyService';
import type { Emergency, PaginatedResponse } from '../../types';
import { format } from 'date-fns';

export const EmergencyList: React.FC = () => {
  const [emergencies, setEmergencies] = useState<PaginatedResponse<Emergency>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [activeEmergencies, setActiveEmergencies] = useState<Emergency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmergencies();
    const interval = setInterval(loadActiveEmergencies, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadEmergencies = async () => {
    setIsLoading(true);
    try {
      const [data, active] = await Promise.all([
        emergencyService.getEmergencies({ page: 1, limit: 10 }),
        emergencyService.getActiveEmergencies(),
      ]);
      setEmergencies(data);
      setActiveEmergencies(active);
    } catch (error) {
      console.error('Failed to load emergencies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveEmergencies = async () => {
    try {
      const active = await emergencyService.getActiveEmergencies();
      setActiveEmergencies(active);
    } catch (error) {
      console.error('Failed to load active emergencies:', error);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await emergencyService.acknowledgeEmergency(id);
      loadEmergencies();
    } catch (error) {
      console.error('Failed to acknowledge emergency:', error);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await emergencyService.resolveEmergency(id);
      loadEmergencies();
    } catch (error) {
      console.error('Failed to resolve emergency:', error);
    }
  };

  const columns = [
    {
      key: 'guard',
      header: 'Guard',
      render: (em: Emergency) => em.guard?.name || 'N/A',
    },
    {
      key: 'location',
      header: 'Location',
      render: (em: Emergency) => em.location?.name || 'N/A',
    },
    {
      key: 'type',
      header: 'Type',
      render: (em: Emergency) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            em.type === 'PANIC'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : em.type === 'MEDICAL'
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              : em.type === 'SECURITY'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}
        >
          {em.type}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (em: Emergency) => (
        <span className="max-w-xs truncate block">{em.description}</span>
      ),
    },
    {
      key: 'time',
      header: 'Time',
      render: (em: Emergency) => format(new Date(em.createdAt), 'MMM dd, HH:mm'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (em: Emergency) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            em.status === 'ACTIVE'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : em.status === 'ACKNOWLEDGED'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}
        >
          {em.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (em: Emergency) => (
        <div className="flex space-x-2">
          {em.status === 'ACTIVE' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAcknowledge(em.id)}
            >
              Acknowledge
            </Button>
          )}
          {em.status === 'ACKNOWLEDGED' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleResolve(em.id)}
            >
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Emergency Alerts
          </h1>
          {activeEmergencies.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 dark:text-red-400 font-medium">
                {activeEmergencies.length} Active Alert{activeEmergencies.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {activeEmergencies.length > 0 && (
          <Card title="Active Emergencies - Live Map" className="border-2 border-red-500">
            <MapComponent
              markers={activeEmergencies.map((em) => ({
                lat: em.latitude,
                lng: em.longitude,
                label: em.type,
                info: `<strong>${em.type}</strong><br/>${em.guard?.name}<br/>${em.description}`,
              }))}
              height="400px"
            />
          </Card>
        )}

        <Card title="All Emergency Alerts">
          <Table data={emergencies.data} columns={columns} isLoading={isLoading} />
        </Card>
      </div>
    </Layout>
  );
};
