import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, Loader2, Archive, Eye, Trash2, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read?: boolean;
  archived?: boolean;
}

const MessagesManager: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      try {
        console.log('Fetching messages...');
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Fetched messages:', data);
        return data || [];
      } catch (error) {
        console.error('Error in query:', error);
        throw error;
      }
    },
    retry: false // Disable retries to prevent unnecessary API calls
  });

  // Mark as read mutation
  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Message> }) => {
      const { data, error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({
        title: "Message deleted",
        description: "The message has been permanently deleted."
      });
    }
  });

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      await updateMessageMutation.mutateAsync({
        id: message.id,
        updates: { read: true }
      });
    }
  };

  const handleArchive = async (message: Message) => {
    await updateMessageMutation.mutateAsync({
      id: message.id,
      updates: { archived: !message.archived }
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessageMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Messages ({messages?.length || 0})</CardTitle>
          <CardDescription>View and manage customer messages</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading messages</p>
              <p className="text-sm">{error.toString()}</p>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages && messages.length > 0 ? (
                      messages.map((message) => (
                        <TableRow key={message.id} className={!message.read ? 'bg-blue-50/50' : undefined}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(message.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{message.name}</div>
                              <div className="text-sm text-gray-500 truncate">{message.email}</div>
                              {/* Show subject on mobile where it's hidden from header */}
                              <div className="md:hidden text-sm text-gray-500 mt-1">
                                {message.subject || '(No subject)'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{message.subject || '(No subject)'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {!message.read && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  New
                                </Badge>
                              )}
                              {message.archived && (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                  Archived
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <ShadcnButton
                                size="icon"
                                variant="outline"
                                onClick={() => handleMessageClick(message)}
                              >
                                <Eye className="h-4 w-4" />
                              </ShadcnButton>
                              <ShadcnButton
                                size="icon"
                                variant="outline"
                                onClick={() => handleArchive(message)}
                                className="hidden sm:inline-flex"
                              >
                                <Archive className="h-4 w-4" />
                              </ShadcnButton>
                              <ShadcnButton
                                size="icon"
                                variant="destructive"
                                onClick={() => handleDelete(message.id)}
                                className="hidden sm:inline-flex"
                              >
                                <Trash2 className="h-4 w-4" />
                              </ShadcnButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No messages found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`bg-white rounded-lg border p-4 space-y-3 ${
                        !message.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{message.name}</p>
                          <p className="text-sm text-gray-500">{message.email}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {message.subject || '(No subject)'}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {message.message}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!message.read && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                        {message.archived && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            Archived
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <ShadcnButton 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleMessageClick(message)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </ShadcnButton>
                        <ShadcnButton 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleArchive(message)}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          {message.archived ? 'Unarchive' : 'Archive'}
                        </ShadcnButton>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No messages found
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <div className="font-medium text-gray-500">From</div>
                <div className="mt-1">
                  <div className="font-medium">{selectedMessage.name}</div>
                  <div className="text-sm text-gray-600">{selectedMessage.email}</div>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Subject</div>
                <div className="mt-1">{selectedMessage.subject || '(No subject)'}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Message</div>
                <div className="mt-1 whitespace-pre-wrap">{selectedMessage.message}</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>
                  Received {new Date(selectedMessage.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesManager;
