// Enhanced Supabase Schema Validator
// This script provides a comprehensive analysis of the database schema
// and aligns it with front-end types for validation purposes
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

// Front-end type interfaces for validation (simplified versions based on the codebase)
const frontendTypes = {
  employees: {
    name: 'Employee',
    fields: {
      employee_id: 'string',
      first_name: 'string',
      last_name: 'string',
      email: 'string | null',
      phone: 'string | null',
      role: 'string | null',
      hourly_rate: 'number | null',
      status: 'string | null',
      created_at: 'string',
      updated_at: 'string',
    },
  },
  projects: {
    name: 'Project',
    fields: {
      projectid: 'string',
      projectname: 'string',
      customerid: 'string | null',
      customername: 'string | null',
      jobdescription: 'string',
      status: 'string',
      createdon: 'string',
      sitelocationaddress: 'string | null',
      sitelocationcity: 'string | null',
      sitelocationstate: 'string | null',
      sitelocationzip: 'string | null',
      total_budget: 'number | null',
      current_expenses: 'number | null',
      budget_status: 'string | null',
    },
  },
  // Additional interfaces would be defined based on the codebase's type definitions
};

// Function to get database tables using PostgreSQL metadata
async function getAllTables() {
  try {
    console.log('Fetching all database tables from PostgreSQL information schema...');

    // Use PostgreSQL information schema to get all tables
    const { data, error } = await supabase.rpc('get_all_tables');

    if (error) {
      // If RPC is not available, fallback to direct SQL query
      const { data: tableData, error: tableError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

      if (tableError) {
        console.error('Failed to fetch tables:', tableError);
        // Last resort - use known tables from entity map
        return Object.values(entityTableMap);
      }

      if (tableData) {
        return tableData.map(t => t.tablename);
      }
    }

    if (data) {
      return data;
    }

    // Fallback to the known entity table map if everything fails
    console.log('Using fallback table list from entityTableMap.');
    return Object.values(entityTableMap);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return Object.values(entityTableMap);
  }
}

// Function to get table columns directly from PostgreSQL schema
async function getTableColumns(tableName) {
  try {
    console.log(`Fetching columns for table ${tableName} from information schema...`);

    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);

    if (error) {
      console.error(`Error fetching columns for ${tableName}:`, error);
      // Try fallback approach
      return analyzeTableData(tableName);
    }

    if (!data || data.length === 0) {
      console.log(`No columns found for ${tableName} in information schema.`);
      return analyzeTableData(tableName);
    }

    return data.map(col => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === 'YES',
      default: col.column_default,
    }));
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error);
    return [];
  }
}

