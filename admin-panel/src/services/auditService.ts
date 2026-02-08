import apiClient from '../config/api';
import type { AuditLog, PaginatedResponse, FilterOptions, ApiResponse } from '../types';

export const auditService = {
  getAuditLogs: async (filters?: FilterOptions): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>('/audit', {
      params: filters,
    });
    return response.data.data!;
  },

  getAuditLogById: async (id: string): Promise<AuditLog> => {
    const response = await apiClient.get<ApiResponse<AuditLog>>(`/audit/${id}`);
    return response.data.data!;
  },

  getAuditLogsByUser: async (userId: string, filters?: FilterOptions): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>(`/audit/user/${userId}`, {
      params: filters,
    });
    return response.data.data!;
  },

  getAuditLogsByEntity: async (entity: string, entityId: string): Promise<AuditLog[]> => {
    const response = await apiClient.get<ApiResponse<AuditLog[]>>(`/audit/entity/${entity}/${entityId}`);
    return response.data.data!;
  },
};
