import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Mail, Send, User, Phone, X } from 'lucide-react';

import { sendMessage, Lead } from '@/utils/api';

interface SendMessageModalProps {
  lead: Lead;
  onClose: () => void;
  onSent: () => void;
}

const SendMessageModal = ({ lead, onClose, onSent }: SendMessageModalProps) => {
  const [messageType, setMessageType] = useState<'email' | 'whatsapp' | 'both'>('email');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const defaultMessages = {
    email: `Hi ${lead.fullName || 'there'},\n\nThank you for your interest in our services. We received your inquiry.\n\nOur sales team will contact you within 24 hours.\n\nBest regards,\nSales Team`,
    whatsapp: `Hi ${lead.fullName || 'there'}! 👋\n\nThanks for reaching out! We got your message.\n\nOur team will call you within 24 hours.\n\nHave a great day! 😊`,
  };

  const handleSendMessage = async () => {
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      const message = customMessage || (messageType === 'email' ? defaultMessages.email : defaultMessages.whatsapp);

      // Send message via API
      await sendMessage(lead._id, messageType, message, token);

      toast({
        title: `${messageType === 'email' ? 'Email' : messageType === 'whatsapp' ? 'WhatsApp' : 'Email & WhatsApp'} Sent Successfully`,
        description: `Message sent to ${lead.fullName || 'lead'}`,
      });

      onSent();
    } catch (err) {
      console.error('Message send error:', err);
      toast({
        title: 'Failed to send',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>Send Message</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Lead Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{lead.fullName}</span>
            <Badge variant="secondary" className="ml-auto">{lead.status}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{lead.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          </div>

          {lead.rawData?.message && (
            <div className="text-sm">
              <span className="text-muted-foreground">Original message: </span>
              <span className="text-foreground">"{lead.rawData.message}"</span>
            </div>
          )}
        </div>

        {/* Message Form */}
        <div className="space-y-4 mt-4">
          <Label className="block text-sm font-medium">Choose Message Type</Label>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant={messageType === 'email' ? 'default' : 'outline'}
              onClick={() => setMessageType('email')}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" /> Email
            </Button>
            <Button
              type="button"
              variant={messageType === 'whatsapp' ? 'default' : 'outline'}
              onClick={() => setMessageType('whatsapp')}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
            </Button>
            <Button
              type="button"
              variant={messageType === 'both' ? 'default' : 'outline'}
              onClick={() => setMessageType('both')}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-1" />
              <MessageCircle className="h-4 w-4 mr-1" /> Both
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message Content</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write your custom message..."
              className="min-h-[120px]"
            />

            <div className="bg-muted/30 rounded-md p-3 border border-dashed">
              <div className="text-xs font-medium mb-1">Default Template:</div>
              <pre className="text-sm whitespace-pre-line">
                {messageType === 'email' ? defaultMessages.email : defaultMessages.whatsapp}
              </pre>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSendMessage} disabled={sending} className="gradient-primary">
            {sending ? 'Sending...' : <><Send className="h-4 w-4 mr-2" /> Send</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageModal;
