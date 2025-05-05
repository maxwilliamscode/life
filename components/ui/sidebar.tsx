import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { ChevronRight, Menu } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { ShadcnButton } from "@/components/ui/shadcn-button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"

const Sidebar = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  return (
    <div
      className={cn(
        "flex flex-col border-r bg-secondary text-secondary-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const SidebarTrigger = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) => {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return null
  }

  return (
    <Sheet>
      <ShadcnButton
        variant="ghost"
        size="icon"
        className={cn("mr-2", className)}
        {...props}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Open sidebar</span>
      </ShadcnButton>
      <SheetContent side="left" className="w-3/4 border-r p-0">
        <SidebarNav />
      </SheetContent>
    </Sheet>
  )
}

const SidebarHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  return (
    <div className={cn("flex items-center justify-between py-4 px-3", className)} {...props}>
      <h1 className="text-lg font-semibold">Acme Co.</h1>
    </div>
  )
}

const SidebarFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  return <div className={cn("mt-auto border-t p-4", className)} {...props} />
}

const SidebarNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  return (
    <nav className={cn("grid gap-6 p-4", className)} {...props}>
      <div className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight">
          Dashboard
        </h2>
        <div className="grid gap-1">
          <ShadcnButton variant="ghost" className="justify-start">
            <ChevronRight className="mr-2 h-4 w-4" />
            Overview
          </ShadcnButton>
          <ShadcnButton variant="ghost" className="justify-start">
            <ChevronRight className="mr-2 h-4 w-4" />
            Analytics
          </ShadcnButton>
          <ShadcnButton variant="ghost" className="justify-start">
            <ChevronRight className="mr-2 h-4 w-4" />
            Reports
          </ShadcnButton>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight">
          Manage
        </h2>
        <div className="grid gap-1">
          <ShadcnButton variant="ghost" className="justify-start">
            <ChevronRight className="mr-2 h-4 w-4" />
            Customers
          </ShadcnButton>
          <ShadcnButton variant="ghost" className="justify-start">
            <ChevronRight className="mr-2 h-4 w-4" />
            Products
          </ShadcnButton>
          <ShadcnButton variant="ghost" className="justify-start">
            <ChevronRight className="mr-2 h-4 w-4" />
            Orders
          </ShadcnButton>
          <ShadcnButton variant="ghost" className="justify-start">
            <ChevronRight className="mr-2 h-4 w-4" />
            Invoices
          </ShadcnButton>
        </div>
      </div>
    </nav>
  )
}

const SidebarSearch = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("border-b p-3", className)} {...props}>
      <Input type="search" placeholder="Search..." />
    </div>
  )
}

export { Sidebar, SidebarTrigger, SidebarHeader, SidebarFooter, SidebarNav, SidebarSearch }
