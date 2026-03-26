'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
import { useGoogleAdsAccount, useGoogleAdsMutations } from '@/hooks/use-google-services'

export default function EditGoogleAdsPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)
  const { item: entity, loading } = useGoogleAdsAccount(id)
  const { updateItem } = useGoogleAdsMutations()

  const [accountName, setAccountName] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (entity) {
      setAccountName(entity.accountName ?? '')
      setAccountEmail(entity.accountEmail ?? '')
      setCustomerId(entity.customerId ?? '')
      setStatus(entity.status ?? '')
      setNotes(entity.notes ?? '')
    }
  }, [entity])

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>
  }

  if (!entity) {
    return <div className="p-6 text-muted-foreground">Google Ads account not found</div>
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateItem(id, {
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
      title="Edit Google Ads Account"
      description={`Editing ${entity.accountName}`}
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
