import * as React from 'react';

interface EmailTemplateProps {
  invitedEmail: string; 
  projectName: string; 
  inviterName: string;
  invitationLink: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  invitedEmail,
  projectName,
  inviterName,
  invitationLink,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.5', color: '#333' }}>
    <h2>Invitation to Collaborate on {projectName}</h2>
    <p>Hello,</p>
    <p>
      You’ve been invited to collaborate on <strong>{projectName}</strong> by <strong>{inviterName}</strong>.
    </p>
    <p>
      This invitation was sent to <a href={`mailto:${invitedEmail}`} style={{ color: '#1a0dab' }}>{invitedEmail}</a>.
    </p>
    <p>
      Click the link below to join the project:
    </p>
    <p>
      <a href={invitationLink} style={{ color: '#1a73e8', textDecoration: 'underline' }}>
        Accept Invitation
      </a>
    </p>
    <p>Looking forward to collaborating with you!</p>
    <p>Best regards,<br />The {projectName} Team</p>
  </div>
);
