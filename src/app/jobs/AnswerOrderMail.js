import Mail from '../../lib/Mail';

class AnswerOrderMail {
  get key() {
    return 'AnswerOrderMail';
  }

  async handle({ data }) {
    const { name, email, helpOrder, answer } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Answer Support Request',
      template: 'answer',
      context: {
        student: name,
        question: helpOrder.question,
        answer,
      },
    });
  }
}

export default new AnswerOrderMail();
