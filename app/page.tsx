"use client"

import { Header } from "@/components/header"
import { CategoryNavigation } from "@/components/category-navigation"
import { ActionBar } from "@/components/action-bar"
import { WineList } from "@/components/wine-list"
import { WineProvider } from "@/context/wine-context"

export default function Home() {
  return (
    <WineProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <CategoryNavigation />
        <ActionBar />
        <WineList />
      </div>
    </WineProvider>
  )
}
