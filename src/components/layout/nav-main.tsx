'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'

export function NavMain({
  items,
}: {
  items: Array<{
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: Array<{
      title: string
      url: string
    }>
  }>
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>메뉴</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => {
          const isCurrentPath =
            pathname === item.url || pathname.startsWith(item.url + '/')
          const hasActiveSubItem = item.items?.some(
            subItem => pathname === subItem.url
          )
          const shouldBeOpen =
            isCurrentPath || hasActiveSubItem || Boolean(item.isActive)

          // isActive가 false인 경우 비활성화
          const isDisabled = item.isActive === false

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={shouldBeOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isCurrentPath && !item.items}
                    asChild={!item.items && !isDisabled}
                    disabled={isDisabled}
                    className={
                      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }
                  >
                    {item.items ? (
                      <>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </>
                    ) : isDisabled ? (
                      // 비활성화된 경우 Link 대신 span 사용
                      <>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </>
                    ) : (
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items && !isDisabled && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map(subItem => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.url}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
