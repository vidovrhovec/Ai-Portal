"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Shield, FileText, AlertTriangle, CheckCircle, Upload, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { usePlagiarismSettings } from '@/hooks/usePlagiarismSettings';

function SettingsForm({ data, onSave, onClose }: { data: any; onSave: (d: any) => Promise<void> | void; onClose: () => void }) {
  const [sensitivity, setSensitivity] = useState<number>(data?.sensitivity ?? 75);
  const [checkAcademic, setCheckAcademic] = useState<boolean>(data?.checkAcademic ?? true);
  const [checkWeb, setCheckWeb] = useState<boolean>(data?.checkWeb ?? true);
  const [checkSubmissions, setCheckSubmissions] = useState<boolean>(data?.checkSubmissions ?? true);
  const [autoFlagThreshold, setAutoFlagThreshold] = useState<number>(data?.autoFlagThreshold ?? 60);
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <Label>Sensitivity</Label>
        <input
          aria-label="sensitivity"
          type="range"
          min={0}
          max={100}
          value={sensitivity}
          onChange={(e) => setSensitivity(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-muted-foreground">{sensitivity}%</div>
      </div>

      <div>
        <Label>Databases to check</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <div className="text-sm">Academic databases</div>
            <Switch checked={checkAcademic} onCheckedChange={(v) => setCheckAcademic(Boolean(v))} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">Web content</div>
            <Switch checked={checkWeb} onCheckedChange={(v) => setCheckWeb(Boolean(v))} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">Student submissions</div>
            <Switch checked={checkSubmissions} onCheckedChange={(v) => setCheckSubmissions(Boolean(v))} />
          </div>
        </div>
      </div>

      <div>
        <Label>Auto-flag threshold (originality %)</Label>
        <Input type="number" value={autoFlagThreshold} onChange={(e) => setAutoFlagThreshold(Number(e.target.value))} />
        <div className="text-xs text-muted-foreground mt-1">Submissions below this originality percentage will be auto-flagged.</div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          onClick={async () => {
            setSaving(true);
            await onSave({ sensitivity, checkAcademic, checkWeb, checkSubmissions, autoFlagThreshold });
            setSaving(false);
          }}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

function SettingsButton() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, save, refetch } = usePlagiarismSettings() as any;

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Shield className="mr-2 h-4 w-4" />
        Settings
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plagiarism Detector Settings</DialogTitle>
            <DialogDescription>Adjust sensitivity and detection sources</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <SettingsForm
              data={data}
              onSave={async (payload: any) => {
                try {
                  await save.mutateAsync(payload);
                  refetch?.();
                  setOpen(false);
                } catch (e) {
                  // ignore
                }
              }}
              onClose={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export const PlagiarismDetectorSection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [checkText, setCheckText] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const recentChecks = [
    { id: 1, student: 'John Doe', assignment: 'History Essay', score: 85, status: 'original', checkedAt: '2024-01-20 14:30', matches: [] },
    { id: 2, student: 'Jane Smith', assignment: 'Science Report', score: 45, status: 'plagiarized', checkedAt: '2024-01-19 16:45', matches: ['Wikipedia article'] },
  ];

  const handleFileCheck = () => {
    if (!selectedFile) return;
    setIsChecking(true);
    setTimeout(() => setIsChecking(false), 1200);
  };

  const handleTextCheck = () => {
    if (!checkText.trim()) return;
    setIsChecking(true);
    setTimeout(() => setIsChecking(false), 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plagiarism Detector</h2>
          <p className="text-muted-foreground">AI-powered originality checking for student submissions</p>
        </div>
        <SettingsButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Upload className="mr-2 h-5 w-5" />Check Document</CardTitle>
            <CardDescription>Upload a student submission to check for plagiarism</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select File</Label>
                <Input id="file-upload" type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e: any) => setSelectedFile(e.target.files?.[0] || null)} />
                {selectedFile && <p className="text-sm text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
              </div>
              <Button onClick={handleFileCheck} disabled={!selectedFile || isChecking} className="w-full">{isChecking ? 'Checking...' : 'Check for Plagiarism'}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" />Check Text</CardTitle>
            <CardDescription>Paste text directly to check for plagiarism</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="text-check">Text to Check</Label>
                <Textarea id="text-check" placeholder="Paste your text here..." value={checkText} onChange={(e) => setCheckText(e.target.value)} rows={6} />
              </div>
              <Button onClick={handleTextCheck} disabled={!checkText.trim() || isChecking} className="w-full">{isChecking ? 'Checking...' : 'Check for Plagiarism'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Plagiarism Checks</CardTitle>
          <CardDescription>History of plagiarism checks performed on student submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentChecks.map((c) => (
              <div key={c.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{c.student}</p>
                    <p className="text-sm text-muted-foreground">{c.assignment}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={c.status === 'original' ? 'default' : c.status === 'plagiarized' ? 'destructive' : 'secondary'}>{c.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Score: {c.score}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{c.checkedAt}</span>
                    {c.matches.length > 0 && (
                      <div className="flex items-center"><AlertTriangle className="mr-1 h-4 w-4" />{c.matches.length} matches found</div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline"><Search className="mr-2 h-4 w-4" />View Report</Button>
                    {c.status === 'plagiarized' && <Button size="sm" variant="outline">Flag Student</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Checks</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">247</div><p className="text-xs text-muted-foreground">This semester</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Original</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">89%</div><p className="text-xs text-muted-foreground">Of submissions</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Flagged</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">8%</div><p className="text-xs text-muted-foreground">Require review</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg. Score</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">78%</div><p className="text-xs text-muted-foreground">Originality score</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Detection Settings</CardTitle><CardDescription>Configure plagiarism detection parameters</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Sensitivity Level</Label>
              <div className="mt-2"><Progress value={75} className="h-2" /><p className="text-xs text-muted-foreground mt-1">High (75%)</p></div>
            </div>
            <div>
              <Label>Databases Checked</Label>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-sm"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Academic databases</div>
                <div className="flex items-center text-sm"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Web content</div>
                <div className="flex items-center text-sm"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Student submissions</div>
              </div>
            </div>
            <div>
              <Label>Auto-flagging Threshold</Label>
              <div className="mt-2"><p className="text-sm font-medium">Below 60% originality</p><p className="text-xs text-muted-foreground">Automatic review required</p></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
