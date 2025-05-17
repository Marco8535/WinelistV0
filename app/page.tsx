import { WineList } from "@/components/wine-list"
import { fetchWines } from "@/lib/data"

export default async function Home() {
  const wines = await fetchWines()

  return (
    <main className="min-h-screen bg-[#FAFAFA] py-8 px-4 md:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-serif font-medium text-[#003366]">Selección de Vinos</h1>
        <p className="mt-2 text-[#4A5568] italic">Curated by our Sommelier</p>
      </header>

      <WineList wines={wines} />
    </main>
  )
}
