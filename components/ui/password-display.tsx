'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy } from 'lucide-react';
import { toast } from 'sonner';

export const PasswordDisplay = ({ value, showDashes = true }: { value: string | null | undefined, showDashes?: boolean }) => {
  const [show, setShow] = useState(false);

  if (!value) return <span className="font-medium">-</span>;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success('Password copied!', { position: 'top-center' });
  };

  return (
    <div className="flex items-center gap-1.5 font-mono bg-muted px-2 py-1 rounded-md w-fit border border-border/50">
      <span>{show ? value : (showDashes ? '••••••••' : '*'.repeat(value.length))}</span>
      <div className="flex items-center gap-0 border-l pl-1.5 ml-1 border-border/50">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 hover:bg-background shadow-none"
          onClick={() => setShow(!show)}
          title={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 hover:bg-background shadow-none"
          onClick={handleCopy}
          title="Copy password"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
