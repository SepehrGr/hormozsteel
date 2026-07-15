'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, X } from 'lucide-react'

interface WeightCalculatorProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
}

export default function WeightCalculator({
  isOpen,
  onClose,
  productName,
}: WeightCalculatorProps) {
  const [diameter, setDiameter] = useState('')
  const [length, setLength] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [totalWeight, setTotalWeight] = useState(0)

  const calculateWeight = () => {
    const d = parseFloat(diameter)
    const l = parseFloat(length)
    const q = parseFloat(quantity)

    if (d && l && q) {
      // فرمول محاسبه وزن میلگرد: (قطر^2 × طول × 0.00617) × تعداد
      const weight = d * d * l * 0.00617 * q
      setTotalWeight(Math.round(weight * 100) / 100)
    }
  }

  const resetCalculator = () => {
    setDiameter('')
    setLength('')
    setQuantity('1')
    setTotalWeight(0)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
      <Card className='w-full max-w-md'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-xl'>محاسبه وزن میلگرد</CardTitle>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </CardHeader>

        <CardContent className='space-y-4'>
          {productName && (
            <div className='text-sm text-slate-600 dark:text-slate-400'>
              محصول: {productName}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <Label htmlFor='diameter'>قطر (میلیمتر)</Label>
              <Input
                id='diameter'
                type='number'
                value={diameter}
                onChange={e => setDiameter(e.target.value)}
                placeholder='مثال: 14'
              />
            </div>

            <div>
              <Label htmlFor='length'>طول (متر)</Label>
              <Input
                id='length'
                type='number'
                value={length}
                onChange={e => setLength(e.target.value)}
                placeholder='مثال: 12'
              />
            </div>

            <div>
              <Label htmlFor='quantity'>تعداد</Label>
              <Input
                id='quantity'
                type='number'
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder='مثال: 1'
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <Button onClick={calculateWeight} className='flex-1'>
              <Calculator className='w-4 h-4 ml-2' />
              محاسبه
            </Button>
            <Button onClick={resetCalculator} variant='outline'>
              پاک کردن
            </Button>
          </div>

          {totalWeight > 0 && (
            <div className='p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  {totalWeight.toLocaleString('fa-IR')} کیلوگرم
                </div>
                <div className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
                  وزن تقریبی کل
                </div>
              </div>
            </div>
          )}

          <div className='text-xs text-slate-500 dark:text-slate-400'>
            فرمول محاسبه: (قطر² × طول × 0.00617) × تعداد
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
