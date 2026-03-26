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
import { useGoogleAnalyticsAccount, useGoogleAnalyticsMutations } from '@/hooks/use-google-services'

export default function EditGoogleAnalyticsPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)
  const { item: entity, loading } = useGoogleAnalyticsAccount(id)
  const { updateItem } = useGoogleAnalyticsMutations()

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
      setAccountName(entity.accountName ?? '')
      setAccountEmail(entity.accountEmail ?? '')
      setAccountId(entity.accountId ?? '')
      setPropertyId(entity.propertyId ?? '')
      setMeasurementId(entity.measurementId ?? '')
      setAnalyticsVersion(entity.analyticsVersion ?? '')
      setStatus(entity.status ?? '')
      setNotes(entity.notes ?? '')
    }
  }, [entity])

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>
  }

  if (!entity) {
    return <div className="p-6 text-muted-foreground">Google Analytics account not found</div>
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateItem(id, {
        accountName,
        accountEmail,
        accountId: accountId || null,
        propertyId: propertyId || null,
        measurementId: measurementId || null,
        analyticsVersion: analyticsVersion as 'ua' | 'ga4',
        status: status as 'active' | 'inactive' | 'suspended',
        notes: notes || null,
      })

      router.push('/google/analytics')
    } catch {
      // handled in hook
    }
  }

  return (
    <FormLayout
      title="Edit Google Analytics Account"
      description={`Editing ${entity.accountName}`}
      backHref="/google/analytics"
      backLabel="Back to Google Analytics"
      onSubmit={onSubmit}
    >
      <FormSection title="Analytics Account" icon={<BarChart3 className="h-4 w-4 text-primary" />}>
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
