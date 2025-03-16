
import React, { useEffect } from 'react';
import { useGitHubStore } from '@/store/githubStore';
import { CustomButton } from '@/components/ui/custom-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Plus } from 'lucide-react';
import { TaskCategory, TaskPriority } from '@/types';

const GitHubIssueList: React.FC = () => {
  const { 
    selectedRepository,
    issues,
    loading,
    selectRepository,
    createTaskFromIssue
  } = useGitHubStore();

  if (!selectedRepository) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={() => selectRepository(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </CustomButton>
        <h3 className="text-lg font-medium">Issues in {selectedRepository.full_name}</h3>
      </div>
      
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="space-y-1 p-1">
          {issues.length > 0 ? (
            issues.map((issue) => (
              <div 
                key={issue.id}
                className="flex items-center justify-between p-3 hover:bg-secondary/10 rounded-md"
              >
                <div>
                  <a 
                    href={issue.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    #{issue.number} {issue.title}
                  </a>
                  <div className="text-sm text-muted-foreground">
                    Updated {new Date(issue.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => createTaskFromIssue(issue, 'bug' as TaskCategory, 'medium' as TaskPriority)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Task
                </CustomButton>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {loading ? 'Loading issues...' : 'No issues found in this repository'}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GitHubIssueList;
