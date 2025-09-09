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
import { 
  MessageCircle, 
  Mail, 
  Send, 
  User, 
  Phone,
  X
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: Date;
  status: 'new' | 'contacted' | 'converted';
}

interface SendMessageModalProps {
  lead: Lead;
  onClose: () => void;
  onSent: () => void;
}

const SendMessageModal = ({ lead, onClose, onSent }: SendMessageModalProps) => {
  const [messageType, setMessageType] = useState<'email' | 'whatsapp'>('email');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const defaultMessages = {
    email: `Hi ${lead.name},

Thank you for your interest in our services. We received your inquiry about "${lead.message}".

Our sales team will contact you within 24 hours to discuss your requirements in detail.

Business Hours: Monday-Saturday, 10AM–6PM

Best regards,
Sales Team`,
    
    whatsapp: `Hi ${lead.name}! 👋

Thanks for reaching out! We got your message: "${lead.message}"

Our team will call you within 24 hours.

Business Hours: Mon-Sat, 10AM-6PM

Have a great day! 😊`
  };

  const handleSendMessage = async () => {
    setSending(true);
    
    // Simulate API call
    setTimeout(() => {
      const message = customMessage || defaultMessages[messageType];
      
      toast({
        title: `${messageType === 'email' ? 'Email' : 'WhatsApp'} Sent Successfully`,
        description: `Message sent to ${lead.name} (${messageType === 'email' ? lead.email : lead.phone})`,
      });
      
      setSending(false);
      onSent();
    }, 1500);
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
            <span className="font-medium">{lead.name}</span>
            <Badge variant="secondary" className="ml-auto">
              {lead.status}
            </Badge>
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
          
          <div className="text-sm">
            <span className="text-muted-foreground">Original message: </span>
            <span className="text-foreground">"{lead.message}"</span>
          </div>
        </div>

        {/* Message Type Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Choose Message Type</Label>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant={messageType === 'email' ? 'default' : 'outline'}
                onClick={() => setMessageType('email')}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant={messageType === 'whatsapp' ? 'default' : 'outline'}
                onClick={() => setMessageType('whatsapp')}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message Content
            </Label>
            <Textarea
              id="message"
              placeholder={`Enter custom ${messageType} message or use the default template below...`}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[120px]"
            />
            
            {/* Default Template Preview */}
            <div className="bg-muted/30 rounded-md p-3 border border-dashed">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Default Template:
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {defaultMessages[messageType]}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSendMessage} disabled={sending} className="gradient-primary">
            {sending ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send {messageType === 'email' ? 'Email' : 'WhatsApp'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageModal;