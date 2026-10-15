import { SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}

/** An inbox item the admin bell lists: a new message or a pending quote. */
export interface InboxNotification {
  id: string
  type: 'contact' | 'order'
  name: string
  createdAt: string
}

export interface InboxNotifications {
  /** New messages plus pending quotes, not just the listed ones. */
  count: number
  items: InboxNotification[]
}
