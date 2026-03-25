'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, ExternalLink, GitBranch, Github, Gitlab as GitlabIcon, Lock, MoveHorizontal as MoreHorizontal, Pencil, Plus, Search, Trash2, Clock as Unlock, FolderGit2 } from 'lucide-react';
import { mockRepositories, mockWebsites } from '@/lib/mock-data';

export default function RepositoriesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const totalRepos = mockRepositories.length;
  const githubRepos = mockRepositories.filter(
    (r) => r.repository_type === 'github'
  ).length;
  const gitlabRepos = mockRepositories.filter(
    (r) => r.repository_type === 'gitlab'
  ).length;
  const bitbucketRepos = mockRepositories.filter(
    (r) => r.repository_type === 'bitbucket'
  ).length;
  const privateRepos = mockRepositories.filter((r) => r.is_private).length;
  const publicRepos = mockRepositories.filter((r) => !r.is_private).length;

  const filteredRepositories = mockRepositories.filter((repo) => {
    const website = repo.website_id
      ? mockWebsites.find((w) => w.id === repo.website_id)
      : null;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      repo.repository_name.toLowerCase().includes(searchLower) ||
      repo.repository_url.toLowerCase().includes(searchLower) ||
      repo.branch_name.toLowerCase().includes(searchLower) ||
      (website?.website_name.toLowerCase().includes(searchLower) ?? false);
    const matchesType =
      typeFilter === 'all' || repo.repository_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const repoTypeColor = (type: string) => {
    switch (type) {
      case 'github':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      case 'gitlab':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'bitbucket':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  const repoTypeIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <Github className="mr-1 h-3 w-3" />;
      case 'gitlab':
        return <GitlabIcon className="mr-1 h-3 w-3" />;
      case 'bitbucket':
        return <GitBranch className="mr-1 h-3 w-3" />;
      default:
        return <FolderGit2 className="mr-1 h-3 w-3" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
            <p className="text-muted-foreground">
              Manage source code repositories and version control
            </p>
          </div>
          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add Repository
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repos</CardTitle>
              <FolderGit2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRepos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GitHub</CardTitle>
              <Github className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{githubRepos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GitLab</CardTitle>
              <GitlabIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gitlabRepos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bitbucket</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bitbucketRepos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Private</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{privateRepos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public</CardTitle>
              <Unlock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publicRepos}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              All
            </Button>
            <Button
              variant={typeFilter === 'github' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('github')}
              className="gap-1"
            >
              <Github className="h-3 w-3" />
              GitHub
            </Button>
            <Button
              variant={typeFilter === 'gitlab' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('gitlab')}
              className="gap-1"
            >
              <GitlabIcon className="h-3 w-3" />
              GitLab
            </Button>
            <Button
              variant={typeFilter === 'bitbucket' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('bitbucket')}
              className="gap-1"
            >
              <GitBranch className="h-3 w-3" />
              Bitbucket
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository Name</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Private</TableHead>
                  <TableHead>Last Commit</TableHead>
                  <TableHead>Last Commit Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRepositories.map((repo) => {
                  const website = repo.website_id
                    ? mockWebsites.find((w) => w.id === repo.website_id)
                    : null;
                  return (
                    <TableRow key={repo.id}>
                      <TableCell className="font-medium">
                        {repo.repository_name}
                      </TableCell>
                      <TableCell>{website?.website_name ?? '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${repoTypeColor(repo.repository_type)} flex items-center w-fit`}
                        >
                          {repoTypeIcon(repo.repository_type)}
                          {repo.repository_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <a
                          href={repo.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      </TableCell>
                      <TableCell>{repo.branch_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            repo.is_private
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                          }
                        >
                          {repo.is_private ? 'Private' : 'Public'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {repo.last_commit_hash.substring(0, 7)}
                        </code>
                      </TableCell>
                      <TableCell>{repo.last_commit_date}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {repo.notes || '-'}
                      </TableCell>
                      <TableCell>{repo.created_at}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Repository
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRepositories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No repositories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
