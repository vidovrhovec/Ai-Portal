import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, Eye, Shield, Plus } from 'lucide-react';

export const ParentsPortalSection: React.FC = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [observerLinks, setObserverLinks] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch real students (teacher's students)
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/students', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setStudents(data || []);
        }
      } catch (e) {
        console.error('Failed to fetch students for ParentsPortalSection', e);
      }
    })();

    // load existing observer links
    (async () => {
      try {
        const res = await fetch('/api/teacher/observer-links', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setObserverLinks(data || []);
        }
      } catch (e) {
        console.error('Failed to fetch observer links', e);
      }
    })();
  }, []);

  const handleSendInvite = async () => {
    if (!selectedStudent) {
      alert('Please select a student first');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/parent/observer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId: selectedStudent }),
      });
      if (!res.ok) throw new Error('Failed to create observer link');
      const payload = await res.json();
      // Refresh links
      const linksRes = await fetch('/api/teacher/observer-links', { credentials: 'include' });
      if (linksRes.ok) {
        const list = await linksRes.json();
        setObserverLinks(list || []);
      }
      // Optionally show the generated link to teacher
      if (payload.link) {
        alert('Observer link created: ' + payload.link);
      }
      setInviteEmail('');
      setSelectedStudent('');
    } catch (e) {
      console.error(e);
      alert('Napaka pri pošiljanju vabila');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Parents Portal</h2>
          <p className="text-muted-foreground">Manage parent access to student progress and activities</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite Parent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Parent</DialogTitle>
              <DialogDescription>
                Send an invitation to a parent to access their child&apos;s progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="student">Select Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - Grade {student.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Parent Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleSendInvite} className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Parent Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Active Parent Access
          </CardTitle>
          <CardDescription>
            Parents with active access to student information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                {observerLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{link.studentName || link.studentId}</p>
                        <p className="text-sm text-muted-foreground">Link expires: {new Date(link.expiresAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Active</Badge>
                      <a className="text-sm text-blue-600" href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/parent/observer?studentId=${link.studentId}&token=${link.token}`} target="_blank" rel="noreferrer">Open Link</a>
                    </div>
                  </div>
                ))}
              </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Invitations waiting for parent acceptance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No pending invitations.</div>
        </CardContent>
      </Card>

      {/* Access Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Access Permissions</CardTitle>
          <CardDescription>
            What parents can view in the portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Viewable Information</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Student grades and progress</li>
                <li>• Assignment submissions</li>
                <li>• Attendance records</li>
                <li>• Teacher feedback</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Restricted Actions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cannot modify grades</li>
                <li>• Cannot submit assignments</li>
                <li>• Cannot communicate with teachers</li>
                <li>• Read-only access only</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};