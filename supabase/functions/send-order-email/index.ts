import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderEmailRequest {
  supplier_name: string;
  supplier_email: string;
  po_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { supplier_name, supplier_email, po_id } = await req.json() as OrderEmailRequest;

    console.log(`Sending email to supplier ${supplier_name} at ${supplier_email} for PO ${po_id}`);

    const { data, error } = await resend.emails.send({
      from: "Ginba Procurement <onboarding@resend.dev>",
      to: [supplier_email],
      subject: "Tienes un nuevo pedido",
      html: `
        <p>Hola ${supplier_name},</p>
        <p>¡Enhorabuena! Has recibido un nuevo pedido gracias a tu partnership con Ginba Procurement Partners.</p>
        <p>Consulta toda la información relacionada con este nuevo pedido en el siguiente enlace:</p>
        <p><a href="https://ginba.com">Acceder a Ginba</a></p>
        <p>Muchas gracias por trabajar con nosotros.</p>
        <p>Un saludo,<br>Ginba Procurement Partners</p>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in send-order-email function:', error);
    return new Response(
      JSON.stringify({ error: `Failed to send email: ${error}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);