# Wine List Application

An elegant and minimalist wine list application for fine dining restaurants, optimized for color e-ink tablet displays.

## Features

- Clean, minimalist interface optimized for e-ink displays
- Real-time data from Google Sheets
- Category-based navigation
- Search and filtering capabilities
- Wine details view with comprehensive information
- Bookmarking functionality

## Setup Instructions

### 1. Google Sheets Setup

1. Create a Google Sheet with your wine data
2. Make sure the sheet has the following columns (or similar):
   - SKU (unique identifier)
   - Nombre en Carta (Wine name)
   - Bodega (Producer)
   - Región 1 (Region)
   - Cepa (Grape variety)
   - Añada (Vintage year)
   - Alcohol
   - Enólogo (Winemaker)
   - Precio R1 (Bottle price)
   - Precio R1 copa, Precio R2 copa, etc. (Glass prices)
   - Notas de Cata (Tasting notes)
   - Maridajes (Food pairings)
   - Característica del Vino (Wine characteristics)
   - Tipo (Type - red, white, etc.)
   - Estilo (Style)

3. Share the sheet with your Google Service Account email (see next section)

### 2. Google Service Account Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API for your project
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name and description
   - Grant it the "Editor" role
   - Click "Create"
5. Create a key for the Service Account:
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Click "Create"
   - Save the downloaded JSON file securely

### 3. Environment Variables Setup

Create a `.env.local` file in the root of your project with the following variables:

\`\`\`
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
\`\`\`

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The email address of your service account
- `GOOGLE_PRIVATE_KEY`: The private key from the JSON file you downloaded
- `GOOGLE_SHEET_ID`: The ID of your Google Sheet (found in the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`)

### 4. Install Dependencies and Run

\`\`\`bash
npm install
npm run dev
\`\`\`

## Deployment

This application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add the environment variables in the Vercel project settings
4. Deploy

## Customization

- Update the logo in `/public/images/logo.png`
- Adjust the accent color in `tailwind.config.ts` and `globals.css`
- Modify the categories in `components/category-navigation.tsx`
