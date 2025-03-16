
import React from 'react';
import { Task } from '@/types';
import { Github, ExternalLink } from 'lucide-react';

interface GitHubTaskItemProps {
  task: Task;
}

const GitHubTaskItem: React.FC<GitHubTaskItemProps> = ({ task }) => {
  if (!task.github_issue_url) {
    return null;
  }
  
  return (
    <div className="mt-2 flex items-center text-xs text-muted-foreground">
      <Github className="h-3 w-3 mr-1" />
      <a 
        href={task.github_issue_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center hover:text-primary transition-colors"
      >
        GitHub Issue
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    </div>
  );
};

export default GitHubTaskItem;
