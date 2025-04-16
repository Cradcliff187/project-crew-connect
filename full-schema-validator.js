// Full Supabase Schema Validator
import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const SUPABASE_URL = 'https://zrxezqllmpdlhiudutme.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
  },
});

// Front-end entity to table mapping from the codebase
const entityTableMap = {
  projects: 'projects',
  customers: 'customers',
  vendors: 'vendors',
  subcontractors: 'subcontractors',
  work_orders: 'maintenance_work_orders',
  estimates: 'estimates',
  expenses: 'expenses',
  time_entries: 'time_entries',
  change_orders: 'change_orders',
  employees: 'employees',
};

// Function to analyze a specific table
async function analyzeTable(tableName) {
  try {
    console.log(`Analyzing table: ${tableName}`);

    // Get sample data to understand structure
    const { data, error } = await supabase.from(tableName).select('*').limit(5);

    if (error) {
      console.error(`Error querying table ${tableName}:`, error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`No data found in table ${tableName}`);
      return { columns: [], data: [] };
    }

    // Extract columns from first row
    const sampleRow = data[0];
    const columns = Object.keys(sampleRow).map(colName => {
      const value = sampleRow[colName];
      let dataType = typeof value;

      if (value === null) {
        dataType = 'null';
      } else if (dataType === 'object') {
        if (Array.isArray(value)) {
          dataType = 'array';
        } else if (value instanceof Date) {
          dataType = 'date';
        }
      }

      return {
        name: colName,
        type: dataType,
        nullable: value === null,
        sample: value,
      };
    });

    return {
      columns,
      data,
      exists: true,
    };
  } catch (error) {
    console.error(`Error analyzing table ${tableName}:`, error);
    return { exists: false, error: error.message };
  }
}

// Function to check for status values in a table
async function getStatusValues(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('status')
      .not('status', 'is', null)
      .limit(20);

    if (error) {
      console.log(`No status field in table ${tableName} or error:`, error.message);
      return [];
    }

    // Extract unique status values
    const statusValues = new Set();
    data.forEach(row => {
      if (row.status) {
        statusValues.add(row.status);
      }
    });

    return Array.from(statusValues);
  } catch (error) {
    console.error(`Error getting status values for ${tableName}:`, error);
    return [];
  }
}

