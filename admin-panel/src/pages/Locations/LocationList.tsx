import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/Common/Card';
import { Table } from '../../components/Common/Table';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Modal } from '../../components/Common/Modal';
import { MapComponent } from '../../components/Map/MapComponent';
import { locationService } from '../../services/locationService';
import type { Location, PaginatedResponse } from '../../types';

export const LocationList: React.FC = () => {
  const [locations, setLocations] = useState<PaginatedResponse<Location>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Partial<Location> | null>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const data = await locationService.getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        await locationService.deleteLocation(id);
        loadLocations();
      } catch (error) {
        console.error('Failed to delete location:', error);
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'address', header: 'Address' },
    {
      key: 'coordinates',
      header: 'Coordinates',
      render: (loc: Location) => `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`,
    },
    {
      key: 'radius',
      header: 'Radius',
      render: (loc: Location) => `${loc.radius}m`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (loc: Location) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            loc.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {loc.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (loc: Location) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setCurrentLocation(loc);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(loc.id)}>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Locations</h1>
          <Button
            onClick={() => {
              setCurrentLocation(null);
              setIsModalOpen(true);
            }}
          >
            Add Location
          </Button>
        </div>

        <Card title="All Locations Map" className="h-96">
          <MapComponent
            markers={locations.data.map((loc) => ({
              lat: loc.latitude,
              lng: loc.longitude,
              label: loc.name,
              info: `<strong>${loc.name}</strong><br/>${loc.address}`,
            }))}
            height="320px"
          />
        </Card>

        <Card>
          <Table data={locations.data} columns={columns} isLoading={isLoading} />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentLocation ? 'Edit Location' : 'Add Location'}
        size="lg"
      >
        <LocationForm
          location={currentLocation}
          onClose={() => {
            setIsModalOpen(false);
            loadLocations();
          }}
        />
      </Modal>
    </Layout>
  );
};

const LocationForm: React.FC<{
  location: Partial<Location> | null;
  onClose: () => void;
}> = ({ location, onClose }) => {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    address: location?.address || '',
    latitude: location?.latitude || 40.7128,
    longitude: location?.longitude || -74.006,
    radius: location?.radius || 100,
    status: location?.status || 'ACTIVE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMapClick = (lat: number, lng: number) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (location?.id) {
        await locationService.updateLocation(location.id, formData);
      } else {
        await locationService.createLocation(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save location:', error);
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
        label="Address"
        required
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Latitude"
          type="number"
          step="any"
          required
          value={formData.latitude}
          onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          required
          value={formData.longitude}
          onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
        />
      </div>
      <Input
        label="Radius (meters)"
        type="number"
        required
        value={formData.radius}
        onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Click on map to set location
        </label>
        <MapComponent
          center={{ lat: formData.latitude, lng: formData.longitude }}
          markers={[{ lat: formData.latitude, lng: formData.longitude }]}
          onMapClick={handleMapClick}
          height="300px"
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {location ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
