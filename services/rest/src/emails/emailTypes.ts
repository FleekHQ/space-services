export interface EmailBody {
  html: string;
  text?: string;
  subject: string;
  from?: string;
}

export namespace Mail {
  export enum MailType {
    shareInvitation = 'shareInvitation',
  }

  export interface LambdaMailerInput {
    data: object;

    /**
     * Identifies which of the children of this interface is being used.
     */
    type: MailType;
    toAddresses: string[] | string;
    subject?: string;
  }

  export interface ShareInvitationData {
    fileName: string;
    invitationLink: string;
    senderName: string;
  }

  export interface ShareInvitationLambdaMailerInput extends LambdaMailerInput {
    data: ShareInvitationData;
  }
}
