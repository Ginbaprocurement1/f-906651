import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer";
import "dotenv";

const GMAIL_USER = Deno.env.get("GMAIL_USER");
const GMAIL_PASS = Deno.env.get("GMAIL_PASS");
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT")) || 587;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  supplier_name: string;
  supplier_email: string;
  po_id: string;
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // Using STARTTLS
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allows self-signed certificates
  }
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { supplier_name, supplier_email, po_id } = await req.json() as EmailRequest;

    console.log(📩 Sending email to supplier ${supplier_name} at ${supplier_email} for PO ${po_id});

    const mailOptions = {
      from: "Ginba Procurement" <${GMAIL_USER}>,
      to: supplier_email,
      subject: "Tienes un nuevo pedido",
      html: `
        <p>Hola ${supplier_name},</p>
        <p>¡Enhorabuena! Has recibido un nuevo pedido gracias a tu partnership con Ginba Procurement Partners.</p>
        <p>Consulta toda la información relacionada con este nuevo pedido en el siguiente enlace:</p>
        <p><a href="https://ginba.com">Acceder a Ginba</a></p>
        <p>Muchas gracias por trabajar con nosotros.</p>
        <p>Un saludo,<br>Ginba Procurement Partners</p>
      `,
    };

    // Send Email
    const emailResponse = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", emailResponse.response);

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Error in send-order-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);