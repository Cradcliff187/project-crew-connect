# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/af57cde4-ad57-433e-815c-c17780578b75

## Recent Changes

### Vendor/Subcontractor Selection Fix - April 25, 2025

We've resolved an issue with the vendor and subcontractor selection dropdowns in document upload forms. The fix addresses:

- Selection not registering properly when clicking on items in the dropdown
- Event propagation issues causing form submission or mishandled selections
- Missing explicit button types causing unintended form submissions
- Added event stopPropagation to prevent clicks from bubbling up to parent elements

Components affected:

- `VendorSearchCombobox.tsx`
- `VendorSelectDialog.tsx`
- `StandardizedDocumentUpload.tsx`

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/af57cde4-ad57-433e-815c-c17780578b75) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/af57cde4-ad57-433e-815c-c17780578b75) and click on Share -> Publish.

## Database Structure

This project uses a structured approach to database management, with all database-related files organized in the `db` directory:

- `/db/migrations` - Sequentially numbered migration files to apply changes to the database
- `/db/functions` - Production-ready database function definitions
- `/db/scripts` - Utility scripts for database maintenance and validation
- `/db/tests` - Test scripts for database functionality
- `/db/archive` - Historical versions of database objects for reference

### Key Database Functions

- `convert_estimate_to_project` - Converts an estimate to a project with all associated data

### Applying Migrations

You can apply database migrations by running:

```sh
# Install dependencies
npm install

# Run the migration script
node db/scripts/apply-migrations.js
```

For more detailed information, see the [Database Documentation](./db/README.md).

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
