'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Crown,
  Settings,
  Shield,
  BookOpen,
  Target,
  TrendingUp,
  Award,
  X,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import { CollaborativeCanvas } from '@/components/CollaborativeCanvas';

interface StudyGroupsWithRolesProps {
  userId: string;
  className?: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  createdBy: string;
  createdAt: Date;
  members: GroupMember[];
  settings: GroupSettings;
  activities: GroupActivity[];
  goals: GroupGoal[];
  canvases: SharedCanvas[];
  isActive: boolean;
}

interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'moderator' | 'contributor' | 'member';
  joinedAt: Date;
  lastActive: Date;
  contributions: number;
  achievements: string[];
}

interface GroupSettings {
  isPublic: boolean;
  allowJoinRequests: boolean;
  requireApproval: boolean;
  maxMembers: number;
  contentModeration: boolean;
}

interface GroupActivity {
  id: string;
  type: 'message' | 'file_shared' | 'goal_completed' | 'member_joined' | 'review_submitted';
  userId: string;
  userName: string;
  description: string;
  timestamp: Date;
}

interface GroupGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: Date;
  assignedTo: string[];
  status: 'active' | 'completed' | 'overdue';
}

interface SharedCanvas {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function StudyGroupsWithRoles({ userId, className = '' }: StudyGroupsWithRolesProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<SharedCanvas | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Create group form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    subject: '',
    isPublic: true,
    allowJoinRequests: true,
    requireApproval: false,
    maxMembers: 50
  });

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: { userId }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('user-joined', (data) => {
      // Update group members
      setGroups(prev => prev.map(group =>
        group.id === data.groupId
          ? {
              ...group,
              members: [...group.members, {
                id: data.userId,
                name: data.user.name || `User ${data.userId}`,
                email: '',
                role: 'member',
                joinedAt: new Date(),
                lastActive: new Date(),
                contributions: 0,
                achievements: []
              }]
            }
          : group
      ));
    });

    socketInstance.on('user-left', (data) => {
      // Update group members
      setGroups(prev => prev.map(group =>
        group.id === data.groupId
          ? {
              ...group,
              members: group.members.filter(m => m.id !== data.userId)
            }
          : group
      ));
    });

    socketRef.current = socketInstance;

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  // Load groups
  const loadGroups = useCallback(async () => {
    try {
      // Mock data - in real app, this would come from API
      const mockGroups: StudyGroup[] = [
        {
          id: '1',
          name: 'Advanced Mathematics Study Group',
          description: 'Focused on calculus, linear algebra, and discrete mathematics',
          subject: 'Mathematics',
          createdBy: userId,
          createdAt: new Date(Date.now() - 604800000),
          isActive: true,
          settings: {
            isPublic: true,
            allowJoinRequests: true,
            requireApproval: false,
            maxMembers: 30,
            contentModeration: true
          },
          members: [
            {
              id: userId,
              name: 'You',
              email: 'you@example.com',
              role: 'owner',
              joinedAt: new Date(Date.now() - 604800000),
              lastActive: new Date(),
              contributions: 15,
              achievements: ['Top Contributor', 'Goal Crusher']
            },
            {
              id: 'user2',
              name: 'Alice Johnson',
              email: 'alice@example.com',
              role: 'moderator',
              joinedAt: new Date(Date.now() - 432000000),
              lastActive: new Date(Date.now() - 3600000),
              contributions: 12,
              achievements: ['Helpful Reviewer']
            },
            {
              id: 'user3',
              name: 'Bob Smith',
              email: 'bob@example.com',
              role: 'contributor',
              joinedAt: new Date(Date.now() - 259200000),
              lastActive: new Date(Date.now() - 7200000),
              contributions: 8,
              achievements: []
            }
          ],
          activities: [
            {
              id: 'a1',
              type: 'goal_completed',
              userId: 'user2',
              userName: 'Alice Johnson',
              description: 'Completed weekly study goal',
              timestamp: new Date(Date.now() - 3600000)
            },
            {
              id: 'a2',
              type: 'member_joined',
              userId: 'user3',
              userName: 'Bob Smith',
              description: 'Joined the group',
              timestamp: new Date(Date.now() - 7200000)
            }
          ],
          goals: [
            {
              id: 'g1',
              title: 'Complete Calculus Chapter 5',
              description: 'Master integration techniques',
              target: 100,
              current: 75,
              deadline: new Date(Date.now() + 604800000),
              assignedTo: [userId, 'user2'],
              status: 'active'
            }
          ],
          canvases: [
            {
              id: 'canvas1',
              title: 'Calculus Problem Solving',
              description: 'Collaborative workspace for integration problems',
              isActive: true,
              createdAt: new Date(Date.now() - 86400000),
              updatedAt: new Date(Date.now() - 3600000)
            }
          ]
        }
      ];

      setGroups(mockGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGroups();
  }, [loadGroups]);

  // Create group
  const createGroup = async () => {
    try {
      const newGroup: StudyGroup = {
        id: Date.now().toString(),
        name: createForm.name,
        description: createForm.description,
        subject: createForm.subject,
        createdBy: userId,
        createdAt: new Date(),
        isActive: true,
        settings: {
          isPublic: createForm.isPublic,
          allowJoinRequests: createForm.allowJoinRequests,
          requireApproval: createForm.requireApproval,
          maxMembers: createForm.maxMembers,
          contentModeration: true
        },
        members: [
          {
            id: userId,
            name: 'You',
            email: 'you@example.com',
            role: 'owner',
            joinedAt: new Date(),
            lastActive: new Date(),
            contributions: 0,
            achievements: []
          }
        ],
        activities: [],
        goals: [],
        canvases: []
      };

      setGroups(prev => [...prev, newGroup]);
      setCreateForm({
        name: '',
        description: '',
        subject: '',
        isPublic: true,
        allowJoinRequests: true,
        requireApproval: false,
        maxMembers: 50
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Update member role
  const updateMemberRole = (groupId: string, memberId: string, newRole: GroupMember['role']) => {
    setGroups(prev => prev.map(group =>
      group.id === groupId
        ? {
            ...group,
            members: group.members.map(member =>
              member.id === memberId
                ? { ...member, role: newRole }
                : member
            )
          }
        : group
    ));
  };

  // Remove member
  const removeMember = (groupId: string, memberId: string) => {
    setGroups(prev => prev.map(group =>
      group.id === groupId
        ? {
            ...group,
            members: group.members.filter(member => member.id !== memberId)
          }
        : group
    ));
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'contributor': return 'bg-green-100 text-green-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4" />;
      case 'moderator': return <Shield className="h-4 w-4" />;
      case 'contributor': return <Award className="h-4 w-4" />;
      case 'member': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  // Check if user can manage group
  const canManageGroup = (group: StudyGroup) => {
    const member = group.members.find(m => m.id === userId);
    return member?.role === 'owner' || member?.role === 'moderator';
  };

  // Check if user is owner
  const isOwner = (group: StudyGroup) => {
    return group.createdBy === userId;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Study Groups with Roles</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cursor-pointer"
            onClick={() => setSelectedGroup(group)}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  </div>
                  {isOwner(group) && (
                    <Crown className="h-5 w-5 text-purple-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{group.subject}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {group.members.length} members
                      </span>
                    </div>
                    <Badge variant={group.isActive ? "default" : "secondary"}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {group.goals.filter(g => g.status === 'active').length} active goals
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study groups yet</h3>
            <p className="text-gray-600 mb-4">Create your first study group to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        )}
      </div>

      {/* Group Details Dialog */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedGroup && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-2xl">{selectedGroup.name}</DialogTitle>
                    {isOwner(selectedGroup) && (
                      <Crown className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  {canManageGroup(selectedGroup) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  )}
                </div>
                <p className="text-gray-600">{selectedGroup.description}</p>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="canvas">Canvas</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-8 w-8 text-blue-600" />
                          <div>
                            <div className="text-2xl font-bold">{selectedGroup.members.length}</div>
                            <div className="text-sm text-gray-600">Members</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-8 w-8 text-green-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {selectedGroup.goals.filter(g => g.status === 'completed').length}
                            </div>
                            <div className="text-sm text-gray-600">Goals Completed</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-8 w-8 text-purple-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {selectedGroup.members.reduce((acc, m) => acc + m.contributions, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Contributions</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedGroup.activities.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {activity.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium">{activity.userName}</span> {activity.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(activity.timestamp, 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="members" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Group Members
                        <Badge variant="outline">
                          {selectedGroup.members.length}/{selectedGroup.settings.maxMembers}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedGroup.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {member.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{member.name}</span>
                                  {member.id === userId && (
                                    <Badge variant="outline" className="text-xs">You</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                                    {getRoleIcon(member.role)}
                                    <span className="ml-1 capitalize">{member.role}</span>
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {member.contributions} contributions
                                  </span>
                                </div>
                                {member.achievements.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {member.achievements.map((achievement, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {achievement}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {canManageGroup(selectedGroup) && member.id !== userId && (
                              <div className="flex items-center gap-2">
                                <Select
                                  value={member.role}
                                  onValueChange={(value: GroupMember['role']) =>
                                    updateMemberRole(selectedGroup.id, member.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="contributor">Contributor</SelectItem>
                                    {!isOwner(selectedGroup) && (
                                      <SelectItem value="moderator">Moderator</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeMember(selectedGroup.id, member.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="goals" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Group Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedGroup.goals.map((goal) => (
                          <div key={goal.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium">{goal.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                              </div>
                              <Badge
                                variant={
                                  goal.status === 'completed' ? 'default' :
                                  goal.status === 'overdue' ? 'destructive' : 'secondary'
                                }
                              >
                                {goal.status}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span>{goal.current}/{goal.target}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                              <span>Due: {format(goal.deadline, 'MMM d, yyyy')}</span>
                              <span>Assigned to: {goal.assignedTo.length} members</span>
                            </div>
                          </div>
                        ))}

                        {selectedGroup.goals.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No goals set for this group yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="canvas" className="space-y-6">
                  {selectedGroup.canvases.length > 0 ? (
                    selectedCanvas ? (
                      <CollaborativeCanvas
                        canvasId={selectedCanvas.id}
                        groupId={selectedGroup.id}
                        userId={userId}
                        userName="User" // TODO: Get actual user name
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Select a Canvas</h3>
                          <Button
                            onClick={() => {
                              // TODO: Create new canvas
                              alert('Create new canvas functionality coming soon!');
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            New Canvas
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedGroup.canvases.map((canvas) => (
                            <Card
                              key={canvas.id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => setSelectedCanvas(canvas)}
                            >
                              <CardContent className="p-4">
                                <h4 className="font-medium text-gray-900 mb-2">{canvas.title}</h4>
                                {canvas.description && (
                                  <p className="text-sm text-gray-600 mb-2">{canvas.description}</p>
                                )}
                                <p className="text-xs text-gray-400">
                                  Updated {format(canvas.updatedAt, 'MMM d, h:mm a')}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No canvases yet</h3>
                      <p className="text-gray-600 mb-4">Create your first collaborative canvas to start working together!</p>
                      <Button
                        onClick={() => {
                          // TODO: Create new canvas
                          alert('Create new canvas functionality coming soon!');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Canvas
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedGroup.activities.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarFallback className="text-xs">
                                {activity.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium">{activity.userName}</span> {activity.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {format(activity.timestamp, 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Study Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input
                placeholder="Enter group name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe your study group"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="e.g., Mathematics, Physics, Chemistry"
                value={createForm.subject}
                onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Members</label>
              <Input
                type="number"
                min="2"
                max="100"
                value={createForm.maxMembers}
                onChange={(e) => setCreateForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={createGroup}
                disabled={!createForm.name.trim() || !createForm.subject.trim()}
              >
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}