// Function to infer relationships from column names
function inferRelationships(tableStructures) {
  const relationships = [];
  const tables = Object.keys(tableStructures);

  // Common ID patterns found in the schema analysis
  const tableIdMap = {
    customer: 'customerid',
    customers: 'customerid',
    project: 'projectid',
    projects: 'projectid',
    vendor: 'vendorid',
    vendors: 'vendorid',
    subcontractor: 'subid',
    subcontractors: 'subid',
    employee: 'employee_id',
    employees: 'employee_id',
    work_order: 'work_order_id',
    maintenance_work_orders: 'work_order_id',
    estimate: 'estimateid',
    estimates: 'estimateid',
  };

  // Handle direct known mappings first
  const knownForeignKeys = {
    'projects.customerid': { to_table: 'customers', to_column: 'customerid' },
    'estimates.customerid': { to_table: 'customers', to_column: 'customerid' },
    'estimates.projectid': { to_table: 'projects', to_column: 'projectid' },
    'expenses.vendor_id': { to_table: 'vendors', to_column: 'vendorid' },
    'time_entries.employee_id': { to_table: 'employees', to_column: 'employee_id' },
    'maintenance_work_orders.customer_id': { to_table: 'customers', to_column: 'customerid' },
    'maintenance_work_orders.project_id': { to_table: 'projects', to_column: 'projectid' },
  };

  // Process each table for relationships
  tables.forEach(tableName => {
    const tableData = tableStructures[tableName];
    if (!tableData || !tableData.columns) return;

    // Find potential foreign key columns
    const potentialFkColumns = tableData.columns.filter(
      col =>
        col.name.endsWith('_id') ||
        (col.name.endsWith('id') && col.name !== 'id') ||
        col.name.includes('_id_')
    );

    potentialFkColumns.forEach(col => {
      // First check for known mappings
      const knownFkKey = `${tableName}.${col.name}`;
      if (knownForeignKeys[knownFkKey]) {
        const mapping = knownForeignKeys[knownFkKey];
        relationships.push({
          from_table: tableName,
          from_column: col.name,
          to_table: mapping.to_table,
          to_column: mapping.to_column,
          confidence: 'high',
          type: 'known',
        });
        return;
      }

      // If not known, try to derive the relationship

      // Handle pluralization for better matches
      let derivedTable = null;

      // Special case for entity_id which is a generic reference
      if (col.name === 'entity_id') {
        // Check for entity_type field to determine the referenced table
        const entityTypeCol = tableData.columns.find(c => c.name === 'entity_type');
        if (entityTypeCol && entityTypeCol.sample) {
          const entityType = entityTypeCol.sample.toLowerCase();

          // Map entity type to table name
          if (entityType === 'project') derivedTable = 'projects';
          else if (entityType === 'work_order') derivedTable = 'maintenance_work_orders';
          else if (entityType === 'customer') derivedTable = 'customers';
          else if (entityType === 'vendor') derivedTable = 'vendors';
          else if (entityType === 'subcontractor') derivedTable = 'subcontractors';
          else if (entityType === 'employee') derivedTable = 'employees';
          else if (entityType === 'estimate') derivedTable = 'estimates';
        }
      }
      // Handle regular foreign key patterns
      else if (col.name.endsWith('_id')) {
        const baseTable = col.name.replace('_id', '');

        // Look for singular and plural forms
        if (tables.includes(baseTable)) {
          derivedTable = baseTable;
        } else if (tables.includes(baseTable + 's')) {
          derivedTable = baseTable + 's';
        }
      }
      // Handle older convention (no underscore)
      else if (col.name.endsWith('id') && col.name !== 'id') {
        const baseTable = col.name.replace('id', '');

        if (tables.includes(baseTable)) {
          derivedTable = baseTable;
        } else if (tables.includes(baseTable + 's')) {
          derivedTable = baseTable + 's';
        }
      }

      if (derivedTable && tables.includes(derivedTable)) {
        // Find the correct ID column in the target table
        const targetIdColumn = tableIdMap[derivedTable] || 'id';

        relationships.push({
          from_table: tableName,
          from_column: col.name,
          to_table: derivedTable,
          to_column: targetIdColumn,
          confidence: 'medium',
          type: 'inferred',
        });
      }
    });
  });

  return relationships;
}

// Function to check ID field patterns across tables
function analyzeIdPatterns(tableStructures) {
  const idPatterns = {};

  Object.entries(tableStructures).forEach(([tableName, data]) => {
    if (!data || !data.columns) return;

    // Find ID columns
    const idColumns = data.columns.filter(
      col => col.name === 'id' || col.name.endsWith('id') || col.name.endsWith('_id')
    );

    if (idColumns.length > 0) {
      idPatterns[tableName] = idColumns.map(col => ({
        name: col.name,
        type: col.type,
        sample: col.sample,
      }));
    }
  });

  return idPatterns;
}

// Function to analyze date field patterns
function analyzeDatePatterns(tableStructures) {
  const datePatterns = {};

  Object.entries(tableStructures).forEach(([tableName, data]) => {
    if (!data || !data.columns) return;

    // Find date columns
    const dateColumns = data.columns.filter(
      col =>
        col.name.includes('date') ||
        col.name.includes('_at') ||
        col.name.includes('_on') ||
        (col.type === 'string' &&
          typeof col.sample === 'string' &&
          /^\d{4}-\d{2}-\d{2}/.test(col.sample))
    );

    if (dateColumns.length > 0) {
      datePatterns[tableName] = dateColumns.map(col => ({
        name: col.name,
        type: col.type,
        sample: col.sample,
      }));
    }
  });

  return datePatterns;
}

