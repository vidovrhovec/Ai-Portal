import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

interface ServerToClientEvents {
  'canvas-update': (data: { canvasId: string; elements: any[]; userId: string }) => void;
  'message-received': (data: { message: any; groupId: string }) => void;
  'user-joined': (data: { userId: string; groupId: string; user: any }) => void;
  'user-left': (data: { userId: string; groupId: string }) => void;
  'screen-share-started': (data: { userId: string; groupId: string; streamId: string }) => void;
  'screen-share-stopped': (data: { userId: string; groupId: string }) => void;
  'peer-review-submitted': (data: { reviewId: string; submissionId: string; reviewerId: string }) => void;
  'user-joined-canvas': (data: { userId: string; userName: string; canvasId: string; color: string }) => void;
  'user-left-canvas': (data: { userId: string; canvasId: string }) => void;
  'drawing-operation': (data: { operation: any; canvasId: string }) => void;
  'cursor-update': (data: { userId: string; cursor: { x: number; y: number }; canvasId: string }) => void;
  'room-updated': (data: any) => void;
  'user-joined-room': (data: { user: any; roomId: string }) => void;
  'user-left-room': (data: { userId: string; roomId: string }) => void;
  'room-message-received': (data: { message: any; roomId: string }) => void;
}

interface ClientToServerEvents {
  'join-canvas': (data: { canvasId: string; userId: string; userName: string }) => void;
  'leave-canvas': (data: { canvasId: string }) => void;
  'canvas-element-update': (data: { canvasId: string; element: any }) => void;
  'drawing-operation': (data: { operation: any; canvasId: string }) => void;
  'cursor-update': (data: { userId: string; cursor: { x: number; y: number }; canvasId: string }) => void;
  'join-group': (groupId: string) => void;
  'leave-group': (groupId: string) => void;
  'send-message': (data: { groupId: string; message: string; type?: string }) => void;
  'start-screen-share': (data: { groupId: string; streamId: string }) => void;
  'stop-screen-share': (data: { groupId: string }) => void;
  'submit-peer-review': (data: { submissionId: string; rating: number; comments: string }) => void;
  'join-study-room': (data: { roomId: string; userId: string; userName: string }) => void;
  'leave-study-room': (data: { roomId: string }) => void;
  'send-room-message': (data: { roomId: string; message: string; userId: string; userName: string }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
  groupId?: string;
  canvasId?: string;
  roomId?: string;
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

export function initSocketIO(httpServer: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Canvas real-time sync
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Canvas events
    socket.on('join-canvas', (data: { canvasId: string; userId: string; userName: string }) => {
      socket.data.canvasId = data.canvasId;
      socket.data.userId = data.userId;
      socket.join(`canvas-${data.canvasId}`);
      console.log(`User ${socket.id} joined canvas ${data.canvasId}`);

      // Notify others in the canvas
      socket.to(`canvas-${data.canvasId}`).emit('user-joined-canvas', {
        userId: data.userId,
        userName: data.userName,
        canvasId: data.canvasId,
        color: '#FF6B6B' // Default color, could be randomized
      });
    });

    socket.on('leave-canvas', (data: { canvasId: string }) => {
      socket.to(`canvas-${data.canvasId}`).emit('user-left-canvas', {
        userId: socket.data.userId,
        canvasId: data.canvasId
      });
      socket.leave(`canvas-${data.canvasId}`);
      socket.data.canvasId = undefined;
      console.log(`User ${socket.id} left canvas ${data.canvasId}`);
    });

    socket.on('drawing-operation', (data: { operation: any; canvasId: string }) => {
      // Broadcast drawing operation to all other users in the canvas
      socket.to(`canvas-${data.canvasId}`).emit('drawing-operation', {
        operation: data.operation,
        canvasId: data.canvasId
      });
    });

    socket.on('cursor-update', (data: { userId: string; cursor: { x: number; y: number }; canvasId: string }) => {
      // Broadcast cursor position to all other users in the canvas
      socket.to(`canvas-${data.canvasId}`).emit('cursor-update', {
        userId: data.userId,
        cursor: data.cursor,
        canvasId: data.canvasId
      });
    });

    socket.on('canvas-element-update', (data) => {
      socket.to(`canvas-${data.canvasId}`).emit('canvas-update', {
        canvasId: data.canvasId,
        elements: [data.element],
        userId: socket.data.userId
      });
    });

    // Group chat events
    socket.on('join-group', (groupId: string) => {
      socket.data.groupId = groupId;
      socket.join(`group-${groupId}`);
      console.log(`User ${socket.id} joined group ${groupId}`);

      // Notify others in the group
      socket.to(`group-${groupId}`).emit('user-joined', {
        userId: socket.data.userId,
        groupId,
        user: { id: socket.data.userId }
      });
    });

    socket.on('leave-group', (groupId: string) => {
      socket.leave(`group-${groupId}`);
      socket.data.groupId = undefined;
      console.log(`User ${socket.id} left group ${groupId}`);

      // Notify others in the group
      socket.to(`group-${groupId}`).emit('user-left', {
        userId: socket.data.userId,
        groupId
      });
    });

    socket.on('send-message', async (data) => {
      try {
        // Here you would save the message to database
        const message = {
          id: Date.now().toString(),
          content: data.message,
          userId: socket.data.userId,
          groupId: data.groupId,
          type: data.type || 'text',
          timestamp: new Date()
        };

        // Broadcast to group
        io?.to(`group-${data.groupId}`).emit('message-received', {
          message,
          groupId: data.groupId
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Screen sharing events
    socket.on('start-screen-share', (data) => {
      socket.to(`group-${data.groupId}`).emit('screen-share-started', {
        userId: socket.data.userId,
        groupId: data.groupId,
        streamId: data.streamId
      });
    });

    socket.on('stop-screen-share', (data) => {
      socket.to(`group-${data.groupId}`).emit('screen-share-stopped', {
        userId: socket.data.userId,
        groupId: data.groupId
      });
    });

    // Peer review events
    socket.on('submit-peer-review', async (data) => {
      try {
        // Here you would save the review to database
        const review = {
          id: Date.now().toString(),
          submissionId: data.submissionId,
          reviewerId: socket.data.userId,
          rating: data.rating,
          comments: data.comments,
          timestamp: new Date()
        };

        // Notify the submission owner
        // This would require looking up who owns the submission
        io?.emit('peer-review-submitted', {
          reviewId: review.id,
          submissionId: data.submissionId,
          reviewerId: socket.data.userId
        });
      } catch (error) {
        console.error('Error submitting peer review:', error);
      }
    });

    // Study room events
    socket.on('join-study-room', (data) => {
      socket.data.roomId = data.roomId;
      socket.join(`study-room-${data.roomId}`);
      console.log(`User ${socket.id} joined study room ${data.roomId}`);

      // Notify others in the room
      socket.to(`study-room-${data.roomId}`).emit('user-joined-room', {
        user: { id: data.userId, name: data.userName },
        roomId: data.roomId
      });
    });

    socket.on('leave-study-room', (data) => {
      socket.to(`study-room-${data.roomId}`).emit('user-left-room', {
        userId: socket.data.userId,
        roomId: data.roomId
      });
      socket.leave(`study-room-${data.roomId}`);
      socket.data.roomId = undefined;
      console.log(`User ${socket.id} left study room ${data.roomId}`);
    });

    socket.on('send-room-message', async (data) => {
      try {
        const message = {
          id: Date.now().toString(),
          content: data.message,
          userId: data.userId,
          userName: data.userName,
          roomId: data.roomId,
          type: 'text',
          timestamp: new Date()
        };

        // Broadcast to room
        io?.to(`study-room-${data.roomId}`).emit('room-message-received', {
          message,
          roomId: data.roomId
        });
      } catch (error) {
        console.error('Error sending room message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Clean up group membership
      if (socket.data.groupId) {
        socket.to(`group-${socket.data.groupId}`).emit('user-left', {
          userId: socket.data.userId,
          groupId: socket.data.groupId
        });
      }

      // Clean up study room membership
      if (socket.data.roomId) {
        socket.to(`study-room-${socket.data.roomId}`).emit('user-left-room', {
          userId: socket.data.userId,
          roomId: socket.data.roomId
        });
      }
    });
  });

  return io;
}

export function getSocketIO() {
  return io;
}

// API route handler for Socket.io
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // This is handled by the Socket.io server
  res.status(200).json({ message: 'Socket.io server is running' });
}