'use client'

import type { ContactFormValues } from '@/lib/schemas/contact'

import Link from 'next/link'

import { sendContactMessage } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { FormField, Input, Textarea } from '@/components/ui/field'
import { useActionForm } from '@/hooks/use-action-form'
import { contactSchema } from '@/lib/schemas/contact'

export default function ContactForm() {
  const { field, formState, onSubmit, reset } =
    useActionForm<ContactFormValues>({
      schema: contactSchema,
      defaultValues: { name: '', phone: '', email: '', message: '' },
      action: sendContactMessage,
      mode: 'create',
      noun: 'contact',
      successMessage: 'Message received. Sales will follow up shortly.',
      onSuccess: () => reset(),
    })
  const { errors, isSubmitting } = formState

  return (
    // noValidate: zod owns validation and renders its own messages
    <form
      noValidate
      className='space-y-5 px-5 py-6 md:px-6 md:py-8'
      onSubmit={onSubmit}
    >
      <div className='grid gap-5 sm:grid-cols-2'>
        <FormField
          className='sm:col-span-2'
          error={errors.name?.message}
          id='contact-name'
          label='Full name *'
        >
          <Input
            autoComplete='name'
            placeholder='Name for the quote file'
            {...field('name')}
          />
        </FormField>
        <FormField
          error={errors.phone?.message}
          id='contact-phone'
          label='Phone *'
        >
          <Input
            autoComplete='tel'
            placeholder='+98 …'
            type='tel'
            {...field('phone')}
          />
        </FormField>
        <FormField
          error={errors.email?.message}
          id='contact-email'
          label='Email'
        >
          <Input
            autoComplete='email'
            placeholder='optional'
            type='email'
            {...field('email')}
          />
        </FormField>
        <FormField
          className='sm:col-span-2'
          error={errors.message?.message}
          id='contact-message'
          label='Specs & volume *'
        >
          <Textarea
            className='min-h-40'
            placeholder='Product, size/grade, tonnage, delivery city, timing…'
            rows={8}
            {...field('message')}
          />
        </FormField>
      </div>

      <div className='flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-xs text-muted-foreground'>
          Prefer the catalog first?{' '}
          <Link
            className='font-medium text-foreground underline-offset-4 hover:underline'
            href='/products'
          >
            Browse unit prices
          </Link>
        </p>
        <Button className='px-6' disabled={isSubmitting} type='submit'>
          {isSubmitting ? 'Sending…' : 'Send request'}
        </Button>
      </div>
    </form>
  )
}
