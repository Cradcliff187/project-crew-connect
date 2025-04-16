// This script will execute SQL commands via the MCP proxy to create the necessary database objects
// It requires the MCP proxy to be running in another terminal

// Try to execute SQL directly to create the project_documents table
console.log(
  JSON.stringify({
    type: 'exec_sql',
    sql: `
    CREATE TABLE IF NOT EXISTS project_documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id TEXT REFERENCES projects(projectid),
      document_id TEXT,
      title TEXT,
      description TEXT,
      document_type TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  })
);
