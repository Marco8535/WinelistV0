import type { Wine } from "@/types/wine"

export async function fetchWines(): Promise<Wine[]> {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Prueba%20Master%20vinos%20app%20120525%20-%20Hoja%201-cvPni1lFLbSjwDZR37C9uYZGmNY9vk.csv",
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch wine data: ${response.status}`)
    }

    const csvText = await response.text()
    const wines = parseCSV(csvText)
    return wines
  } catch (error) {
    console.error("Error fetching wine data:", error)
    return []
  }
}

function parseCSV(csvText: string): Wine[] {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",").map((header) => header.trim())

  const wines: Wine[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = parseCSVLine(lines[i])
    const wine: any = {}

    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        wine[header] = values[index]
      }
    })

    wines.push(wine as Wine)
  }

  return wines
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let currentValue = ""
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      insideQuotes = !insideQuotes
    } else if (char === "," && !insideQuotes) {
      values.push(currentValue.trim())
      currentValue = ""
    } else {
      currentValue += char
    }
  }

  values.push(currentValue.trim())
  return values
}
