
import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TaskCategory, TaskPriority } from '@/types';
import { Calendar, CheckCircle, Clock, AlertCircle, ListTodo, BarChart3 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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

  const categoryData = Object.entries(tasksByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const priorityData = Object.entries(tasksByPriority).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

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
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full bg-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green'}-500`}></span>
                    <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
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
