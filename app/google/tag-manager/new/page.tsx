'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tag } from 'lucide-react'
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
import { useGoogleTagManagerMutations } from '@/hooks/use-google-services'

export default function NewGoogleTagManagerPage() {
  const router = useRouter()
  const { createItem } = useGoogleTagManagerMutations()
  const [accountName, setAccountName] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [accountId, setAccountId] = useState('')
  const [status, setStatus] = useState('active')
  const [notes, setNotes] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createItem({
        accountName,
        accountEmail,
        accountId: accountId || null,
        status: status as 'active' | 'inactive' | 'suspended',
        notes: notes || null,
      })

      router.push('/google/tag-manager')
    } catch {
      // handled in hook
    }
  }

  return (
    <FormLayout
      title="Add Google Tag Manager Account"
      description="Create a new Google Tag Manager account"
      backHref="/google/tag-manager"
      backLabel="Back to Tag Manager"
      onSubmit={onSubmit}
    >
      <FormSection title="Tag Manager Account" icon={<Tag className="h-4 w-4 text-primary" />}>
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
        <FormFieldWrapper label="Account ID">
          <Input
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
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
