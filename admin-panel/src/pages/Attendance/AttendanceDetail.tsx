import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { MapComponent } from '../../components/Map/MapComponent';
import { attendanceService } from '../../services/attendanceService';
import type { Attendance } from '../../types';
import { format } from 'date-fns';

export const AttendanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAttendance();
    }
  }, [id]);

  const loadAttendance = async () => {
    try {
      const data = await attendanceService.getAttendanceById(id!);
      setAttendance(data);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!attendance) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Attendance record not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attendance Details
          </h1>
          <Button variant="secondary" onClick={() => navigate('/attendance')}>
            Back to List
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Attendance Information">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guard</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {attendance.guard?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {attendance.location?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(attendance.checkInTime), 'MMMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Check In Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(attendance.checkInTime), 'HH:mm:ss')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Check Out Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {attendance.checkOutTime
                    ? format(new Date(attendance.checkOutTime), 'HH:mm:ss')
                    : 'Not checked out yet'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    attendance.status === 'CHECKED_IN'
                      ? 'bg-blue-100 text-blue-800'
                      : attendance.status === 'CHECKED_OUT'
                      ? 'bg-green-100 text-green-800'
                      : attendance.status === 'LATE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {attendance.status}
                </span>
              </div>
              {attendance.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {attendance.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Location Map">
            <MapComponent
              center={{
                lat: attendance.checkInLatitude,
                lng: attendance.checkInLongitude,
              }}
              markers={[
                {
                  lat: attendance.checkInLatitude,
                  lng: attendance.checkInLongitude,
                  label: 'Check In',
                },
                ...(attendance.checkOutLatitude && attendance.checkOutLongitude
                  ? [
                      {
                        lat: attendance.checkOutLatitude,
                        lng: attendance.checkOutLongitude,
                        label: 'Check Out',
                      },
                    ]
                  : []),
              ]}
              height="400px"
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {attendance.checkInSelfie && (
            <Card title="Check In Selfie">
              <img
                src={attendance.checkInSelfie}
                alt="Check In Selfie"
                className="w-full rounded-lg"
              />
            </Card>
          )}
          {attendance.checkOutSelfie && (
            <Card title="Check Out Selfie">
              <img
                src={attendance.checkOutSelfie}
                alt="Check Out Selfie"
                className="w-full rounded-lg"
              />
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};
