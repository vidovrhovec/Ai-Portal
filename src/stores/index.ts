import { create } from 'zustand';
import { UserEntity, CourseEntity } from '../domain/entities';

interface AuthState {
  user: UserEntity | null;
  isAuthenticated: boolean;
  login: (user: UserEntity) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

interface CourseState {
  courses: CourseEntity[];
  setCourses: (courses: CourseEntity[]) => void;
  addCourse: (course: CourseEntity) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  setCourses: (courses) => set({ courses }),
  addCourse: (course) => set((state) => ({ courses: [...state.courses, course] })),
}));

interface AIState {
  isLoading: boolean;
  response: string;
  setLoading: (loading: boolean) => void;
  setResponse: (response: string) => void;
}

export const useAIStore = create<AIState>((set) => ({
  isLoading: false,
  response: '',
  setLoading: (loading) => set({ isLoading: loading }),
  setResponse: (response) => set({ response }),
}));