import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LeadTable from './LeadTable';
import SendMessageModal from './SendMessageModal';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Download,
  LogOut,
  Building2,
  Clock
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

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Sample data - in real app this would come from API
  useEffect(() => {
    const sampleLeads: Lead[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        message: 'Interested in your product pricing',
        timestamp: new Date(Date.now() - 3600000),
        status: 'new'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 987-6543',
        message: 'Need more information about your services',
        timestamp: new Date(Date.now() - 7200000),
        status: 'contacted'
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike.davis@company.com',
        phone: '+1 (555) 456-7890',
        message: 'Looking for enterprise solutions',
        timestamp: new Date(Date.now() - 10800000),
        status: 'new'
      },
      {
        id: '4',
        name: 'Emily Chen',
        email: 'emily.chen@startup.io',
        phone: '+1 (555) 321-0987',
        message: 'Demo request for our team',
        timestamp: new Date(Date.now() - 14400000),
        status: 'converted'
      }
    ];
    setLeads(sampleLeads);
  }, []);

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(lead => lead.status === 'new').length,
    contacted: leads.filter(lead => lead.status === 'contacted').length,
    converted: leads.filter(lead => lead.status === 'converted').length
  };

  const handleSendMessage = (lead: Lead) => {
    setSelectedLead(lead);
    setShowMessageModal(true);
  };

  const handleExportLeads = () => {
    // In real app, this would trigger CSV/Excel download
    const csvContent = [
      'Name,Email,Phone,Message,Date,Status',
      ...leads.map(lead => 
        `${lead.name},${lead.email},${lead.phone},"${lead.message}",${lead.timestamp.toLocaleString()},${lead.status}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 gradient-primary rounded-xl shadow-glow">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Lead Management</h1>
              <p className="text-sm text-muted-foreground">Modern Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleExportLeads}
              variant="outline"
              size="sm"
              className="hidden sm:flex border-border/50 hover:bg-accent/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={onLogout} variant="outline" size="sm" className="border-border/50 hover:bg-accent/50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Hi, Admin 👋
          </h2>
          <p className="text-muted-foreground">Welcome to Lead Management</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-grid mb-8">
          <div className="stat-card-gradient-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">
                  TOTAL LEADS
                </p>
                <div className="text-3xl font-bold text-white mt-2">{stats.totalLeads}</div>
                <p className="text-xs text-white/60 mt-1">All time leads</p>
              </div>
              <Users className="h-8 w-8 text-white/80" />
            </div>
          </div>

          <div className="stat-card-gradient-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">
                  NEW LEADS
                </p>
                <div className="text-3xl font-bold text-white mt-2">{stats.newLeads}</div>
                <p className="text-xs text-white/60 mt-1">Require attention</p>
              </div>
              <Clock className="h-8 w-8 text-white/80" />
            </div>
          </div>

          <div className="stat-card-gradient-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">
                  CONTACTED
                </p>
                <div className="text-3xl font-bold text-white mt-2">{stats.contacted}</div>
                <p className="text-xs text-white/60 mt-1">In progress</p>
              </div>
              <MessageCircle className="h-8 w-8 text-white/80" />
            </div>
          </div>

          <div className="stat-card-gradient-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">
                  CONVERTED
                </p>
                <div className="text-3xl font-bold text-white mt-2">{stats.converted}</div>
                <p className="text-xs text-white/60 mt-1">Success rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-white/80" />
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <Card className="data-table">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Leads</CardTitle>
              <Badge variant="secondary" className="ml-auto">
                {leads.length} leads
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <LeadTable 
              leads={leads} 
              onSendMessage={handleSendMessage}
              onUpdateStatus={(leadId, status) => {
                setLeads(prev => 
                  prev.map(lead => 
                    lead.id === leadId ? { ...lead, status } : lead
                  )
                );
              }}
            />
          </CardContent>
        </Card>
      </main>

      {/* Send Message Modal */}
      {showMessageModal && selectedLead && (
        <SendMessageModal
          lead={selectedLead}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedLead(null);
          }}
          onSent={() => {
            // Update lead status to contacted
            if (selectedLead) {
              setLeads(prev => 
                prev.map(lead => 
                  lead.id === selectedLead.id ? { ...lead, status: 'contacted' } : lead
                )
              );
            }
            setShowMessageModal(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;