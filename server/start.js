// Set environment variables before starting the server
process.env.SUPABASE_URL = 'https://dxmvqbeyhfnqczvlfnfn.supabase.co';
process.env.SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMDY2Mjk4NiwiZXhwIjoxOTM2MjM4OTg2fQ.nPwhV8XJx7Wihwd8szNIPIQK7ZZdvFVgT_0-bjNB4Oc';
process.env.SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjIwNjYyOTg2LCJleHAiOjE5MzYyMzg5ODZ9.CCOt7Lk1fbHXv3nH-iZJPqwGHlMZwdv3jtGu_8UZ4Wc';

process.env.GOOGLE_CLIENT_ID =
  '1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = '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';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:8080/auth/google/callback';
process.env.GOOGLE_MAPS_API_KEY = 'AIzaSyBnm_SGVt-UTI-1PlcnCaFZs7IHo1WdyG4';

process.env.SERVER_PORT = '8080';
process.env.SESSION_SECRET = 'akc-calendar-integration-secret';

// Start the server
console.log('Starting server with environment variables...');
require('./server.js');
