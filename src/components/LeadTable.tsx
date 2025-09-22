import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle, Phone, Mail, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Lead } from '@/utils/API';

interface LeadTableProps {
  leads: Lead[];
  onSendMessage: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
}

const LeadTable = ({ leads, onSendMessage, onUpdateStatus }: LeadTableProps) => {
  const getStatusBadgeVariant = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'default';
      case 'contacted':
        return 'secondary';
      case 'converted':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'text-warning';
      case 'contacted':
        return 'text-primary';
      case 'converted':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No leads yet</h3>
            <p className="text-muted-foreground">
              When you receive leads from Facebook Ads, they'll appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-muted/50">
               <TableCell>
    <div className="font-medium">{lead.fullName}</div>
  </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 mr-1" />
                    {lead.email}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 mr-1" />
                    {lead.phone}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <p className="text-sm truncate max-w-xs" title={lead.message}>
                  {lead.message}
                </p>
              </TableCell>

              <TableCell>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {lead.createdAt
                    ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })
                    : 'N/A'}
                </div>
              </TableCell>

              <TableCell>
              <Select
  value={lead.status}
  onValueChange={(value: Lead['status']) => onUpdateStatus(lead._id, value)} // 👈 fix here
>

                  <SelectTrigger className="w-32">
                    <SelectValue>
                      <Badge
                        variant={getStatusBadgeVariant(lead.status)}
                        className={getStatusColor(lead.status)}
                      >
                        {lead.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell className="text-right">
                <Button
                  onClick={() => onSendMessage(lead)}
                  size="sm"
                  variant="outline"
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadTable;
