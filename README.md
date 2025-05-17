# Wine List Application

An elegant and minimalist wine list application for fine dining restaurants, optimized for color e-ink tablet displays.

## Features

- Clean, minimalist interface optimized for e-ink displays
- Category-based navigation
- Search and filtering capabilities
- Wine details view with comprehensive information
- Bookmarking functionality
- Dark mode support

## Setup Instructions

### 1. Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

### 2. Customization

- Update the logo in `/public/images/logo.png`
- Adjust the accent color in `tailwind.config.ts` and `globals.css`
- Modify the categories in `components/category-navigation.tsx`
- Edit the mock data in `lib/mock-data.ts` to include your wine selection

## Deployment

This application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Deploy

## Adding Your Wine Data

To add your own wine data, edit the `lib/mock-data.ts` file. Each wine should follow this structure:

\`\`\`typescript
{
  id: "1",
  nombre: "Wine Name",
  productor: "Producer Name",
  region: "Wine Region",
  pais: "Country",
  ano: "Vintage Year",
  uva: "Grape Variety",
  alcohol: "Alcohol Percentage",
  enologo: "Winemaker",
  precio: "Bottle Price",
  precioCopa: "Glass Price",
  precioCopaR1: "Glass Price R1",
  precioCopaR2: "Glass Price R2",
  precioCopaR3: "Glass Price R3",
  vista: "Visual Tasting Notes",
  nariz: "Aroma Tasting Notes",
  boca: "Palate Tasting Notes",
  maridaje: "Food Pairing",
  estilo: "Wine Style",
  tipo: "Wine Type",
  caracteristica: "Wine Characteristic"
}
\`\`\`

Not all fields are required, but providing more information will enhance the user experience.