// Main validation function
async function validateSchema() {
  console.log('Starting schema validation with known tables...');

  try {
    // Step 1: Check if tables exist and analyze their structure
    const tableStructures = {};
    const tableStatuses = {};
    const missingTables = [];

    // Check each table from the entity mapping
    for (const [entity, tableName] of Object.entries(entityTableMap)) {
      console.log(`Checking table "${tableName}" for entity "${entity}"...`);

      const tableInfo = await analyzeTable(tableName);

      if (!tableInfo || !tableInfo.exists) {
        console.log(`⚠️ Table "${tableName}" referenced by "${entity}" does not exist!`);
        missingTables.push({ entity, tableName });
        continue;
      }

      tableStructures[tableName] = tableInfo;
      console.log(`✓ Table "${tableName}" exists with ${tableInfo.columns.length} columns`);

      // Get status values for this table
      const statusValues = await getStatusValues(tableName);
      if (statusValues.length > 0) {
        tableStatuses[tableName] = statusValues;
        console.log(`  Found status values: ${statusValues.join(', ')}`);
      }
    }

    // Step 2: Report on table existence alignment
    console.log('\n== TABLE EXISTENCE ALIGNMENT ==');
    if (missingTables.length === 0) {
      console.log('✓ All front-end entity tables exist in the database');
    } else {
      console.log(`⚠️ ${missingTables.length} tables missing:`);
      missingTables.forEach(({ entity, tableName }) => {
        console.log(`  - Entity "${entity}" maps to non-existent table "${tableName}"`);
      });
    }

    // Step 3: Analyze ID field patterns
    const idPatterns = analyzeIdPatterns(tableStructures);
    console.log('\n== ID FIELD PATTERNS ==');
    const idPatternTypes = new Set();
    for (const [table, patterns] of Object.entries(idPatterns)) {
      patterns.forEach(pattern => {
        console.log(`${table}.${pattern.name} (${pattern.type}): ${pattern.sample}`);
        idPatternTypes.add(`${pattern.name} (${pattern.type})`);
      });
    }
    console.log('\nID Pattern Types Found:');
    idPatternTypes.forEach(pattern => console.log(`- ${pattern}`));

    // Step 4: Analyze date field patterns
    const datePatterns = analyzeDatePatterns(tableStructures);
    console.log('\n== DATE FIELD PATTERNS ==');
    const datePatternTypes = new Set();
    for (const [table, patterns] of Object.entries(datePatterns)) {
      patterns.forEach(pattern => {
        console.log(`${table}.${pattern.name} (${pattern.type}): ${pattern.sample}`);
        datePatternTypes.add(`${pattern.name} (${pattern.type})`);
      });
    }
    console.log('\nDate Pattern Types Found:');
    datePatternTypes.forEach(pattern => console.log(`- ${pattern}`));

    // Step 5: Analyze status values
    console.log('\n== STATUS VALUES BY TABLE ==');
    const allStatusValues = new Set();
    for (const [table, values] of Object.entries(tableStatuses)) {
      console.log(`${table}: ${values.join(', ')}`);
      values.forEach(value => allStatusValues.add(value));
    }
    console.log('\nAll Status Values Found:');
    allStatusValues.forEach(status => console.log(`- ${status}`));

    // Step 6: Infer relationships
    const relationships = inferRelationships(tableStructures);
    console.log('\n== INFERRED RELATIONSHIPS ==');
    relationships.forEach(rel => {
      console.log(`${rel.from_table}.${rel.from_column} -> ${rel.to_table}.${rel.to_column}`);
    });

    // Step 7: Summary
    console.log('\n== SCHEMA VALIDATION SUMMARY ==');
    console.log(`Analyzed ${Object.keys(tableStructures).length} tables`);
    console.log(`Found ${Object.values(idPatterns).flat().length} ID fields`);
    console.log(`Found ${Object.values(datePatterns).flat().length} date fields`);
    console.log(`Found ${allStatusValues.size} unique status values`);
    console.log(`Inferred ${relationships.length} relationships`);

    // Save full results
    const results = {
      tableStructures,
      idPatterns,
      datePatterns,
      statusValues: tableStatuses,
      relationships,
      missingTables,
    };

    global.schema_results = results;
    console.log('\nComplete schema results stored in global variable: schema_results');

    return results;
  } catch (error) {
    console.error('Error in schema validation:', error);
  }
}

validateSchema().catch(console.error);
