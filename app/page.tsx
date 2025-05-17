import { WineList } from "@/components/wine-list"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 py-8 px-4 md:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-serif font-medium text-[#003366] dark:text-blue-400">Selección de Vinos</h1>
        <p className="mt-2 text-[#4A5568] dark:text-gray-400 italic">Curated by our Sommelier</p>
      </header>

      <WineList />
    </main>
  )
}
