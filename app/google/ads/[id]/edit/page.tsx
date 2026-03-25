'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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
import { mockGoogleAdsAccounts } from '@/lib/mock-data'

export default function EditGoogleAdsPage() {
  const params = useParams()
  const id = Number(params.id)
  const entity = mockGoogleAdsAccounts.find((item) => item.id === id)

  const [accountName, setAccountName] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (entity) {
      setAccountName(entity.account_name ?? '')
      setAccountEmail(entity.account_email ?? '')
      setCustomerId(entity.customer_id ?? '')
      setStatus(entity.status ?? '')
      setNotes(entity.notes ?? '')
    }
  }, [entity])

  if (!entity) {
    return (
      <div>
        <p>Not Found</p>
        <Link href="/google/ads">Back to Google Ads</Link>
      </div>
    )
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      id,
      account_name: accountName,
      account_email: accountEmail,
      customer_id: customerId,
      status,
      notes,
    })
  }

  return (
    <FormLayout
      title="Edit Google Ads Account"
      backHref="/google/ads"
      backLabel="Back to Google Ads"
      onSubmit={onSubmit}
    >
      <FormSection title="Ads Account" icon={BarChart3}>
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