// Fallback function to analyze table structure by querying actual data
async function analyzeTableData(tableName) {
  try {
    console.log(`Analyzing table structure for ${tableName} via data sample...`);

    // Try to get a sample row
    const { data, error } = await supabase.from(tableName).select('*').limit(1);

    if (error) {
      console.error(`Error querying table ${tableName}:`, error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`No data found in table ${tableName}, using empty query.`);
      // Table exists but is empty, try to get columns via API call structure
      const columnsResult = await supabase.from(tableName).select('').limit(0);
      if (columnsResult.error) {
        console.error(`Error getting structure for ${tableName}:`, columnsResult.error);
        return [];
      }

      // Try to extract column names from the query definition
      const columnNames = Object.keys(columnsResult.data?.length ? columnsResult.data[0] : {});
      return columnNames.map(name => ({
        name,
        type: 'unknown', // We don't know the type without data
        nullable: true, // Assuming nullable by default
      }));
    }

    // Extract columns from the sample row
    const sampleRow = data[0];
    return Object.keys(sampleRow).map(colName => {
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
  } catch (error) {
    console.error(`Error analyzing table ${tableName}:`, error);
    return [];
  }
}

// Function to check for direct foreign keys via PostgreSQL metadata
async function getForeignKeyConstraints() {
  try {
    console.log('Fetching foreign key constraints from PostgreSQL...');

    const { data, error } = await supabase
      .from('information_schema.key_column_usage')
      .select(
        `
        constraint_name,
        table_name,
        column_name,
        referenced_table_name:table_name,
        referenced_column_name:column_name
      `
      )
      .eq('table_schema', 'public')
      .not('referenced_table_name', 'is', null);

    if (error) {
      console.error('Error fetching foreign key constraints:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No foreign key constraints found in database.');
      return [];
    }

    return data.map(fk => ({
      constraint_name: fk.constraint_name,
      from_table: fk.table_name,
      from_column: fk.column_name,
      to_table: fk.referenced_table_name,
      to_column: fk.referenced_column_name,
      type: 'direct',
      confidence: 'high',
    }));
  } catch (error) {
    console.error('Error getting foreign key constraints:', error);
    return [];
  }
}

// Function to check for status values in a table
async function getStatusValues(tableName) {
  try {
    // First check if status column exists
    const columns = await getTableColumns(tableName);
    const hasStatusColumn = columns.some(col => col.name === 'status');

    if (!hasStatusColumn) {
      return { exists: false };
    }

    // Try to get all status values directly
    const { data, error } = await supabase
      .from(tableName)
      .select('status')
      .not('status', 'is', null)
      .limit(100);

    if (error) {
      console.log(`Error querying status values in ${tableName}:`, error.message);
      return { exists: true, values: [] };
    }

    // Extract unique status values and check if they're uppercase, lowercase, or mixed
    const statusValues = new Set();
    let uppercaseCount = 0;
    let lowercaseCount = 0;
    let mixedCount = 0;

    // Track status value frequencies
    const valueFrequencies = {};

    data.forEach(row => {
      if (row.status) {
        statusValues.add(row.status);

        // Track frequencies
        valueFrequencies[row.status] = (valueFrequencies[row.status] || 0) + 1;

        if (row.status === row.status.toUpperCase()) uppercaseCount++;
        else if (row.status === row.status.toLowerCase()) lowercaseCount++;
        else mixedCount++;
      }
    });

    let caseConvention = 'unknown';
    if (uppercaseCount > lowercaseCount && uppercaseCount > mixedCount) {
      caseConvention = 'uppercase';
    } else if (lowercaseCount > uppercaseCount && lowercaseCount > mixedCount) {
      caseConvention = 'lowercase';
    } else if (mixedCount > uppercaseCount && mixedCount > lowercaseCount) {
      caseConvention = 'mixed';
    }

    // Format the values for display
    const formattedValues = Array.from(statusValues).map(val => ({
      value: val,
      count: valueFrequencies[val],
      isUppercase: val === val.toUpperCase(),
    }));

    return {
      exists: true,
      values: Array.from(statusValues),
      formattedValues,
      caseConvention,
      stats: { uppercase: uppercaseCount, lowercase: lowercaseCount, mixed: mixedCount },
      uniqueCount: statusValues.size,
    };
  } catch (error) {
    console.error(`Error getting status values for ${tableName}:`, error);
    return { exists: false, error: error.message };
  }
}

// Function to analyze date field patterns
async function analyzeDateFields(tableName, columns) {
  const dateColumns = columns.filter(
    col =>
      col.name.includes('date') ||
      col.name.includes('_at') ||
      col.name.includes('_on') ||
      col.type.includes('timestamp') ||
      col.type.includes('date')
  );

  const datePatterns = dateColumns.map(col => ({
    name: col.name,
    type: col.type,
    sample: col.sample,
    pattern:
      col.name === 'created_at'
        ? 'standard_created'
        : col.name === 'updated_at'
          ? 'standard_updated'
          : col.name === 'createdon'
            ? 'legacy_created'
            : col.name === 'datecreated'
              ? 'alternative_created'
              : col.name.endsWith('_date')
                ? 'standard_domain_date'
                : col.name.endsWith('date')
                  ? 'legacy_domain_date'
                  : 'other',
  }));

  return datePatterns;
}

// Function to analyze ID field patterns
async function analyzeIdFields(tableName, columns) {
  const idColumns = columns.filter(
    col => col.name === 'id' || col.name.endsWith('id') || col.name.endsWith('_id')
  );

  const idPatterns = idColumns.map(col => ({
    name: col.name,
    type: col.type,
    sample: col.sample,
    pattern:
      col.name === 'id'
        ? 'standard_id'
        : col.name.endsWith('_id')
          ? 'standard_foreign_key'
          : col.name === `${tableName.replace(/s$/, '')}_id`
            ? 'standard_entity_id'
            : col.name === `${tableName.replace(/s$/, '')}id`
              ? 'legacy_entity_id'
              : 'other',
  }));

  return idPatterns;
}

// Function to check frontend-database field alignment
function checkFieldAlignment(tableName, dbColumns, frontendType) {
  if (!frontendType) {
    return { aligned: false, reason: 'No frontend type found' };
  }

  const dbFieldSet = new Set(dbColumns.map(col => col.name));
  const frontendFields = Object.keys(frontendType.fields);

  const missingInDb = frontendFields.filter(field => !dbFieldSet.has(field));
  const extraInDb = [...dbFieldSet].filter(field => !frontendType.fields[field]);

  return {
    aligned: missingInDb.length === 0,
    missingInDb,
    extraInDb,
    frontendFields,
    dbFields: [...dbFieldSet],
  };
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

// Main validation function
async function validateSchema() {
  console.log('Starting enhanced schema validation...');

  try {
    // Step 1: Get all tables from the database
    const allTables = await getAllTables();
    console.log(`Found ${allTables.length} tables in the database:`, allTables);

    // Step 2: Analyze tables from entity mapping and validate structure
    const tableStructures = {};
    const statusAnalysis = {};
    const dateFieldAnalysis = {};
    const idFieldAnalysis = {};
    const alignmentResults = {};
    const missingTables = [];

    // Check each table from the entity mapping
    for (const [entity, tableName] of Object.entries(entityTableMap)) {
      console.log(`\nAnalyzing table "${tableName}" for entity "${entity}"...`);

      if (!allTables.includes(tableName)) {
        console.log(`⚠️ Table "${tableName}" referenced by "${entity}" does not exist!`);
        missingTables.push({ entity, tableName });
        continue;
      }

      // Get columns for this table
      const columns = await getTableColumns(tableName);

      if (!columns || columns.length === 0) {
        console.log(`⚠️ Could not retrieve columns for "${tableName}"!`);
        tableStructures[tableName] = { exists: true, columns: [], missingColumns: true };
        continue;
      }

      console.log(`✓ Table "${tableName}" exists with ${columns.length} columns`);
      tableStructures[tableName] = { exists: true, columns };

      // Analyze status field
      const statusResults = await getStatusValues(tableName);
      if (statusResults.exists) {
        statusAnalysis[tableName] = statusResults;
        console.log(
          `  Status field found with ${statusResults.values.length} values (${statusResults.caseConvention})`
        );
        if (statusResults.values.length > 0) {
          console.log(`  Status values: ${statusResults.values.join(', ')}`);
        }
      } else {
        console.log(`  No status field found`);
      }

      // Analyze date fields
      const dateFields = await analyzeDateFields(tableName, columns);
      if (dateFields.length > 0) {
        dateFieldAnalysis[tableName] = dateFields;
        console.log(`  Found ${dateFields.length} date fields`);
      }

      // Analyze ID fields
      const idFields = await analyzeIdFields(tableName, columns);
      if (idFields.length > 0) {
        idFieldAnalysis[tableName] = idFields;
        console.log(`  Found ${idFields.length} ID fields`);
      }

      // Check alignment with frontend type
      const frontendType = frontendTypes[entity];
      const alignment = checkFieldAlignment(tableName, columns, frontendType);
      alignmentResults[entity] = alignment;

      if (alignment.aligned) {
        console.log(`  ✓ Frontend type alignment: Aligned with ${frontendType.name}`);
      } else if (frontendType) {
        console.log(`  ⚠️ Frontend type alignment: Misaligned with ${frontendType.name}`);
        console.log(`    Fields missing in DB: ${alignment.missingInDb.join(', ') || 'None'}`);
        console.log(
          `    Extra fields in DB: ${alignment.extraInDb.slice(0, 5).join(', ')}${alignment.extraInDb.length > 5 ? '...' : ''}`
        );
      } else {
        console.log(`  ⚠️ No frontend type found for "${entity}"`);
      }
    }

    // Step 3: Get direct foreign key relationships
    const directRelationships = await getForeignKeyConstraints();
    console.log(`\nFound ${directRelationships.length} direct foreign key relationships`);

    // Step 4: Infer additional relationships
    const inferredRelationships = inferRelationships(tableStructures);
    console.log(`Inferred ${inferredRelationships.length} additional relationships`);

    // Step 5: Analysis of patterns
    console.log('\n== SCHEMA PATTERN ANALYSIS ==');

    // ID patterns
    const idPatternTypes = new Set();
    Object.values(idFieldAnalysis).forEach(fields => {
      fields.forEach(field => idPatternTypes.add(field.pattern));
    });
    console.log(`\nID Patterns (${idPatternTypes.size}):`);
    idPatternTypes.forEach(pattern => console.log(`- ${pattern}`));

    // Date patterns
    const datePatternTypes = new Set();
    Object.values(dateFieldAnalysis).forEach(fields => {
      fields.forEach(field => datePatternTypes.add(field.pattern));
    });
    console.log(`\nDate Field Patterns (${datePatternTypes.size}):`);
    datePatternTypes.forEach(pattern => console.log(`- ${pattern}`));

    // Status values and conventions
    const statusConventions = {};
    const allStatusValues = new Set();

    console.log(`\nStatus Values by Table:`);
    Object.entries(statusAnalysis).forEach(([table, analysis]) => {
      if (!statusConventions[analysis.caseConvention]) {
        statusConventions[analysis.caseConvention] = 0;
      }
      statusConventions[analysis.caseConvention]++;

      // Display status values for this table with their case convention
      console.log(`- ${table} (${analysis.caseConvention}): ${analysis.values.join(', ')}`);

      // Add to overall set of values
      analysis.values.forEach(val => allStatusValues.add(val));
    });

    console.log(`\nAll Unique Status Values (${allStatusValues.size}):`);
    allStatusValues.forEach(value => console.log(`- ${value}`));

    console.log(`\nStatus Conventions:`);
    Object.entries(statusConventions).forEach(([convention, count]) => {
      console.log(`- ${convention}: ${count} tables`);
    });

    // Step 6: Summary
    console.log('\n== SCHEMA VALIDATION SUMMARY ==');
    console.log(`Analyzed ${Object.keys(tableStructures).length} tables`);
    console.log(`Missing tables: ${missingTables.length}`);

    const idFieldCount = Object.values(idFieldAnalysis).reduce(
      (sum, fields) => sum + fields.length,
      0
    );
    console.log(`ID fields: ${idFieldCount}`);

    const dateFieldCount = Object.values(dateFieldAnalysis).reduce(
      (sum, fields) => sum + fields.length,
      0
    );
    console.log(`Date fields: ${dateFieldCount}`);

    const tablesWithStatus = Object.keys(statusAnalysis).length;
    console.log(`Tables with status fields: ${tablesWithStatus}`);

    const totalRelationships = directRelationships.length + inferredRelationships.length;
    console.log(
      `Relationships: ${totalRelationships} (${directRelationships.length} direct, ${inferredRelationships.length} inferred)`
    );

    const alignedCount = Object.values(alignmentResults).filter(a => a.aligned).length;
    const totalWithTypes = Object.keys(frontendTypes).length;
    console.log(`Frontend type alignment: ${alignedCount}/${totalWithTypes} entities aligned`);

    // Save full results
    const results = {
      timestamp: new Date().toISOString(),
      tables: allTables,
      tableStructures,
      statusAnalysis,
      dateFieldAnalysis,
      idFieldAnalysis,
      relationships: {
        direct: directRelationships,
        inferred: inferredRelationships,
      },
      alignmentResults,
      missingTables,
      summary: {
        tablesCount: Object.keys(tableStructures).length,
        missingTablesCount: missingTables.length,
        idFieldCount,
        dateFieldCount,
        tablesWithStatus,
        relationshipsCount: totalRelationships,
        alignedTypesCount: alignedCount,
        totalTypesCount: totalWithTypes,
        allStatusValues: Array.from(allStatusValues),
      },
    };

    global.schema_results = results;
    console.log('\nComplete schema results stored in global variable: schema_results');

    return results;
  } catch (error) {
    console.error('Error in schema validation:', error);
    return { error: error.message };
  }
}

// Run validation and handle any errors
validateSchema()
  .then(results => {
    if (results.error) {
      console.error('Schema validation failed:', results.error);
    } else {
      console.log('Schema validation completed successfully.');
    }
  })
  .catch(err => {
    console.error('Unexpected error during validation:', err);
  });
