"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  extraActions?: React.ReactNode
  scrolled?: boolean
}

export function NavBar({ items, className, extraActions, scrolled = true }: NavBarProps) {
  const pathname = usePathname()
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 pt-4 px-6",
        className
      )}
    >
      <div className={cn(
        "max-w-5xl mx-auto flex items-center justify-between py-3 px-6 rounded-2xl transition-all duration-500",
        scrolled
          ? "bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--line)] shadow-[0_1px_3px_var(--shadow-subtle)]"
          : "bg-transparent border border-transparent shadow-none"
      )}>
        <Link href="/" className="flex items-center">
          <span className="text-[18px] font-body font-bold tracking-[-0.01em] text-chrono-text">
            Crohna
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.url
            return (
              <Link
                key={item.name}
                href={item.url}
                onMouseEnter={() => setHoveredTab(item.name)}
                onMouseLeave={() => setHoveredTab(null)}
                className={cn(
                  "relative cursor-pointer text-sm font-body font-medium px-4 py-2 rounded-xl transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-chrono-accent focus-visible:ring-offset-2",
                  isActive
                    ? "text-chrono-accent"
                    : "text-chrono-muted hover:text-chrono-text"
                )}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl -z-10"
                    style={{ background: "var(--chrono-glow)" }}
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                    }}
                  />
                )}
                {hoveredTab === item.name && !isActive && (
                  <motion.div
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-xl bg-[var(--line)] -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {extraActions && (
          <div className="flex items-center gap-2">
            {extraActions}
          </div>
        )}
      </div>
    </div>
  )
}
