import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  supplier_id: number;
  po_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { supplier_id, po_id }: WebhookPayload = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2eXR5ZGd1aGJybmtjZmxobW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNDcxNzIsImV4cCI6MjA0ODYyMzE3Mn0.4IY2Im2O6Yau8_k5S2_bFH3dMCq58Vgf_k-TWtzZoe0')!
    const supabaseKey = Deno.env.get('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2eXR5ZGd1aGJybmtjZmxobW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzA0NzE3MiwiZXhwIjoyMDQ4NjIzMTcyfQ.A9cnJ65Gdl53YRCoe3aeD2huYTbD1UhgzQOWNhR68XU')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get supplier email
    const { data: supplierData, error: supplierError } = await supabase
      .from('master_suppliers_company')
      .select('supplier_email')
      .eq('supplier_id', supplier_id)
      .single()

    if (supplierError) throw supplierError

    // Send to webhook
    const webhookUrl = 'https://hook.eu2.make.com/k5i2554o6e5njj0qwmciczacvanzt21f'
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        supplier_email: supplierData.supplier_email,
        po_id: po_id
      })
    })

    if (!response.ok) {
      throw new Error(`Webhook call failed: ${response.statusText}`)
    }

    console.log('Successfully sent webhook notification for PO:', po_id)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in notify-po-webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
