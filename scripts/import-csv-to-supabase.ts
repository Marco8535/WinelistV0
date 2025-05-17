import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

// This script is meant to be run locally to import CSV data into Supabase
// You would need to run: npx tsx scripts/import-csv-to-supabase.ts

async function importCsvToSupabase() {
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Please check your .env.local file.")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Path to your CSV file - update this to your actual file path
    const csvFilePath = path.resolve("./data/wines.csv")
    const fileContent = fs.readFileSync(csvFilePath, "utf8")

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    })

    console.log(`Parsed ${records.length} records from CSV`)

    // Insert data into Supabase
    const { data, error } = await supabase.from("wines").insert(records)

    if (error) {
      throw error
    }

    console.log("Successfully imported data to Supabase")
  } catch (error) {
    console.error("Error importing data:", error)
  }
}

importCsvToSupabase()
