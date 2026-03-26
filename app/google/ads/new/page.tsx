'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChartBar as BarChart3 } from 'lucide-react'
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
import { useGoogleAdsMutations } from '@/hooks/use-google-services'

export default function NewGoogleAdsPage() {
  const router = useRouter()
  const { createItem } = useGoogleAdsMutations()
  const [accountName, setAccountName] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [status, setStatus] = useState('active')
  const [notes, setNotes] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createItem({
        accountName,
        accountEmail,
        customerId: customerId || null,
        status: status as 'active' | 'inactive' | 'suspended',
        notes: notes || null,
      })

      router.push('/google/ads')
    } catch {
      // handled in hook
    }
  }

  return (
    <FormLayout
      title="Add Google Ads Account"
      description="Create a new Google Ads account"
      backHref="/google/ads"
      backLabel="Back to Google Ads"
      onSubmit={onSubmit}
    >
      <FormSection title="Ads Account" icon={<BarChart3 className="h-4 w-4 text-primary" />}>
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
        <FormFieldWrapper label="Customer ID">
          <Input
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
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
              <SelectItem value="suspended">Suspended</SelectItem>
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
