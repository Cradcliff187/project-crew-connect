
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { estimate_id, revision_id, items } = await req.json();
    
    if (!estimate_id || !revision_id) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters", 
          details: "Estimate ID and Revision ID are required" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Create a Supabase client with the auth context of the user making the request
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Generate a unique storage path for the PDF
    const timestamp = new Date().getTime();
    const fileName = `estimate-${estimate_id}-v${items[0]?.revision_version || '1'}-${timestamp}.pdf`;
    const storagePath = `estimates/${estimate_id}/${fileName}`;
    
    // Since we can't generate a PDF on the server in this example, we'll create a placeholder document
    // In a real implementation, you'd use a PDF generation library or service
    
    // Create document record
    const { data: documentData, error: documentError } = await supabaseClient
      .from("documents")
      .insert({
        entity_type: "ESTIMATE",
        entity_id: estimate_id,
        file_name: fileName,
        file_type: "application/pdf",
        storage_path: storagePath,
        category: "ESTIMATE_PDF",
        created_by: "SYSTEM",
        status: "ACTIVE",
        notes: JSON.stringify({
          revision_id,
          generated_at: new Date().toISOString(),
        }),
      })
      .select("document_id")
      .single();

    if (documentError) {
      console.error("Error creating document record:", documentError);
      throw documentError;
    }
    
    // Return the document ID
    return new Response(
      JSON.stringify({ document_id: documentData.document_id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in generate-estimate-pdf function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
