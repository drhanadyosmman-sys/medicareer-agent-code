// ChatPanel — WhatsApp-style messaging between admin and applicant
// Design: Navy/teal premium medical aesthetic

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Message, DoctorApplication } from '@/lib/store';
import { Send, CheckCheck, Check } from 'lucide-react';

interface ChatPanelProps {
  application: DoctorApplication;
  viewerRole: 'admin' | 'user';
  onUpdate?: (updated: DoctorApplication) => void;
  compact?: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  messages.forEach(msg => {
    const date = formatDate(msg.createdAt);
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ date, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  });
  return groups;
}

export default function ChatPanel({ application, viewerRole, onUpdate, compact = false }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(application.messages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applicationId = parseInt(application.id);
  const isValidId = !isNaN(applicationId) && applicationId > 0;

  // tRPC mutations
  const sendMessageMutation = trpc.applications.sendMessage.useMutation();
  const markReadMutation = trpc.applications.markMessagesRead.useMutation();

  // Fetch messages from server
  const { data: serverApp } = trpc.applications.byId.useQuery(
    { id: applicationId },
    { enabled: isValidId, refetchInterval: 10000 } // Poll every 10s for new messages
  );

  // Sync server messages to local state
  useEffect(() => {
    if (serverApp?.messages) {
      const mapped: Message[] = serverApp.messages.map((m: any) => ({
        id: String(m.id),
        from: m.sender as 'admin' | 'user',
        content: m.content,
        createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : '',
        read: !!m.readAt,
      }));
      setMessages(mapped);
    }
  }, [serverApp?.messages]);

  // Mark messages as read when panel opens
  useEffect(() => {
    if (isValidId) {
      markReadMutation.mutate({ applicationId });
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !isValidId) return;
    setSending(true);
    const msgContent = newMessage.trim();

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      from: viewerRole,
      content: msgContent,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');

    try {
      await sendMessageMutation.mutateAsync({
        applicationId,
        content: msgContent,
      });
    } catch (err) {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(msgContent);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const groups = groupMessagesByDate(messages);
  const unreadCount = messages.filter(m =>
    m.from === (viewerRole === 'admin' ? 'user' : 'admin') && !m.read
  ).length;

  const receiverName = viewerRole === 'admin' ? application.fullName : 'Career Consultant';

  return (
    <div className={`flex flex-col ${compact ? 'h-[480px]' : 'h-[600px]'} bg-white rounded-xl overflow-hidden border border-border`}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 bg-navy text-white border-b border-white/10 shrink-0">
        <div className="w-9 h-9 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-teal">
            {viewerRole === 'admin'
              ? application.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : 'MC'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{receiverName}</p>
          <p className="text-xs text-white/60">
            {viewerRole === 'user' ? 'MediCareer Agent — Career Consultancy' : application.specialtyInterest}
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-teal text-white text-xs">{unreadCount} new</Badge>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ background: 'oklch(0.98 0.003 240)' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-3">
                <Send className="w-5 h-5 text-navy/30" />
              </div>
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                {viewerRole === 'user' ? 'Our team will be in touch shortly.' : 'Send a message to get started.'}
              </p>
            </div>
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={gi}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground bg-white px-2 py-0.5 rounded-full border border-border">{group.date}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Messages in this group */}
              <div className="space-y-2">
                {group.messages.map((msg, mi) => {
                  const isOwn = msg.from === viewerRole;
                  const isAdmin = msg.from === 'admin';
                  const showSender = mi === 0 || group.messages[mi - 1]?.from !== msg.from;

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        {showSender && !isOwn && (
                          <span className="text-xs font-medium text-navy mb-1 ml-1">
                            {isAdmin ? 'Career Consultant' : application.fullName}
                          </span>
                        )}
                        <div className={`
                          relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                          ${isOwn
                            ? 'bg-navy text-white rounded-br-sm'
                            : 'bg-white text-foreground rounded-bl-sm shadow-sm border border-border/50'
                          }
                        `}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-[10px] ${isOwn ? 'text-white/60' : 'text-muted-foreground'}`}>
                              {formatTime(msg.createdAt)}
                            </span>
                            {isOwn && (
                              msg.read
                                ? <CheckCheck className="w-3 h-3 text-teal" />
                                : <Check className="w-3 h-3 text-white/60" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-border shrink-0">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={viewerRole === 'user' ? 'Message your consultant...' : `Message ${application.fullName.split(' ')[0]}...`}
            className="min-h-[44px] max-h-[120px] resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-navy hover:bg-navy/90 text-white h-11 w-11 p-0 shrink-0 btn-press rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 ml-1">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
}
