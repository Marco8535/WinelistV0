import WineList from "@/components/wine-list"
import { RestaurantLogo } from "@/components/restaurant-logo"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex justify-center mb-10">
        <RestaurantLogo />
      </div>
      <WineList />
    </main>
  )
}
