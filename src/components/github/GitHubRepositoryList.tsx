
import React, { useEffect, useState } from 'react';
import { useGitHubStore } from '@/store/githubStore';
import { CustomButton } from '@/components/ui/custom-button';
import { GitHubRepository } from '@/types';
import { RefreshCw, Eye, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const GitHubRepositoryList: React.FC = () => {
  const { 
    repositories, 
    trackedRepositories,
    loading, 
    fetchRepositories,
    fetchTrackedRepositories,
    trackRepository,
    selectRepository
  } = useGitHubStore();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRepositories();
    fetchTrackedRepositories();
  }, []);

  const filteredRepositories = repositories.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isTracked = (repoId: number) => {
    return trackedRepositories.some(tracked => tracked.repo_id === repoId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">GitHub Repositories</h3>
        <CustomButton 
          variant="outline" 
          size="sm" 
          onClick={() => {
            fetchRepositories();
            fetchTrackedRepositories();
          }}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </CustomButton>
      </div>
      
      <div className="relative">
        <input
          type="text"
          placeholder="Search repositories..."
          className="w-full px-3 py-2 border border-input rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="space-y-1 p-1">
          {filteredRepositories.length > 0 ? (
            filteredRepositories.map((repo) => (
              <div 
                key={repo.id}
                className="flex items-center justify-between p-3 hover:bg-secondary/10 rounded-md"
              >
                <div>
                  <div className="font-medium">{repo.name}</div>
                  <div className="text-sm text-muted-foreground">{repo.full_name}</div>
                </div>
                <div className="flex gap-2">
                  <CustomButton
                    variant="outline"
                    size="sm"
                    onClick={() => selectRepository(repo)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </CustomButton>
                  <CustomButton
                    variant={isTracked(repo.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => trackRepository(repo, true, true)}
                    disabled={isTracked(repo.id)}
                  >
                    {isTracked(repo.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Tracked
                      </>
                    ) : (
                      "Track"
                    )}
                  </CustomButton>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {loading ? 'Loading repositories...' : 'No repositories found'}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GitHubRepositoryList;
