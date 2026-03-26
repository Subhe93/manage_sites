'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGoogleSearchConsoleMutations } from '@/hooks/use-google-services'

export default function NewGoogleSearchConsolePage() {
  const router = useRouter()
  const { createItem } = useGoogleSearchConsoleMutations()
  const [accountName, setAccountName] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [status, setStatus] = useState('active')
  const [notes, setNotes] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createItem({
        accountName,
        accountEmail,
        status: status as 'active' | 'inactive' | 'suspended',
        notes: notes || null,
      })

      router.push('/google/search-console')
    } catch {
      // handled in hook
    }
  }

  return (
    <FormLayout
      title="Add Google Search Console Account"
      description="Create a new Search Console account"
      backHref="/google/search-console"
      backLabel="Back to Search Console"
      onSubmit={onSubmit}
    >
      <FormSection title="Search Console Account" icon={<Search className="h-4 w-4 text-primary" />}>
        <FormFieldWrapper label="Account Name" required>
          <Input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Account Email" required>
          <Input
            type="text"
            value={accountEmail}
            onChange={(e) => setAccountEmail(e.target.value)}
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Notes" fullWidth>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  )
}
