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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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