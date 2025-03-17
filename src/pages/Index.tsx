import { BarChart3, Briefcase, FileText, Users, DollarSign, Clock, ArrowRight, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCard from '@/components/dashboard/DashboardCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Sample data - In a real app, this would come from API calls
  const projectsOverview = [
    { name: 'Lakeside Project', progress: 68, status: 'active' as StatusType },
    { name: 'City Center Renovation', progress: 32, status: 'active' as StatusType },
    { name: 'Hillside Residence', progress: 100, status: 'completed' as StatusType },
    { name: 'Commercial Complex', progress: 15, status: 'on-hold' as StatusType }
  ];

  const upcomingEstimates = [
    { id: 'EST-1001', client: 'Jackson Properties', amount: 45000, status: 'pending' as StatusType },
    { id: 'EST-1002', client: 'Vanguard Development', amount: 72000, status: 'draft' as StatusType },
  ];

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-2 mb-6 animate-in">
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your construction management activities
            </p>
          </div>
          
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
            <Card className="premium-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                    <h3 className="text-2xl font-bold mt-1">12</h3>
                  </div>
                  <div className="h-10 w-10 bg-construction-50 rounded-full flex items-center justify-center text-construction-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+8%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="premium-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Estimates</p>
                    <h3 className="text-2xl font-bold mt-1">7</h3>
                  </div>
                  <div className="h-10 w-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+12%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="premium-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold mt-1">$1.2M</h3>
                  </div>
                  <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+15%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="premium-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Contacts</p>
                    <h3 className="text-2xl font-bold mt-1">187</h3>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+5%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="lg:col-span-2">
              <DashboardCard
                title="Active Projects"
                icon={<Briefcase className="h-5 w-5" />}
                className="h-full"
                footer={
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center"
                    onClick={() => navigate('/projects')}
                  >
                    View All Projects
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                }
              >
                <div className="space-y-5">
                  {projectsOverview.map((project, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{project.name}</span>
                        <StatusBadge status={project.status} size="sm" />
                      </div>
                      <div className="flex space-x-3 items-center">
                        <Progress value={project.progress} className="h-2" />
                        <span className="text-sm text-muted-foreground w-10">{project.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </div>
            
            <div className="space-y-6">
              <DashboardCard
                title="Pending Estimates"
                icon={<FileText className="h-5 w-5" />}
                footer={
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center"
                    onClick={() => navigate('/estimates')}
                  >
                    View All Estimates
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                }
              >
                <div className="space-y-3">
                  {upcomingEstimates.map((estimate, index) => (
                    <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{estimate.client}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{estimate.id}</span>
                          <StatusBadge status={estimate.status} size="sm" />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">${estimate.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>
              
              <DashboardCard
                title="Recent Activity"
                icon={<Clock className="h-5 w-5" />}
              >
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 pb-3 border-b border-border/50">
                    <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 mt-0.5">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p><span className="font-medium">Mike Johnson</span> completed a task on <span className="text-construction-700">Lakeside Project</span></p>
                      <p className="text-muted-foreground text-xs mt-1">Today, 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pb-3 border-b border-border/50">
                    <div className="h-7 w-7 rounded-full bg-construction-100 flex items-center justify-center text-construction-700 mt-0.5">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p><span className="font-medium">Sarah Miller</span> created a new estimate for <span className="text-construction-700">Vanguard Development</span></p>
                      <p className="text-muted-foreground text-xs mt-1">Yesterday, 3:45 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mt-0.5">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p><span className="font-medium">Rob Adams</span> added a new contact <span className="text-construction-700">Jackson Properties</span></p>
                      <p className="text-muted-foreground text-xs mt-1">Yesterday, 11:20 AM</p>
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
