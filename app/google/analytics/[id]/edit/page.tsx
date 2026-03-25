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
import { mockGoogleAnalyticsAccounts } from '@/lib/mock-data'

export default function EditGoogleAnalyticsPage() {
  const params = useParams()
  const id = Number(params.id)
  const entity = mockGoogleAnalyticsAccounts.find((item) => item.id === id)

  const [accountName, setAccountName] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [accountId, setAccountId] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [measurementId, setMeasurementId] = useState('')
  const [analyticsVersion, setAnalyticsVersion] = useState('')
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (entity) {
      setAccountName(entity.account_name ?? '')
      setAccountEmail(entity.account_email ?? '')
      setAccountId(entity.account_id ?? '')
      setPropertyId(entity.property_id ?? '')
      setMeasurementId(entity.measurement_id ?? '')
      setAnalyticsVersion(entity.analytics_version ?? '')
      setStatus(entity.status ?? '')
      setNotes(entity.notes ?? '')
    }
  }, [entity])

  if (!entity) {
    return (
      <div>
        <p>Not Found</p>
        <Link href="/google/analytics">Back to Google Analytics</Link>
      </div>
    )
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      id,
      account_name: accountName,
      account_email: accountEmail,
      account_id: accountId,
      property_id: propertyId,
      measurement_id: measurementId,
      analytics_version: analyticsVersion,
      status,
      notes,
    })
  }

  return (
    <FormLayout
      title="Edit Google Analytics Account"
      backHref="/google/analytics"
      backLabel="Back to Google Analytics"
      onSubmit={onSubmit}
    >
      <FormSection title="Analytics Account" icon={BarChart3}>
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
        <FormFieldWrapper label="Property ID">
          <Input
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Measurement ID">
          <Input
            value={measurementId}
            onChange={(e) => setMeasurementId(e.target.value)}
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Analytics Version">
          <Select value={analyticsVersion} onValueChange={setAnalyticsVersion}>
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ua">UA</SelectItem>
              <SelectItem value="ga4">GA4</SelectItem>
            </SelectContent>
          </Select>
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
