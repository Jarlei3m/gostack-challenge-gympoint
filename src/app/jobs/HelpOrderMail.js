import { format } from 'date-fns';
import en from 'date-fns/locale/en-US';
import Mail from '../../lib/Mail';

class HelpOrderMail {
  get key() {
    return 'HelpOrderMail';
  }

  async handle({ data }) {
    const { name, email, student, question } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Support Request',
      template: 'question',
      context: {
        student: student.name,
        question,
        date: format(new Date(), " MMMM dd',' yyyy ", {
          locale: en,
        }),
      },
    });
  }
}

export default new HelpOrderMail();
