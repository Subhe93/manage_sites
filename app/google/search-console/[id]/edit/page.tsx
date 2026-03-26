'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
import { useGoogleSearchConsoleAccount, useGoogleSearchConsoleMutations } from '@/hooks/use-google-services'

export default function EditGoogleSearchConsolePage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)
  const { item: entity, loading } = useGoogleSearchConsoleAccount(id)
  const { updateItem } = useGoogleSearchConsoleMutations()

  const [accountName, setAccountName] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (entity) {
      setAccountName(entity.accountName ?? '')
      setAccountEmail(entity.accountEmail ?? '')
      setStatus(entity.status ?? '')
      setNotes(entity.notes ?? '')
    }
  }, [entity])

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>
  }

  if (!entity) {
    return <div className="p-6 text-muted-foreground">Search Console account not found</div>
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateItem(id, {
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
      title="Edit Google Search Console Account"
      description={`Editing ${entity.accountName}`}
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
