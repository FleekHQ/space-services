import fs from 'fs';
import path from 'path';
import textTemplate from './textTemplate';
import { EmailBody, Mail } from '../emailTypes';
import parseTemplateVars from '../utils/parse-template-vars';

const htmlTemplate = fs.readFileSync(
  path.join(__dirname, '../compiledHtmls/shareInvitation.html'),
  { encoding: 'utf-8' }
);

const shareInvitationEmail = (
  data: Mail.ShareInvitationLambdaMailerInput
): EmailBody => {
  const templateVars = {
    sendersName: `${data.data.senderName}`,
    fileName: data.data.fileName,
    inviteLink: data.data.invitationLink,
  };

  const html = parseTemplateVars(htmlTemplate, templateVars);
  const text = parseTemplateVars(textTemplate, templateVars);

  return {
    html,
    text,
    subject: `You have been invited to join a file ${templateVars.fileName} on Space`,
  };
};

export default shareInvitationEmail;
