import fs from 'fs';
import path from 'path';
import textTemplate from './textTemplate';
import { EmailBody, Mail } from '../emailTypes';
import parseTemplateVars from '../utils/parse-template-vars';
import { FILE_TYPES, MAP_EXT_TO_FILE_TYPE } from '../constants';

const htmlTemplate = fs.readFileSync(
  path.join(__dirname, '../compiledHtmls/shareInvitation.html'),
  { encoding: 'utf-8' }
);

const iconTypeMapping = {
  [FILE_TYPES.FOLDER]: 'https://fleek-team-bucket.storage.fleek.co/space-emails/file-icons/Unknown.png',
  [FILE_TYPES.IMAGE]: 'https://fleek-team-bucket.storage.fleek.co/space-emails/file-icons/Image.png',
  [FILE_TYPES.PDF]: 'https://fleek-team-bucket.storage.fleek.co/space-emails/file-icons/PDF.png',
  [FILE_TYPES.ZIP]: 'https://fleek-team-bucket.storage.fleek.co/space-emails/file-icons/ZIP.png',
  [FILE_TYPES.WORD]: 'https://fleek-team-bucket.storage.fleek.co/space-emails/file-icons/TextDoc.png',
  [FILE_TYPES.VIDEO]: 'https://fleek-team-bucket.storage.fleek.co/space-emails/file-icons/Video.png',
  [FILE_TYPES.AUDIO]: 'https://fleek-team-bucket.storage.fleek.co/space-emails/file-icons/Audio.png',
  [FILE_TYPES.DEFAULT]: 'https://fleek-team-bucket.storage.fleek.co/space-emails/file-icons/Unknown.png',
  [FILE_TYPES.POWERPOINT]: 'https://fleek-team-bucket.storage.fleek.co/space-emails/file-icons/Presentation.png',
};

interface Mapping { [key: string]:string };

const getFileIcon = (filename: string) => {
  const splitName = filename.split(".");
  const ext = splitName[splitName.length - 1];
  const fileType = (<Mapping>MAP_EXT_TO_FILE_TYPE)[ext];
  const iconUrl = iconTypeMapping[fileType];
  return iconUrl;
};

const shareInvitationEmail = (
  data: Mail.ShareInvitationLambdaMailerInput
): EmailBody => {
  const templateVars = {
    sendersName: `${data.data.senderName}`,
    fileName: data.data.fileName,
    inviteLink: data.data.invitationLink,
    fileIconUrl: getFileIcon(data.data.fileName),
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
