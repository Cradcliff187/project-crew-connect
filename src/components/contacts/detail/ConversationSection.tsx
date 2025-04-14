import { MessageSquare, Send, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  date: Date;
  subject?: string;
  message: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  from: string;
}

interface ConversationSectionProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

const ConversationSection = ({ conversations, setConversations }: ConversationSectionProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendEmail = () => {
    if (!newMessage.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message before sending',
        variant: 'destructive',
      });
      return;
    }

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      date: new Date(),
      subject: 'New Message',
      message: newMessage,
      type: 'email',
      from: 'You',
    };

    setConversations([newConversation, ...conversations]);
    setNewMessage('');

    toast({
      title: 'Email Sent',
      description: 'Your message has been sent successfully',
    });
  };

  return (
    <div className="flex-1 flex flex-col p-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {conversations.map(conversation => (
            <div key={conversation.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{conversation.from}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {format(conversation.date, 'PPp')}
                  </span>
                </div>
                <div className="rounded-full bg-[#0485ea]/10 px-2 py-1 text-xs text-[#0485ea]">
                  {conversation.type}
                </div>
              </div>
              {conversation.subject && <h4 className="font-medium mb-1">{conversation.subject}</h4>}
              <p className="text-sm">{conversation.message}</p>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-1">No conversations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start a conversation by sending an email or making a call
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="flex flex-col gap-4">
          <Textarea
            placeholder="Write a message..."
            className="resize-none"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <div className="flex justify-between">
            <Button variant="outline" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button onClick={handleSendEmail} className="bg-[#0485ea] hover:bg-[#0375d1]">
              <Send className="mr-1 h-4 w-4" />
              Send Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationSection;
