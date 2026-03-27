/**
 * useGroups Hook
 * 
 * Custom React hook for managing social learning groups functionality.
 * Provides methods for:
 * - Fetching user's groups and group details
 * - Creating new groups (teacher only)
 * - Joining groups via invitation codes
 * - Managing group membership
 * - Real-time group messaging and activities
 * - Shared canvas collaboration
 * 
 * Integrates with React Query for caching and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCSRFToken } from '@/lib/utils';
import type { CSSProperties } from 'react';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  teacherId: string;
  members: GroupMember[];
  assignments: unknown[];
  _count: {
    members: number;
    messages: number;
  };
  createdAt: string;
}

export interface GroupMember {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface GroupInvite {
  id: string;
  code: string;
  creatorId: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  groupId: string | null;
  group: {
    id: string;
    name: string;
    description: string | null;
    _count: {
      members: number;
    };
  } | null;
  title: string;
  description: string | null;
  maxMembers: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface StudentProfileUpdate {
  name?: string;
  email?: string;
  preferences?: Record<string, unknown>;
}

export interface SharedCanvas {
  id: string;
  groupId: string;
  title: string;
  elements: CanvasElement[];
  createdAt: string;
  updatedAt: string;
}

export interface CanvasElement {
  id: string;
  canvasId: string;
  type: 'text' | 'shape' | 'image' | 'drawing';
  content: string;
  positionX: number;
  positionY: number;
  width: number | null;
  height: number | null;
  creatorId: string;
  creator: {
    id: string;
    name: string | null;
  };
  createdAt: string;
}

export interface GroupActivity {
  id: string;
  groupId: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
  };
  activityType: 'joined' | 'left' | 'active' | 'inactive';
  timestamp: string;
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await fetch('/api/groups', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      return response.json();
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; memberIds: string[] }) => {
      const csrfToken = await getCSRFToken();
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create group');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { groupId: string; name?: string; description?: string; memberIds?: string[] }) => {
      const csrfToken = await getCSRFToken();
      const res = await fetch(`/api/groups/${data.groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ name: data.name, description: data.description, memberIds: data.memberIds }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update group');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const csrfToken = await getCSRFToken();
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete group');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useAssignQuizToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { groupId: string; quizId?: string; title?: string; courseId?: string }) => {
      const csrfToken = await getCSRFToken();
      const res = await fetch(`/api/groups/${data.groupId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ quizId: data.quizId, title: data.title, courseId: data.courseId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to assign quiz to group');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useGroupMessages(groupId: string) {
  return useQuery({
    queryKey: ['group-messages', groupId],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch group messages');
      }
      return response.json();
    },
    enabled: !!groupId,
  });
}

export function useSendGroupMessage(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] });
    },
  });
}

export function useUpdateStudentProfile(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StudentProfileUpdate) => {
      const response = await fetch(`/api/students/${studentId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update student profile');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile', studentId] });
    },
  });
}

export function useCreateStudentMaterial(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; type: string; url?: string; content?: string }) => {
      const response = await fetch(`/api/students/${studentId}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create student material');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-materials', studentId] });
    },
  });
}

// Group Invite hooks
export function useCreateGroupInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { groupId: string; expiresInHours?: number }) => {
      const response = await fetch('/api/groups/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create group invite');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-invites'] });
    },
  });
}

export function useGroupInvites(groupId?: string) {
  return useQuery({
    queryKey: ['group-invites', groupId],
    queryFn: async () => {
      const url = groupId ? `/api/groups/${groupId}/invites` : '/api/groups/invites';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch group invites');
      }
      return response.json();
    },
  });
}

export function useJoinGroupWithInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join group');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-invites'] });
    },
  });
}

// Shared Canvas hooks
export function useSharedCanvases(groupId: string) {
  return useQuery({
    queryKey: ['shared-canvases', groupId],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/canvases`);
      if (!response.ok) {
        throw new Error('Failed to fetch shared canvases');
      }
      return response.json();
    },
    enabled: !!groupId,
  });
}

export function useCreateSharedCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { groupId: string; title: string }) => {
      const response = await fetch('/api/groups/canvases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId: data.groupId, name: data.title }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create shared canvas');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shared-canvases', data.groupId] });
    },
  });
}

export function useCanvasElements(canvasId: string) {
  return useQuery({
    queryKey: ['canvas-elements', canvasId],
    queryFn: async () => {
      const response = await fetch(`/api/groups/canvases/${canvasId}/elements`);
      if (!response.ok) {
        throw new Error('Failed to fetch canvas elements');
      }
      return response.json();
    },
    enabled: !!canvasId,
  });
}

export function useAddCanvasElement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      canvasId: string;
      type: 'text' | 'shape' | 'image' | 'drawing';
      content: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      style?: CSSProperties;
    }) => {
      const response = await fetch(`/api/groups/canvases/${data.canvasId}/elements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canvasId: data.canvasId,
          type: data.type,
          content: data.content,
          position: data.position,
          size: data.size,
          style: data.style,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add canvas element');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['canvas-elements', data.canvasId] });
    },
  });
}

export function useUpdateCanvasElement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      elementId: string;
      canvasId: string;
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      content?: string;
      style?: CSSProperties;
    }) => {
      const { elementId, canvasId, ...updateData } = data;
      const response = await fetch(`/api/groups/canvases/${canvasId}/elements/${elementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update canvas element');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['canvas-elements', data.canvasId] });
    },
  });
}

// Group Activity hooks
export function useGroupActivities(groupId: string) {
  return useQuery({
    queryKey: ['group-activities', groupId],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/activities`);
      if (!response.ok) {
        throw new Error('Failed to fetch group activities');
      }
      return response.json();
    },
    enabled: !!groupId,
    refetchInterval: 30000, // Refetch every 30 seconds for live status
  });
}

export function useUpdateGroupActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { groupId: string; activityType: 'joined' | 'left' | 'active' | 'inactive' }) => {
      const response = await fetch('/api/groups/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update group activity');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['group-activities', data.groupId] });
    },
  });
}