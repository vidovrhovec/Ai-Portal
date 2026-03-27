'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Send,
  Bot,
  User,
  Loader2,
  Settings,
  Download,
  CheckCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useAIChat, useAIModels, useAIModelStatus, useAIModelDownload } from '@/hooks/use-ai';
import { OllamaMessage } from '@/lib/tauri-ai';

interface AIChatInterfaceProps {
  className?: string;
  initialModel?: string;
  showModelSelector?: boolean;
  showSettings?: boolean;
}

export function AIChatInterface({
  className = '',
  initialModel = 'llama2',
  showModelSelector = true,
  showSettings = true,
}: AIChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setModel,
    currentModel,
  } = useAIChat({
    model: initialModel,
    onError: (err) => {
      console.error('AI Chat Error:', err);
    },
  });

  const {
    models,
    isLoading: modelsLoading,
    error: modelsError,
    refresh: refreshModels,
  } = useAIModels();

  const {
    status: modelStatus,
    checkStatus,
  } = useAIModelStatus();

  const {
    isDownloading,
    progress: downloadProgress,
    downloadModel,
  } = useAIModelDownload();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check model status when model changes
  useEffect(() => {
    if (currentModel) {
      checkStatus(currentModel);
    }
  }, [currentModel, checkStatus]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModelChange = (modelName: string) => {
    setModel(modelName);
  };

  const handleDownloadModel = async (modelName: string) => {
    await downloadModel(modelName);
    // Refresh models list after download
    setTimeout(() => refreshModels(), 1000);
  };

  const getModelStatusBadge = (modelName: string) => {
    if (modelStatus?.model_name === modelName) {
      if (modelStatus.available) {
        return (
          <Badge variant="default" className="ml-2">
            <CheckCircle className="w-3 h-3 mr-1" />
            Available
          </Badge>
        );
      } else {
        return (
          <Badge variant="destructive" className="ml-2">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Available
          </Badge>
        );
      }
    }
    return null;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <h2 className="text-lg font-semibold">AI Chat</h2>
          {modelStatus && (
            <Badge variant={modelStatus.available ? "default" : "destructive"}>
              {modelStatus.source}
            </Badge>
          )}
        </div>

        {showSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettingsPanel && (
        <Card className="m-4 mb-0 p-4">
          <div className="space-y-4">
            {showModelSelector && (
              <div>
                <label className="text-sm font-medium mb-2 block">AI Model</label>
                <Select value={currentModel} onValueChange={handleModelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{model.name}</span>
                          {getModelStatusBadge(model.name)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshModels}
                disabled={modelsLoading}
              >
                {modelsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Refresh Models
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={clearMessages}
                disabled={messages.length === 0}
              >
                Clear Chat
              </Button>
            </div>

            {/* Download Progress */}
            {isDownloading && downloadProgress && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Downloading {downloadProgress.model_name}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(downloadProgress.progress || 0) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  {downloadProgress.status}
                  {downloadProgress.downloaded_size && downloadProgress.total_size && (
                    <span>
                      {' '}
                      ({Math.round(downloadProgress.downloaded_size / 1024 / 1024)}MB / {Math.round(downloadProgress.total_size / 1024 / 1024)}MB)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Models List with Download Buttons */}
            <div>
              <label className="text-sm font-medium mb-2 block">Available Models</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {models.map((model) => (
                  <div key={model.name} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-gray-500">
                        {model.details.family} • {model.details.parameter_size}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getModelStatusBadge(model.name)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadModel(model.name)}
                        disabled={isDownloading}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="m-4 mb-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {modelsError && (
        <Alert variant="destructive" className="m-4 mb-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load models: {modelsError}</AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Začnite pogovor z AI</p>
              <p className="text-sm">Izberite model in pošljite sporočilo za začetek</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI razmišlja...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Vnesite sporočilo..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Trenutni model: <strong>{currentModel}</strong>
          {modelStatus && (
            <span className="ml-2">
              • Status: {modelStatus.available ? 'Razpoložljiv' : 'Ni razpoložljiv'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: OllamaMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isUser ? 'Vi' : 'AI Pomočnik'}
          </span>
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}