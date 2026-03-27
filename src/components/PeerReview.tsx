'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Star,
  MessageSquare,
  Eye,
  Award,
  Users,
  Calendar,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';

interface PeerReviewProps {
  userId: string;
  className?: string;
}

interface Submission {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  type: 'assignment' | 'project' | 'quiz' | 'essay';
  content: string;
  attachments?: string[];
  submittedAt: Date;
  dueDate?: Date;
  status: 'pending' | 'reviewing' | 'completed';
  reviews: Review[];
  averageRating?: number;
  reviewCount: number;
}

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  submissionId: string;
  rating: number;
  comments: string;
  strengths: string[];
  improvements: string[];
  isAnonymous: boolean;
  createdAt: Date;
  helpful: number;
}

export function PeerReview({ userId, className = '' }: PeerReviewProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'reviews'>('newest');

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comments: '',
    strengths: [] as string[],
    improvements: [] as string[],
    isAnonymous: false
  });

  // Load submissions
  const loadSubmissions = useCallback(async () => {
    try {
      // Mock data - in real app, this would come from API
      const mockSubmissions: Submission[] = [
        {
          id: '1',
          title: 'Mathematics Problem Set 3',
          description: 'Solutions to calculus integration problems',
          authorId: 'user2',
          authorName: 'Alice Johnson',
          type: 'assignment',
          content: 'Detailed solutions with step-by-step explanations...',
          submittedAt: new Date(Date.now() - 86400000),
          status: 'reviewing',
          reviews: [
            {
              id: 'r1',
              reviewerId: 'user3',
              reviewerName: 'Bob Smith',
              submissionId: '1',
              rating: 4,
              comments: 'Great work on the integration techniques!',
              strengths: ['Clear explanations', 'Correct methodology'],
              improvements: ['Add more examples', 'Include alternative approaches'],
              isAnonymous: false,
              createdAt: new Date(Date.now() - 3600000),
              helpful: 2
            }
          ],
          averageRating: 4,
          reviewCount: 1
        },
        {
          id: '2',
          title: 'History Essay: World War II',
          description: 'Analysis of key events and their impact',
          authorId: 'user4',
          authorName: 'Charlie Brown',
          type: 'essay',
          content: 'Comprehensive analysis of WWII events...',
          submittedAt: new Date(Date.now() - 172800000),
          status: 'pending',
          reviews: [],
          reviewCount: 0
        }
      ];

      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  }, []);

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

    socketInstance.on('peer-review-submitted', (_data) => {
      // Refresh submissions when a new review is submitted
      loadSubmissions();
    });

    socketRef.current = socketInstance;

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, loadSubmissions]);

  // Submit review
  const submitReview = async () => {
    if (!selectedSubmission) return;

    try {
      const review: Review = {
        id: Date.now().toString(),
        reviewerId: userId,
        reviewerName: 'You', // In real app, get from user data
        submissionId: selectedSubmission.id,
        rating: reviewForm.rating,
        comments: reviewForm.comments,
        strengths: reviewForm.strengths,
        improvements: reviewForm.improvements,
        isAnonymous: reviewForm.isAnonymous,
        createdAt: new Date(),
        helpful: 0
      };

      // In real app, send to API
      socketRef.current?.emit('submit-peer-review', {
        submissionId: selectedSubmission.id,
        rating: reviewForm.rating,
        comments: reviewForm.comments
      });

      // Update local state
      setSubmissions(prev => prev.map(sub =>
        sub.id === selectedSubmission.id
          ? {
              ...sub,
              reviews: [...sub.reviews, review],
              reviewCount: sub.reviewCount + 1,
              averageRating: ((sub.averageRating || 0) * sub.reviewCount + reviewForm.rating) / (sub.reviewCount + 1)
            }
          : sub
      ));

      // Reset form
      setReviewForm({
        rating: 0,
        comments: '',
        strengths: [],
        improvements: [],
        isAnonymous: false
      });

      setShowReviewDialog(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  // Filter and sort submissions
  const getFilteredSubmissions = () => {
    let filtered = submissions;

    if (filter !== 'all') {
      filtered = filtered.filter(sub => sub.status === filter);
    }

    // Don't show user's own submissions for review
    filtered = filtered.filter(sub => sub.authorId !== userId);

    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
      case 'oldest':
        return filtered.sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());
      case 'rating':
        return filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      case 'reviews':
        return filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      default:
        return filtered;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'project': return <Award className="h-4 w-4" />;
      case 'quiz': return <CheckCircle className="h-4 w-4" />;
      case 'essay': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Render star rating
  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Peer Review</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{submissions.length}</div>
                <div className="text-sm text-gray-600">Total Submissions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {submissions.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {submissions.reduce((acc, s) => acc + s.reviewCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {submissions.filter(s => s.averageRating).length > 0
                    ? (submissions.reduce((acc, s) => acc + (s.averageRating || 0), 0) /
                       submissions.filter(s => s.averageRating).length).toFixed(1)
                    : '0.0'
                  }
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Review Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Select value={filter} onValueChange={(value: string) => setFilter(value as typeof filter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Under Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(submission.type)}
                      <h3 className="font-medium">{submission.title}</h3>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{submission.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-xs">
                            {submission.authorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {submission.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(submission.submittedAt, 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {submission.reviewCount} reviews
                      </span>
                      {submission.averageRating && (
                        <div className="flex items-center gap-1">
                          {renderStars(submission.averageRating)}
                          <span>({submission.averageRating.toFixed(1)})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setShowReviewDialog(true);
                    }}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Review
                  </Button>
                </div>
              </motion.div>
            ))}

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No submissions available for review</p>
                <p className="text-xs text-gray-400 mt-1">
                  Check back later for new submissions to review
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Submission Details */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">{selectedSubmission.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedSubmission.description}</p>
                <div className="text-xs text-gray-500">
                  by {selectedSubmission.authorName} • {format(selectedSubmission.submittedAt, 'MMM d, yyyy')}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {renderStars(reviewForm.rating, true, (rating) =>
                    setReviewForm(prev => ({ ...prev, rating }))
                  )}
                  <span className="text-sm text-gray-600">
                    {reviewForm.rating > 0 ? `${reviewForm.rating} stars` : 'Select rating'}
                  </span>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Comments</label>
                <Textarea
                  placeholder="Provide constructive feedback..."
                  value={reviewForm.comments}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comments: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Strengths</label>
                <Textarea
                  placeholder="What did they do well? (one per line)"
                  value={reviewForm.strengths.join('\n')}
                  onChange={(e) => setReviewForm(prev => ({
                    ...prev,
                    strengths: e.target.value.split('\n').filter(s => s.trim())
                  }))}
                  rows={3}
                />
              </div>

              {/* Improvements */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Areas for Improvement</label>
                <Textarea
                  placeholder="What could be improved? (one per line)"
                  value={reviewForm.improvements.join('\n')}
                  onChange={(e) => setReviewForm(prev => ({
                    ...prev,
                    improvements: e.target.value.split('\n').filter(s => s.trim())
                  }))}
                  rows={3}
                />
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={reviewForm.isAnonymous}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                />
                <label htmlFor="anonymous" className="text-sm">
                  Submit anonymously
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submitReview}
                  disabled={!reviewForm.rating || !reviewForm.comments.trim()}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}