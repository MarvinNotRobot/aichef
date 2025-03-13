import { createClient } from '@supabase/supabase-js';
import { appLogger } from '../logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Enhanced logging middleware
const logDatabaseOperation = (operation: string, details: any) => {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);

  appLogger.info(`Database Operation [${requestId}]`, {
    timestamp,
    operation,
    ...details
  });

  return requestId;
};

// Enhance database operations with detailed logging
const originalFrom = supabase.from.bind(supabase);
supabase.from = (table: string) => {
  const builder = originalFrom(table);
  const originalSelect = builder.select.bind(builder);
  const originalInsert = builder.insert.bind(builder);
  const originalUpdate = builder.update.bind(builder);
  const originalUpsert = builder.upsert.bind(builder);
  const originalDelete = builder.delete.bind(builder);

  // Enhance select
  builder.select = (...args: any[]) => {
    const requestId = logDatabaseOperation('SELECT', {
      table,
      query: args,
      filters: builder.filter
    });

    const query = originalSelect(...args);
    const originalThen = query.then.bind(query);

    query.then = (onfulfilled?: any, onrejected?: any) => {
      return originalThen((result: any) => {
        if (result.error) {
          appLogger.error(`Database Error [${requestId}]`, {
            operation: 'SELECT',
            table,
            error: {
              message: result.error.message,
              details: result.error.details,
              hint: result.error.hint,
              code: result.error.code
            },
            query: args,
            filters: builder.filter
          });
        } else {
          appLogger.info(`Database Success [${requestId}]`, {
            operation: 'SELECT',
            table,
            rowCount: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0)
          });
        }
        return onfulfilled?.(result);
      }, onrejected);
    };

    return query;
  };

  // Enhance insert
  builder.insert = (...args: any[]) => {
    const requestId = logDatabaseOperation('INSERT', {
      table,
      data: args[0]
    });

    const query = originalInsert(...args);
    const originalThen = query.then.bind(query);

    query.then = (onfulfilled?: any, onrejected?: any) => {
      return originalThen((result: any) => {
        if (result.error) {
          appLogger.error(`Database Error [${requestId}]`, {
            operation: 'INSERT',
            table,
            error: {
              message: result.error.message,
              details: result.error.details,
              hint: result.error.hint,
              code: result.error.code
            },
            data: args[0]
          });
        } else {
          appLogger.info(`Database Success [${requestId}]`, {
            operation: 'INSERT',
            table,
            rowCount: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0),
            insertedIds: Array.isArray(result.data) ? result.data.map((row: any) => row.id) : (result.data?.id ? [result.data.id] : [])
          });
        }
        return onfulfilled?.(result);
      }, onrejected);
    };

    return query;
  };

  // Enhance update
  builder.update = (...args: any[]) => {
    const requestId = logDatabaseOperation('UPDATE', {
      table,
      data: args[0],
      filters: builder.filter
    });

    const query = originalUpdate(...args);
    const originalThen = query.then.bind(query);

    query.then = (onfulfilled?: any, onrejected?: any) => {
      return originalThen((result: any) => {
        if (result.error) {
          appLogger.error(`Database Error [${requestId}]`, {
            operation: 'UPDATE',
            table,
            error: {
              message: result.error.message,
              details: result.error.details,
              hint: result.error.hint,
              code: result.error.code
            },
            data: args[0],
            filters: builder.filter
          });
        } else {
          appLogger.info(`Database Success [${requestId}]`, {
            operation: 'UPDATE',
            table,
            rowCount: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0),
            updatedIds: Array.isArray(result.data) ? result.data.map((row: any) => row.id) : (result.data?.id ? [result.data.id] : [])
          });
        }
        return onfulfilled?.(result);
      }, onrejected);
    };

    return query;
  };

  // Enhance upsert
  builder.upsert = (...args: any[]) => {
    const requestId = logDatabaseOperation('UPSERT', {
      table,
      data: args[0]
    });

    const query = originalUpsert(...args);
    const originalThen = query.then.bind(query);

    query.then = (onfulfilled?: any, onrejected?: any) => {
      return originalThen((result: any) => {
        if (result.error) {
          appLogger.error(`Database Error [${requestId}]`, {
            operation: 'UPSERT',
            table,
            error: {
              message: result.error.message,
              details: result.error.details,
              hint: result.error.hint,
              code: result.error.code
            },
            data: args[0]
          });
        } else {
          appLogger.info(`Database Success [${requestId}]`, {
            operation: 'UPSERT',
            table,
            rowCount: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0),
            affectedIds: Array.isArray(result.data) ? result.data.map((row: any) => row.id) : (result.data?.id ? [result.data.id] : [])
          });
        }
        return onfulfilled?.(result);
      }, onrejected);
    };

    return query;
  };

  // Enhance delete
  builder.delete = (...args: any[]) => {
    const requestId = logDatabaseOperation('DELETE', {
      table,
      filters: builder.filter
    });

    const query = originalDelete(...args);
    const originalThen = query.then.bind(query);

    query.then = (onfulfilled?: any, onrejected?: any) => {
      return originalThen((result: any) => {
        if (result.error) {
          appLogger.error(`Database Error [${requestId}]`, {
            operation: 'DELETE',
            table,
            error: {
              message: result.error.message,
              details: result.error.details,
              hint: result.error.hint,
              code: result.error.code
            },
            filters: builder.filter
          });
        } else {
          appLogger.info(`Database Success [${requestId}]`, {
            operation: 'DELETE',
            table,
            rowCount: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0),
            deletedIds: Array.isArray(result.data) ? result.data.map((row: any) => row.id) : (result.data?.id ? [result.data.id] : [])
          });
        }
        return onfulfilled?.(result);
      }, onrejected);
    };

    return query;
  };

  return builder;
};

// Add debug logging for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  appLogger.info('Auth state changed', {
    event,
    userId: session?.user?.id,
    timestamp: new Date().toISOString()
  });
});