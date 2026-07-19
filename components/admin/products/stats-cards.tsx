import { Package, Layers } from 'lucide-react'

interface Props {
  total: number
  selected: number
}

export default function StatsCards({ total, selected }: Props) {
  return (
    <div className='grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:max-w-md'>
      <div className='bg-card px-4 py-3'>
        <div className='flex items-start justify-between gap-2'>
          <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
            Products
          </p>
          <Package className='h-4 w-4 text-muted-foreground' />
        </div>
        <p className='mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground'>
          {total.toLocaleString('en-US')}
        </p>
      </div>
      <div className='bg-card px-4 py-3'>
        <div className='flex items-start justify-between gap-2'>
          <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
            Selected
          </p>
          <Layers className='h-4 w-4 text-muted-foreground' />
        </div>
        <p className='mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground'>
          {selected.toLocaleString('en-US')}
        </p>
      </div>
    </div>
  )
}
