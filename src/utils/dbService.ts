import { supabase } from '@/integrations/supabase/client';
import { EntityType } from '@/types/reports';
import { entityTableMap } from '@/data/reportEntities';
import { mapToDbFields, mapToFrontendFields, prepareStatusForDb, toDbField } from './fieldMapping';

type QueryFilters = Record<string, any>;
type QueryOptions = {
  limit?: number;
  offset?: number;
  orderBy?: {
    field: string;
    ascending?: boolean;
  };
};

/**
 * Creates a query builder with field name mapping
 * This handles the translation between frontend field names and database column names
 */
export function createQuery(
  entity: EntityType,
  fields: string[] = ['*'],
  filters: QueryFilters = {},
  options: QueryOptions = {}
) {
  // Map field names to database column names
  const tableName = entityTableMap[entity];
  const dbFields = fields.map(field => (field === '*' ? '*' : toDbField(entity, field)));

  // Build base query
  let query = supabase.from(tableName).select(dbFields.join(','));

  // Apply filters with mapped field names
  Object.entries(filters).forEach(([field, value]) => {
    const dbField = toDbField(entity, field);

    // Special handling for status field
    if (field === 'status' && typeof value === 'string') {
      value = prepareStatusForDb(entity, value);
    }

    if (value === null) {
      query = query.is(dbField, null);
    } else if (Array.isArray(value)) {
      query = query.in(dbField, value);
    } else if (typeof value === 'object') {
      // Handle operators like gt, lt, etc.
      Object.entries(value).forEach(([op, opValue]) => {
        switch (op) {
          case 'gt':
            query = query.gt(dbField, opValue);
            break;
          case 'gte':
            query = query.gte(dbField, opValue);
            break;
          case 'lt':
            query = query.lt(dbField, opValue);
            break;
          case 'lte':
            query = query.lte(dbField, opValue);
            break;
          case 'like':
            query = query.like(dbField, opValue);
            break;
          case 'ilike':
            query = query.ilike(dbField, opValue);
            break;
        }
      });
    } else {
      query = query.eq(dbField, value);
    }
  });

  // Apply options
  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  if (options.orderBy) {
    const dbField = toDbField(entity, options.orderBy.field);
    query = query.order(dbField, { ascending: options.orderBy.ascending ?? false });
  }

  return query;
}

/**
 * Executes a query and transforms the results to use frontend field names
 */
export async function executeQuery<T>(
  entity: EntityType,
  fields: string[] = ['*'],
  filters: QueryFilters = {},
  options: QueryOptions = {}
): Promise<T[]> {
  const query = createQuery(entity, fields, filters, options);
  const { data, error } = await query;

  if (error) {
    console.error(`Query error for ${entity}:`, error);
    throw error;
  }

  // Transform results to frontend field names
  return (data || []).map(item => mapToFrontendFields(entity, item)) as T[];
}

/**
 * Gets a single record by ID with frontend field mapping
 */
export async function getById<T>(
  entity: EntityType,
  id: string,
  fields: string[] = ['*']
): Promise<T | null> {
  // Map ID field correctly based on entity
  const idField = toDbField(entity, 'id');
  const results = await executeQuery<T>(entity, fields, { [idField]: id }, { limit: 1 });
  return results[0] || null;
}

/**
 * Creates a new record with field mapping between frontend and database
 */
export async function create<T>(entity: EntityType, data: Partial<T>): Promise<T> {
  const tableName = entityTableMap[entity];
  const dbData = mapToDbFields(entity, data);

  // Special handling for status fields
  if (dbData.status) {
    dbData.status = prepareStatusForDb(entity, dbData.status);
  }

  const { data: result, error } = await supabase.from(tableName).insert(dbData).select();

  if (error) {
    console.error(`Create error for ${entity}:`, error);
    throw error;
  }

  return mapToFrontendFields(entity, result[0]) as T;
}

/**
 * Updates an existing record with field mapping
 */
export async function update<T>(entity: EntityType, id: string, data: Partial<T>): Promise<T> {
  const tableName = entityTableMap[entity];
  const idField = toDbField(entity, 'id');
  const dbData = mapToDbFields(entity, data);

  // Special handling for status fields
  if (dbData.status) {
    dbData.status = prepareStatusForDb(entity, dbData.status);
  }

  const { data: result, error } = await supabase
    .from(tableName)
    .update(dbData)
    .eq(idField, id)
    .select();

  if (error) {
    console.error(`Update error for ${entity}:`, error);
    throw error;
  }

  return mapToFrontendFields(entity, result[0]) as T;
}

/**
 * Deletes a record with proper ID field mapping
 */
export async function remove(entity: EntityType, id: string): Promise<boolean> {
  const tableName = entityTableMap[entity];
  const idField = toDbField(entity, 'id');

  const { error } = await supabase.from(tableName).delete().eq(idField, id);

  if (error) {
    console.error(`Delete error for ${entity}:`, error);
    throw error;
  }

  return true;
}

/**
 * Counts records matching the given filters
 */
export async function count(entity: EntityType, filters: QueryFilters = {}): Promise<number> {
  const tableName = entityTableMap[entity];
  let query = supabase.from(tableName).select('*', { count: 'exact', head: true });

  // Apply filters with mapped field names
  Object.entries(filters).forEach(([field, value]) => {
    const dbField = toDbField(entity, field);

    // Special handling for status field
    if (field === 'status' && typeof value === 'string') {
      value = prepareStatusForDb(entity, value);
    }

    if (value === null) {
      query = query.is(dbField, null);
    } else if (Array.isArray(value)) {
      query = query.in(dbField, value);
    } else {
      query = query.eq(dbField, value);
    }
  });

  const { count: result, error } = await query;

  if (error) {
    console.error(`Count error for ${entity}:`, error);
    throw error;
  }

  return result || 0;
}
