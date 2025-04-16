# Schema Validation Tools

This directory contains tools for analyzing and validating the Supabase database schema.

## Enhanced Schema Validator

`enhanced-schema-validator.js` is a comprehensive analysis tool that:

1. Connects to the Supabase database
2. Detects all tables and their structures
3. Analyzes field naming patterns (IDs, dates, status values, etc.)
4. Identifies inconsistencies
5. Infers relationships between tables
6. Checks alignment with frontend type definitions

### How to Run

```bash
# From the project root directory
node tools/schema-validation/enhanced-schema-validator.js
```

### Output

The validator outputs:

- Console logs showing the analysis in real-time
- A detailed summary of findings
- Stores complete results in a global variable for further processing

### Results

The analysis results are summarized in [/docs/schema-analysis-findings.md](/docs/schema-analysis-findings.md), which details:

- ID field patterns
- Date field patterns
- Status value conventions
- Table-specific findings
- Relationships between tables
- Recommendations for standardization

## Usage in Implementation

The findings from this tool informed the creation of the field mapping adapter layer located at:

- `src/utils/fieldMapping.ts`
- `src/utils/dbService.ts`

See [/docs/implementation-summary.md](/docs/implementation-summary.md) for details on how the schema standardization was implemented.
