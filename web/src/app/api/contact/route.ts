import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServiceRoleClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

const DEPARTMENT_EMAILS: Record<string, string> = {
  atencion_cliente: 'direccion@rmarcabaleares.com',
  comercial: 'comercial@rmarcabaleares.com',
};

const DEPARTMENT_LABELS: Record<string, string> = {
  atencion_cliente: 'Atencion al Cliente',
  comercial: 'Venta / Marketing',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { department, name, email, phone, subject, message } = body;

    if (!department || !name || !email || !message) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    if (!['atencion_cliente', 'comercial'].includes(department)) {
      return NextResponse.json(
        { error: 'Departamento no valido' },
        { status: 400 }
      );
    }

    const toEmail = DEPARTMENT_EMAILS[department];
    const deptLabel = DEPARTMENT_LABELS[department];

    const { error } = await resend.emails.send({
      from: 'Radio Marca Baleares <no-reply@rmarcabaleares.com>',
      to: toEmail,
      replyTo: email,
      subject: subject
        ? `[${deptLabel}] ${subject}`
        : `[${deptLabel}] Nuevo mensaje de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B3C6E; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Radio Marca Baleares</h1>
            <p style="color: #93B4E0; margin: 4px 0 0; font-size: 13px;">${deptLabel}</p>
          </div>
          <div style="padding: 24px; background: #f9f9f9;">
            <h2 style="color: #1B3C6E; margin-top: 0;">Nuevo mensaje de contacto</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555; width: 100px;">Nombre:</td>
                <td style="padding: 8px 0; color: #222;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 8px 0; color: #222;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              ${phone ? `<tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Telefono:</td>
                <td style="padding: 8px 0; color: #222;"><a href="tel:${phone}">${phone}</a></td>
              </tr>` : ''}
              ${subject ? `<tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Asunto:</td>
                <td style="padding: 8px 0; color: #222;">${subject}</td>
              </tr>` : ''}
            </table>
            <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #555; font-size: 12px; font-weight: bold; text-transform: uppercase;">Mensaje:</p>
              <p style="margin: 8px 0 0; color: #222; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="padding: 16px; background: #eee; text-align: center; font-size: 12px; color: #888;">
            Enviado desde el formulario de contacto de rmarcabaleares.com
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Error al enviar el email' },
        { status: 500 }
      );
    }

    // Save to database so superadmins can see messages in admin panel
    try {
      const supabase = await createServiceRoleClient();
      await supabase.from('contact_submissions').insert({
        department,
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        is_read: false,
      });
    } catch (dbErr) {
      console.error('Error saving contact to DB:', dbErr);
      // Don't fail the request — email was already sent
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
