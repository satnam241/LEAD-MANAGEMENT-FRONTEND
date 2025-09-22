// Lead Management Application - Welcome Page

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, MessageCircle, TrendingUp, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-8 gradient-primary rounded-3xl">
            <Building2 className="h-10 w-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Lead Management
            <span className="block text-primary">Made Simple</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Capture, manage, and convert leads from Facebook Ads with automated messaging 
            and a powerful admin dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="gradient-primary hover:opacity-90 transition-opacity"
              onClick={() => window.location.href = '/login'}
            >
              Access Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Streamline your lead management process with our comprehensive solution
            </p>
          </div>

          <div className="dashboard-grid">
            <Card className="stat-card text-center">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-xl">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Lead Capture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically receive and store leads from Facebook Ads with webhook integration
                </p>
              </CardContent>
            </Card>

            <Card className="stat-card text-center">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-xl">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Auto Messaging</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Send automated email and WhatsApp messages to new leads instantly
                </p>
              </CardContent>
            </Card>

            <Card className="stat-card text-center">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track lead status, conversion rates, and export data for analysis
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <Card className="max-w-2xl mx-auto card-shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-muted-foreground mb-6">
                Access your admin dashboard to start managing leads effectively
              </p>
              <Button 
                size="lg" 
                className="gradient-primary hover:opacity-90 transition-opacity"
                onClick={() => window.location.href = '/login'}
              >
                Login to Dashboard
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                Demo credentials: admin@company.com / admin123
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
