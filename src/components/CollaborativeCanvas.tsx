'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Rect, Circle as FabricCircle, Textbox } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Pen,
  Square,
  Circle,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Users,
  Save,
  Trash2
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface CollaborativeCanvasProps {
  canvasId: string;
  groupId: string;
  userId: string;
  userName: string;
  className?: string;
}

interface CanvasUser {
  id: string;
  name: string;
  cursor: { x: number; y: number };
  color: string;
}

interface DrawingOperation {
  id: string;
  type: 'add' | 'modify' | 'delete';
  object: Record<string, unknown>;
  userId: string;
  timestamp: number;
}

export function CollaborativeCanvas({
  canvasId,
  groupId,
  userId,
  userName,
  className = ''
}: CollaborativeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [activeTool, setActiveTool] = useState<'pen' | 'rectangle' | 'circle' | 'text' | 'eraser'>('pen');
  const [connectedUsers, setConnectedUsers] = useState<CanvasUser[]>([]);
  const [zoom, setZoom] = useState(1);
  const [isConnected, setIsConnected] = useState(false);

  // Load existing canvas elements
  const loadCanvasElements = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups/canvases/${canvasId}/elements`);
      if (!response.ok) return;

      const elements = await response.json();
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      elements.forEach((element: Record<string, unknown>) => {
        let obj;
        switch (element.type as string) {
          case 'text':
            obj = new Textbox(element.content as string, {
              left: element.positionX as number,
              top: element.positionY as number,
              width: element.width as number,
              height: element.height as number,
            });
            break;
          case 'rectangle':
            obj = new Rect({
              left: element.positionX as number,
              top: element.positionY as number,
              width: element.width as number,
              height: element.height as number,
              fill: 'transparent',
              stroke: '#000000',
              strokeWidth: 2,
            });
            break;
          case 'circle':
            obj = new FabricCircle({
              left: element.positionX as number,
              top: element.positionY as number,
              radius: Math.min(element.width as number, element.height as number) / 2,
              fill: 'transparent',
              stroke: '#000000',
              strokeWidth: 2,
            });
            break;
          default:
            return;
        }

        if (obj) {
          canvas.add(obj);
        }
      });

      canvas.renderAll();
    } catch (error) {
      console.error('Failed to load canvas elements:', error);
    }
  }, [canvasId]);

  // Handle remote drawing operations
  const handleRemoteOperation = useCallback((operation: DrawingOperation) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Skip operations from current user to avoid duplication
    if (operation.userId === userId) return;

    switch (operation.type) {
      case 'add':
        // For now, just log the operation - full implementation needs more work
        console.log('Remote operation received:', operation);
        break;
      case 'modify':
        // Handle object modifications
        break;
      case 'delete':
        // Handle object deletions
        break;
    }
  }, [userId]);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: { userId, groupId }
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-canvas', { canvasId, userId, userName });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('user-joined-canvas', (user: CanvasUser) => {
      setConnectedUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    });

    socket.on('user-left-canvas', (userId: string) => {
      setConnectedUsers(prev => prev.filter(u => u.id !== userId));
    });

    socket.on('drawing-operation', (operation: DrawingOperation) => {
      handleRemoteOperation(operation);
    });

    socket.on('cursor-update', (data: { userId: string; cursor: { x: number; y: number } }) => {
      setConnectedUsers(prev =>
        prev.map(user =>
          user.id === data.userId
            ? { ...user, cursor: data.cursor }
            : user
        )
      );
    });

    socketRef.current = socket;
  }, [canvasId, userId, userName, groupId, handleRemoteOperation]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Load existing canvas elements
    loadCanvasElements();

    // Initialize socket connection
    initializeSocket();

    return () => {
      canvas.dispose();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [canvasId, loadCanvasElements, initializeSocket]);

  // Send drawing operation to server
  const sendOperation = useCallback((operation: DrawingOperation) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('drawing-operation', operation);
    }
  }, [isConnected]);

  // Tool handlers
  const handleToolChange = useCallback((tool: typeof activeTool) => {
    setActiveTool(tool);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = tool === 'pen';
    canvas.selection = tool !== 'pen';

    if (tool === 'eraser') {
      canvas.hoverCursor = 'not-allowed';
    } else {
      canvas.hoverCursor = 'default';
    }
  }, []);

  // Mouse move handler for cursor tracking
  const handleMouseMove = useCallback(() => {
    if (socketRef.current && isConnected) {
      // TODO: Implement cursor tracking with correct Fabric.js v7 API
      // const pointer = fabricCanvasRef.current?.getPointer(e);
      // if (pointer) {
      //   socketRef.current.emit('cursor-update', {
      //     userId,
      //     cursor: { x: pointer.x, y: pointer.y }
      //   });
      // }
    }
  }, [isConnected]);

  // Object added handler
  const handleObjectAdded = useCallback((e: { target?: unknown }) => {
    if (e.target) {
      const operation: DrawingOperation = {
        id: Date.now().toString(),
        type: 'add',
        object: e.target as Record<string, unknown>,
        userId,
        timestamp: Date.now()
      };
      sendOperation(operation);
    }
  }, [userId, sendOperation]);

  // Setup canvas event listeners
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.on('mouse:move', handleMouseMove);
    canvas.on('object:added', handleObjectAdded);

    return () => {
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('object:added', handleObjectAdded);
    };
  }, [handleMouseMove, handleObjectAdded]);

  // Add shape functions
  const addRectangle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const rect = new Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
  };

  const addCircle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const circle = new FabricCircle({
      left: 100,
      top: 100,
      radius: 50,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
  };

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new Textbox('Enter text', {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 20,
      fill: '#000000',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
  };

  // Zoom functions
  const handleZoomIn = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const newZoom = Math.min(zoom * 1.2, 3);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const newZoom = Math.max(zoom / 1.2, 0.1);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const handleResetZoom = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setZoom(1);
    setZoom(1);
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  };

  // Clear canvas
  const handleClearCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
  };

  // Save canvas
  const handleSaveCanvas = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      // Get all objects and save them individually
      const objects = canvas.getObjects();
      
      for (const obj of objects) {
        // Normalize the type to match API expectations
        let elementType = obj.type;
        if (obj.type === 'textbox') elementType = 'text';
        if (obj.type === 'rect') elementType = 'rectangle';
        
        const elementData = {
          type: elementType,
          content: obj.type === 'textbox' ? (obj as Textbox).text : '',
          position: {
            x: obj.left || 0,
            y: obj.top || 0,
          },
          size: {
            width: obj.width || 0,
            height: obj.height || 0,
          },
        };

        // Save each element individually to backend
        const response = await fetch(`/api/groups/canvases/${canvasId}/elements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(elementData),
        });

        if (!response.ok) {
          throw new Error(`Failed to save element: ${response.statusText}`);
        }
      }

      alert('Canvas saved successfully!');
    } catch (error) {
      console.error('Failed to save canvas:', error);
      alert('Failed to save canvas');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Collaborative Canvas</h3>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm text-gray-600">
            {connectedUsers.length + 1} online
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={activeTool === 'pen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolChange('pen')}
            >
              <Pen className="h-4 w-4" />
            </Button>

            <Button
              variant={activeTool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                handleToolChange('rectangle');
                addRectangle();
              }}
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button
              variant={activeTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                handleToolChange('circle');
                addCircle();
              }}
            >
              <Circle className="h-4 w-4" />
            </Button>

            <Button
              variant={activeTool === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                handleToolChange('text');
                addText();
              }}
            >
              <Type className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <Button variant="outline" size="sm" onClick={handleSaveCanvas}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>

            <Button variant="outline" size="sm" onClick={handleClearCanvas}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Container */}
      <Card>
        <CardContent className="p-4">
          <div className="relative border border-gray-200 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="border-0"
              style={{ display: 'block' }}
            />

            {/* User Cursors */}
            {connectedUsers.map((user) => (
              <div
                key={user.id}
                className="absolute pointer-events-none z-10"
                style={{
                  left: user.cursor.x,
                  top: user.cursor.y,
                  transform: 'translate(-2px, -2px)'
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: user.color }}
                />
                <div className="absolute top-5 left-2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {user.name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connected Users List */}
      {connectedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Online Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {connectedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: user.color }}
                  />
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}