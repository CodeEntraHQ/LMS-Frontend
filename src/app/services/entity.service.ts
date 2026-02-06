import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface Entity {
  id: string;
  name: string;
  type: string;
  status: string;
  address: string;
  students: number;
  exams: number;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  createdAt?: string;
  features?: Record<string, boolean>; // Feature access control map
}

const API_URL = 'http://localhost:8080/api/entities';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  constructor(private http: HttpClient) {}

  getAllEntities(): Observable<{ ok: true; entities: Entity[] } | { ok: false; message: string }> {
    return this.http.get<{ ok: boolean; entities?: any[]; message?: string }>(API_URL).pipe(
      map(response => {
        console.log('Get all entities response:', response);
        if (response.ok && response.entities) {
          // Convert backend entities to frontend format
          const entities = response.entities.map((e: any) => ({
            id: e.id.toString(),
            name: e.name,
            type: e.type,
            status: e.status || 'active',
            address: e.address,
            students: e.students || 0,
            exams: e.exams || 0,
            description: e.description,
            email: e.email,
            phone: e.phone,
            website: e.website,
            logoUrl: e.logoUrl,
            primaryColor: e.primaryColor,
            createdAt: e.createdAt
          }));
          console.log('Mapped entities:', entities);
          return { ok: true as const, entities };
        }
        return { ok: false as const, message: response.message || 'Failed to load entities' };
      }),
      catchError(error => {
        console.error('Error loading entities:', error);
        return of({ ok: false as const, message: error.error?.message || 'Failed to load entities' });
      })
    );
  }

  getEntityById(id: string): Observable<{ ok: true; entity: Entity; features?: Record<string, boolean> } | { ok: false; message: string }> {
    return this.http.get<{ ok: boolean; entity?: any; features?: Record<string, boolean>; message?: string }>(`${API_URL}/${id}`).pipe(
      map(response => {
        if (response.ok && response.entity) {
          const e = response.entity;
          const entity: Entity = {
            id: e.id.toString(),
            name: e.name,
            type: e.type,
            status: e.status,
            address: e.address,
            students: e.students || 0,
            exams: e.exams || 0,
            description: e.description,
            email: e.email,
            phone: e.phone,
            website: e.website,
            logoUrl: e.logoUrl,
            primaryColor: e.primaryColor,
            createdAt: e.createdAt
          };
          return { ok: true as const, entity, features: response.features };
        }
        return { ok: false as const, message: response.message || 'Failed to load entity' };
      }),
      catchError(error => {
        return of({ ok: false as const, message: error.error?.message || 'Failed to load entity' });
      })
    );
  }

  createEntity(entityData: {
    name: string;
    type: string;
    address: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    logoUrl?: string;
    primaryColor?: string;
  }): Observable<{ ok: true; entity: Entity } | { ok: false; message: string }> {
    console.log('🚀 EntityService.createEntity() called');
    console.log('📍 API_URL:', API_URL);
    console.log('📦 Request data:', JSON.stringify(entityData, null, 2));
    console.log('🌐 Making POST request to:', API_URL);
    return this.http.post<{ ok: boolean; entity?: any; message?: string }>(API_URL, entityData, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      map(response => {
        console.log('Create entity response:', response);
        if (response.ok && response.entity) {
          const e = response.entity;
          const entity: Entity = {
            id: e.id.toString(),
            name: e.name,
            type: e.type,
            status: e.status || 'active',
            address: e.address,
            students: e.students || 0,
            exams: e.exams || 0,
            description: e.description,
            email: e.email,
            phone: e.phone,
            website: e.website,
            logoUrl: e.logoUrl,
            primaryColor: e.primaryColor
          };
          console.log('Created entity:', entity);
          return { ok: true as const, entity };
        }
        return { ok: false as const, message: response.message || 'Failed to create entity' };
      }),
      catchError(error => {
        console.error('Error creating entity in service:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        return of({ ok: false as const, message: error.error?.message || error.message || 'Failed to create entity' });
      })
    );
  }

  updateEntity(id: string, entityData: {
    name?: string;
    type?: string;
    address?: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    logoUrl?: string;
    primaryColor?: string;
    status?: string;
  }): Observable<{ ok: true; entity: Entity } | { ok: false; message: string }> {
    return this.http.put<{ ok: boolean; entity?: any; message?: string }>(`${API_URL}/${id}`, entityData).pipe(
      map(response => {
        if (response.ok && response.entity) {
          const e = response.entity;
          const entity: Entity = {
            id: e.id.toString(),
            name: e.name,
            type: e.type,
            status: e.status,
            address: e.address,
            students: e.students || 0,
            exams: e.exams || 0,
            description: e.description,
            email: e.email,
            phone: e.phone,
            website: e.website,
            logoUrl: e.logoUrl,
            primaryColor: e.primaryColor,
            createdAt: e.createdAt
          };
          return { ok: true as const, entity };
        }
        return { ok: false as const, message: response.message || 'Failed to update entity' };
      }),
      catchError(error => {
        return of({ ok: false as const, message: error.error?.message || 'Failed to update entity' });
      })
    );
  }

  deleteEntity(id: string): Observable<{ ok: true } | { ok: false; message: string }> {
    return this.http.delete<{ ok: boolean; message?: string }>(`${API_URL}/${id}`).pipe(
      map(response => {
        if (response.ok) {
          return { ok: true as const };
        }
        return { ok: false as const, message: response.message || 'Failed to delete entity' };
      }),
      catchError(error => {
        return of({ ok: false as const, message: error.error?.message || 'Failed to delete entity' });
      })
    );
  }

  getEntityFeatures(entityId: string): Observable<{ ok: true; features: Record<string, boolean>; availableFeatures: string[] } | { ok: false; message: string }> {
    return this.http.get<{ ok: boolean; features?: Record<string, boolean>; availableFeatures?: string[]; message?: string }>(`${API_URL}/${entityId}/features`).pipe(
      map(response => {
        if (response.ok && response.features) {
          return { 
            ok: true as const, 
            features: response.features,
            availableFeatures: response.availableFeatures || []
          };
        }
        return { ok: false as const, message: response.message || 'Failed to load features' };
      }),
      catchError(error => {
        return of({ ok: false as const, message: error.error?.message || 'Failed to load features' });
      })
    );
  }

  updateEntityFeatures(entityId: string, features: Record<string, boolean>): Observable<{ ok: true } | { ok: false; message: string }> {
    return this.http.put<{ ok: boolean; message?: string }>(`${API_URL}/${entityId}/features`, features).pipe(
      map(response => {
        if (response.ok) {
          return { ok: true as const };
        }
        return { ok: false as const, message: response.message || 'Failed to update features' };
      }),
      catchError(error => {
        return of({ ok: false as const, message: error.error?.message || 'Failed to update features' });
      })
    );
  }

  createInvitation(entityId: string, invitationData: { email: string; description?: string }): Observable<{ ok: true; message: string } | { ok: false; message: string }> {
    return this.http.post<{ ok: boolean; message?: string }>(`http://localhost:8080/api/invitations/entity/${entityId}`, invitationData).pipe(
      map(response => {
        if (response.ok) {
          return { ok: true as const, message: response.message || 'Invitation sent successfully' };
        }
        return { ok: false as const, message: response.message || 'Failed to send invitation' };
      }),
      catchError(error => {
        return of({ ok: false as const, message: error.error?.message || 'Failed to send invitation' });
      })
    );
  }
}
