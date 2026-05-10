"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPageUrl } from "@/utils/createPageURL";
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Sprout, 
  Droplets, 
  Bell, 
  TrendingUp, 
  Leaf, 
  LogOut
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sideBar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("dashboard"),
    icon: LayoutDashboard,
    description: "Overview"
  },
  {
    title: "Plant Health",
    url: createPageUrl("plantHealth"),
    icon: Sprout,
    description: "Disease Detection"
  },
  {
    title: "Irrigation",
    url: createPageUrl("irrigation"),
    icon: Droplets,
    description: "Water Management"
  },
  {
    title: "Alerts",
    url: createPageUrl("alerts"),
    icon: Bell,
    description: "Notifications"
  },
  {
    title: "Analytics",
    url: createPageUrl("analytics"),
    icon: TrendingUp,
    description: "Data Insights"
  }
];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  console.log("Authenticated user in ClientLayout:", user);
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 to-blue-50">
        {/* UPDATE 1: Sidebar
            Added 'h-screen' to make it full viewport height.
            Added 'sticky top-0' so it stays pinned while main content scrolls.
            Added 'flex flex-col' to organize children vertically.
        */}
        <Sidebar className="border-r border-green-100 h-screen sticky top-0 flex flex-col">
          
          <SidebarHeader className="border-b border-green-100 p-6 bg-gradient-to-r from-green-600 to-green-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">AgriSmart</h2>
                <p className="text-green-100 text-sm">Smart Agriculture</p>
              </div>
            </div>
          </SidebarHeader>
          
          {/* UPDATE 2: SidebarContent
             'flex-1' makes it expand to fill all empty space.
             'overflow-y-auto' enables scrolling ONLY within this section.
          */}
          <SidebarContent className="p-2 bg-green-900 backdrop-blur flex-1 overflow-y-auto">
            {/* Monitoring */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-green-600 uppercase tracking-wider px-2 py-3">
                Monitoring
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-xl mb-1 ${
                          pathname === item.url ? 'bg-green-50 text-green-700 border-l-4 border-green-500' : ''
                        }`}
                      >
                        <Link href={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <div>
                            <span className="font-semibold">{item.title}</span>
                            <p className="text-xs opacity-75">{item.description}</p>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* System Status */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-white uppercase tracking-wider px-2 py-3">
                System Status
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">System Status</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-blue-300 font-medium">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Active Zones</span>
                    <span className="text-blue-300 font-semibold">1</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Pump Status</span>
                    <span className="text-blue-300 font-medium">Auto</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* UPDATE 3: SidebarFooter
             Added 'shrink-0' to ensure it never gets squashed.
             It sits outside the scrollable SidebarContent, so it remains fixed.
          */}
          <SidebarFooter className="border-t border-green-100 p-6 dark:bg-white rounded-xs shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-green-100/50 -m-2 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">F</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-600">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.role}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-white/70 backdrop-blur border-b border-green-100 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-green-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-green-800">AgriSmart</h1>
            </div>
          </header>

          {/* This allows the main page content to scroll independently of the sidebar */}
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>

      <style>
        {`
          :root {
            --agricultural-green: #2D5016;
            --agricultural-light-green: #4A7C59;
            --agricultural-blue: #1E40AF;
            --agricultural-light-blue: #3B82F6;
            --agricultural-brown: #92400E;
            --agricultural-yellow: #F59E0B;
          }
        `}
      </style>
    </SidebarProvider>
  );
}