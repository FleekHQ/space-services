import { Mail, EmailBody } from './emailTypes';
import renderShareInvitationEmail from './shareInvitation';

type RendererFunction = (mail: Mail.LambdaMailerInput) => EmailBody;

interface MailTypeToRenderer {
  [key: string]: RendererFunction;
}

const mapMailTypeToRendered: MailTypeToRenderer = {
  [Mail.MailType.shareInvitation]: renderShareInvitationEmail,
};

const render = (mail: Mail.LambdaMailerInput): EmailBody => {
  const { type } = mail;
  const renderer = mapMailTypeToRendered[type];

  if (!renderer) {
    const error = `Error while sending email. No renderer exists for type ${type}`;
    console.error(error);
    throw new Error(error);
  }

  return renderer(mail);
};

export default render;
