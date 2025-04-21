@echo off
echo Moving files to the appropriate directories...

REM Create directories if they don't exist
if not exist db\scripts mkdir db\scripts
if not exist db\tests mkdir db\tests
if not exist db\archive mkdir db\archive

REM Move check scripts to db\scripts
echo Moving check scripts to db\scripts...
for %%f in (check-*.js) do (
  if exist %%f move %%f db\scripts\
)

REM Move MCP and utility scripts to db\scripts
echo Moving utility scripts to db\scripts...
if exist mcp-check-tables.js move mcp-check-tables.js db\scripts\
if exist mcp-direct-query.js move mcp-direct-query.js db\scripts\
if exist execute-sql-via-mcp.js move execute-sql-via-mcp.js db\scripts\
if exist create-function-mcp.js move create-function-mcp.js db\scripts\
if exist create-tables-direct.js move create-tables-direct.js db\scripts\
if exist full-schema-validator.js move full-schema-validator.js db\scripts\
if exist validate-schema.js move validate-schema.js db\scripts\
if exist query-supabase.js move query-supabase.js db\scripts\
if exist run-db-validations.js move run-db-validations.js db\scripts\
if exist query-revisions.js move query-revisions.js db\scripts\
if exist mcp-query.js move mcp-query.js db\scripts\

REM Move test scripts to db\tests
echo Moving test scripts to db\tests...
if exist conversion-diagnosis.js move conversion-diagnosis.js db\tests\
if exist convert-real-estimate.js move convert-real-estimate.js db\tests\
if exist direct-conversion.js move direct-conversion.js db\tests\
if exist direct-update.js move direct-update.js db\tests\
if exist simple-conversion.js move simple-conversion.js db\tests\
if exist multi-step-conversion.js move multi-step-conversion.js db\tests\
if exist manual-update.js move manual-update.js db\tests\
if exist fix-estimate-conversion.js move fix-estimate-conversion.js db\tests\
if exist simple-test.js move simple-test.js db\tests\
if exist test-*.js move test-*.js db\tests\

REM Move SQL files to db\archive (excluding those in db\migrations or db\functions)
echo Moving SQL files to db\archive...
for %%f in (*.sql) do (
  if exist %%f (
    if not "%%f"=="db\migrations\001_convert_estimate_function.sql" (
      if not "%%f"=="db\functions\convert_estimate_to_project.sql" (
        move %%f db\archive\
      )
    )
  )
)

REM Move documentation to db\archive
if exist database-optimization-plan.md move database-optimization-plan.md db\archive\

echo Done organizing files!
