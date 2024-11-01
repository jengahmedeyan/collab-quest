import { Resend } from 'resend';
import * as React from 'react';
import { EmailTemplate } from '@/components/invite-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['jengahmedeyan@gmail.com'],
      subject: "Hello world",
      react: EmailTemplate(
        { invitedEmail: 'delivered@resend.dev', projectName: 'Acme', inviterName: 'Bob', invitationLink: 'https://resend.dev' }
      ) as React.ReactElement,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}