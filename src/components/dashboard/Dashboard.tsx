
import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TaskCategory, TaskPriority, TaskTag } from '@/types';
import { Calendar, CheckCircle, Clock, AlertCircle, ListTodo, BarChart3, Tag, Activity } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, subDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';

const CATEGORY_COLORS = {
  bug: '#EF4444',
  feature: '#3B82F6',
  enhancement: '#10B981',
  documentation: '#8B5CF6',
  other: '#6B7280',
};

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

const TAG_COLORS: Record<string, string> = {
  frontend: '#8B5CF6',
  backend: '#3B82F6',
  urgent: '#EF4444',
  api: '#10B981',
  ui: '#F59E0B',
  testing: '#6366F1',
  design: '#EC4899',
  research: '#14B8A6',
  meeting: '#8B5CF6',
  planning: '#2563EB',
};

// Default colors for tags without specific colors
const DEFAULT_TAG_COLORS = [
  '#8B5CF6', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#6366F1', '#EC4899', '#14B8A6', '#8B5CF6', '#2563EB'
];

const Dashboard: React.FC = () => {
  const {
    tasks,
    getCompletedTasksCount,
    getIncompleteTasksCount,
    getTasksByCategory,
    getTasksByPriority,
    getOverdueTasks,
    getDueTodayTasks,
    getUpcomingTasks,
  } = useTaskStore();

  const completedCount = getCompletedTasksCount();
  const incompleteCount = getIncompleteTasksCount();
  const tasksByCategory = getTasksByCategory();
  const tasksByPriority = getTasksByPriority();
  const overdueTasks = getOverdueTasks();
  const dueTodayTasks = getDueTodayTasks();
  const upcomingTasks = getUpcomingTasks();

  const totalTasks = completedCount + incompleteCount;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const categoryData = Object.entries(tasksByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const priorityData = Object.entries(tasksByPriority).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Generate data for tags visualization
  const getTasksByTags = () => {
    const tagCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8) // Take top 8 tags
      .map(([name, value], index) => ({
        name,
        value,
        color: TAG_COLORS[name] || DEFAULT_TAG_COLORS[index % DEFAULT_TAG_COLORS.length]
      }));
  };
  
  const tagData = getTasksByTags();

  // Calculate recent activity
  const getRecentActivityData = () => {
    const today = new Date();
    const days = 7; // Past 7 days
    const activityData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = format(date, 'MM/dd');
      const completed = tasks.filter(task => 
        task.completed && 
        task.dueDate && 
        format(task.dueDate, 'MM/dd') === dateString
      ).length;
      
      const added = tasks.filter(task => 
        format(task.createdAt, 'MM/dd') === dateString
      ).length;
      
      activityData.push({
        date: format(date, 'MMM dd'),
        completed,
        added
      });
    }
    
    return activityData;
  };
  
  const activityData = getRecentActivityData();

  // Get tag icons for visualization
  const getTagIcon = (tag: string) => {
    // Depending on the tag name, return different icons
    switch(tag.toLowerCase()) {
      case 'frontend':
      case 'ui':
      case 'design':
        return '🎨';
      case 'backend':
      case 'api':
        return '⚙️';
      case 'urgent':
      case 'important':
        return '🔥';
      case 'testing':
        return '🔍';
      case 'research':
        return '📚';
      case 'meeting':
        return '👥';
      case 'planning':
        return '📋';
      default:
        return '🏷️';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-16 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-medium mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your tasks and productivity</p>
      </div>

      {tasks.length === 0 ? (
        <Alert className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No tasks yet</AlertTitle>
          <AlertDescription>
            Add some tasks to see your dashboard statistics and visualizations.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="breakdown" className="flex items-center gap-2">
                <ListTodo className="w-4 h-4" />
                <span>Task Breakdown</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Activity</span>
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Tags</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard 
                  title="Completed" 
                  value={completedCount} 
                  icon={<CheckCircle className="h-4 w-4 text-green-500" />} 
                  color="bg-green-50 dark:bg-green-950"
                />
                <StatsCard 
                  title="In Progress" 
                  value={incompleteCount} 
                  icon={<Clock className="h-4 w-4 text-blue-500" />} 
                  color="bg-blue-50 dark:bg-blue-950"
                />
                <StatsCard 
                  title="Overdue" 
                  value={overdueTasks.length} 
                  icon={<AlertCircle className="h-4 w-4 text-red-500" />} 
                  color="bg-red-50 dark:bg-red-950"
                />
                <StatsCard 
                  title="Due Today" 
                  value={dueTodayTasks.length} 
                  icon={<Calendar className="h-4 w-4 text-orange-500" />} 
                  color="bg-orange-50 dark:bg-orange-950"
                />
              </div>

              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <p className="text-xs text-muted-foreground pt-1">
                      {completedCount} of {totalTasks} tasks completed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Tasks by Category" data={categoryData} colors={CATEGORY_COLORS} />
                <ChartCard title="Tasks by Priority" data={priorityData} colors={PRIORITY_COLORS} />
              </div>
            </TabsContent>
            
            <TabsContent value="breakdown" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TaskListCard title="Overdue Tasks" tasks={overdueTasks} iconColor="text-red-500" />
                <TaskListCard title="Due Today" tasks={dueTodayTasks} iconColor="text-orange-500" />
                <TaskListCard title="Upcoming" tasks={upcomingTasks} iconColor="text-green-500" />
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Recent Activity (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" name="Tasks Completed" fill="#10B981" />
                        <Bar dataKey="added" name="Tasks Added" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tags" className="space-y-6">
              {tagData.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Popular Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {tagData.map((tag) => (
                          <div key={tag.name} className="flex items-center p-3 rounded-lg border border-muted" style={{ backgroundColor: `${tag.color}15` }}>
                            <div className="mr-3 text-xl" aria-hidden="true">
                              {getTagIcon(tag.name)}
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: tag.color }}>
                                {tag.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {tag.value} task{tag.value !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden h-[350px]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Tags Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tagData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={40}
                            fill="#8884d8"
                            dataKey="value"
                            labelLine={false}
                            label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                          >
                            {tagData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} task(s)`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <Tag className="h-4 w-4" />
                  <AlertTitle>No tags found</AlertTitle>
                  <AlertDescription>
                    Start adding tags to your tasks to see tag statistics and visualizations.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => (
  <Card className={`${color} border-none shadow-sm transition-all hover:shadow-md`}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-full p-2 bg-background/70 backdrop-blur-sm">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ChartCardProps {
  title: string;
  data: { name: string; value: number }[];
  colors: Record<string, string>;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, colors }) => (
  <Card className="overflow-hidden h-[320px]">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={colors[entry.name.toLowerCase()] || '#6B7280'} 
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} task(s)`, '']} />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

interface TaskListCardProps {
  title: string;
  tasks: any[];
  iconColor: string;
}

const TaskListCard: React.FC<TaskListCardProps> = ({ title, tasks, iconColor }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium flex items-center gap-2">
        <div className={`${iconColor}`}>
          {title === "Overdue Tasks" && <AlertCircle className="h-4 w-4" />}
          {title === "Due Today" && <Calendar className="h-4 w-4" />}
          {title === "Upcoming" && <Clock className="h-4 w-4" />}
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="max-h-[300px] overflow-y-auto">
      {tasks.length > 0 ? (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex-1 truncate">
                  <p className="font-medium truncate">{task.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full bg-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green'}-500`}></span>
                    <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex gap-1">
                        {task.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-xs rounded-full flex items-center">
                            {getTagIcon(tag)}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{task.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-muted-foreground py-4">No tasks found</p>
      )}
    </CardContent>
  </Card>
);

export default Dashboard;
