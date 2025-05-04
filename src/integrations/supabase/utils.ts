/**
 * Supabase utility functions for database operations
 *
 * These utilities provide a standardized way to interact with Supabase.
 * For development and testing, you can also use the MCP server (node start-mcp.js)
 * which provides additional capabilities via a different interface.
 */
import { supabase } from './client';

/**
 * Executes SQL using available RPC functions
 * @param sql - SQL to execute
 * @returns Object with success flag and error if applicable
 */
export async function executeSql(sql: string): Promise<{ success: boolean; error?: any }> {
  try {
    // First try execute_sql_command
    const { error: cmdError } = await supabase.rpc('execute_sql_command', {
      p_sql: sql,
    });

    if (!cmdError) {
      console.log('SQL executed successfully using execute_sql_command');
      return { success: true };
    }

    // Then try execute_sql_query
    const { error: queryError } = await supabase.rpc('execute_sql_query', {
      p_sql: sql,
    });

    if (!queryError) {
      console.log('SQL executed successfully using execute_sql_query');
      return { success: true };
    }

    // If both fail, return the error
    return { success: false, error: queryError };
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { success: false, error };
  }
}

// Define interfaces for result types
interface ExistsResult {
  exists: boolean;
}

interface ColumnResult {
  column_name: string;
}

/**
 * Checks if a table exists in the database
 * @param tableName - Name of the table to check
 * @returns Whether the table exists
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    // Direct query approach
    const { data, error } = await supabase.rpc('execute_sql_query', {
      p_sql: `SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = '${tableName}'
      ) as "exists"`,
    });

    if (error) {
      console.error(`Error checking if table '${tableName}' exists:`, error);
      return false;
    }

    // The query returns an array with one object that has an "exists" property
    if (!data || !data.length) return false;

    // First do a safe cast to unknown, then to our type
    const result = data[0] as unknown as ExistsResult;
    return result?.exists === true;
  } catch (error) {
    console.error(`Error checking if table '${tableName}' exists:`, error);
    return false;
  }
}

/**
 * Checks if specified columns exist in a table
 * @param tableName - Name of the table to check
 * @param columnNames - Array of column names to check
 * @returns Object with existence status for each column
 */
export async function columnsExist(
  tableName: string,
  columnNames: string[]
): Promise<Record<string, boolean>> {
  try {
    const result: Record<string, boolean> = {};

    // Use a single query to check all columns
    const columnsStr = columnNames.map(col => `'${col}'`).join(',');
    const { data, error } = await supabase.rpc('execute_sql_query', {
      p_sql: `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
        AND column_name IN (${columnsStr})
      `,
    });

    if (error) {
      console.error(`Error checking columns in '${tableName}':`, error);
      columnNames.forEach(col => (result[col] = false));
      return result;
    }

    // Mark each column as existing or not
    const existingColumns = data
      ? (data as unknown as ColumnResult[]).map(row => row.column_name)
      : [];

    columnNames.forEach(col => {
      result[col] = existingColumns.includes(col);
    });

    return result;
  } catch (error) {
    console.error(`Error checking columns in '${tableName}':`, error);
    return columnNames.reduce((acc, col) => ({ ...acc, [col]: false }), {});
  }
}
