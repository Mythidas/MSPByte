import { CreateEmailOptions, CreateEmailRequestOptions, Resend } from 'resend';

const resend = new Resend(process.env.NEXT_RESEND_API_KEY);

export const sendEmail = async (
  payload: Omit<CreateEmailOptions, 'from'>,
  options?: CreateEmailRequestOptions
) => {
  return resend.emails.send(
    {
      from: 'no-reply@mspbyte.pro',
      html: '',
      ...payload,
    },
    options
  );
};
