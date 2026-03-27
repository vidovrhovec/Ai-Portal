'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Crown,
  UserCheck,
  GraduationCap,
  User
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  createdAt: string;
  lastLogin: string | null;
}

// API functions for user management
async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/admin/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

async function createUser(userData: { name: string; email: string; role: User['role']; password: string }): Promise<User> {
  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function updateUser(id: string, userData: { name: string; email: string; role: User['role']; password?: string }): Promise<User> {
  try {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

async function deleteUser(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

const roleConfig = {
  ADMIN: { label: 'Admin', icon: Crown, color: 'bg-yellow-100 text-yellow-800' },
  TEACHER: { label: 'Učitelj', icon: GraduationCap, color: 'bg-blue-100 text-blue-800' },
  STUDENT: { label: 'Učenec', icon: UserCheck, color: 'bg-green-100 text-green-800' },
  PARENT: { label: 'Starš', icon: User, color: 'bg-purple-100 text-purple-800' }
};

export function AdminUsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STUDENT' as User['role'],
    password: ''
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await fetchUsers();
      setUsers(userData);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    try {
      const newUser = await createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password
      });

      setUsers([...users, newUser]);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', email: '', role: 'STUDENT', password: '' });

      alert(`Uporabnik ${newUser.name} je bil uspešno ustvarjen.`);
    } catch {
      alert('Napaka pri ustvarjanju uporabnika.');
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData: { name: string; email: string; role: User['role']; password?: string } = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await updateUser(selectedUser.id, updateData);

      setUsers(users.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      ));

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', role: 'STUDENT', password: '' });

      alert(`Uporabnik ${formData.name} je bil uspešno posodobljen.`);
    } catch {
      alert('Napaka pri posodabljanju uporabnika.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!confirm(`Ali ste prepričani, da želite izbrisati uporabnika ${user?.name}?`)) return;

    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      alert('Uporabnik je bil uspešno izbrisan.');
    } catch {
      alert('Napaka pri brisanju uporabnika.');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setIsEditDialogOpen(true);
  };

  const getRoleStats = () => {
    const stats = {
      ADMIN: users.filter(u => u.role === 'ADMIN').length,
      TEACHER: users.filter(u => u.role === 'TEACHER').length,
      STUDENT: users.filter(u => u.role === 'STUDENT').length,
      PARENT: users.filter(u => u.role === 'PARENT').length
    };
    return stats;
  };

  const stats = getRoleStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Nalaganje uporabnikov...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadUsers}>Poskusi znova</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Upravljanje uporabnikov</h1>
          <p className="text-muted-foreground">Upravljajte z vsemi uporabniki sistema</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj uporabnika
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novega uporabnika</DialogTitle>
              <DialogDescription>
                Ustvarite novega uporabnika z določeno vlogo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ime in priimek</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Vnesite ime in priimek"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Vnesite email naslov"
                />
              </div>
              <div>
                <Label htmlFor="role">Vloga</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Učenec</SelectItem>
                    <SelectItem value="TEACHER">Učitelj</SelectItem>
                    <SelectItem value="PARENT">Starš</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">Geslo</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Vnesite geslo"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Prekliči
              </Button>
              <Button onClick={handleCreateUser}>
                Ustvari uporabnika
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([role, count]) => {
          const config = roleConfig[role as keyof typeof roleConfig];
          const Icon = config.icon;
          return (
            <Card key={role}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Išči po imenu ali emailu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtriraj po vlogi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Vse vloge</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="TEACHER">Učitelj</SelectItem>
                  <SelectItem value="STUDENT">Učenec</SelectItem>
                  <SelectItem value="PARENT">Starš</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const config = roleConfig[user.role];
          const Icon = config.icon;
          return (
            <Card key={user.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg font-semibold">
                      {user.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-1">{user.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Vloga:</span>
                    <Badge className={config.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Registriran:</span>
                    <span className="text-sm font-medium">
                      {new Date(user.createdAt).toLocaleDateString('sl-SI')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Zadnja prijava:</span>
                    <span className="text-sm font-medium">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('sl-SI')
                        : 'Nikoli'
                      }
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Uredi
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Izbriši
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uredi uporabnika</DialogTitle>
            <DialogDescription>
              Posodobite podatke uporabnika.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Ime in priimek</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Vnesite ime in priimek"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Vnesite email naslov"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Vloga</Label>
              <Select
                value={formData.role}
                onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Učenec</SelectItem>
                  <SelectItem value="TEACHER">Učitelj</SelectItem>
                  <SelectItem value="PARENT">Starš</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-password">Novo geslo (pustite prazno za nespreminjanje)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Vnesite novo geslo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Prekliči
            </Button>
            <Button onClick={handleEditUser}>
              Posodobi uporabnika
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminUsersSection;