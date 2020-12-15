import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class AnswerOrdersController {
  async index(req, res) {
    // get all unanswered questions
    const unansweredQuestions = await HelpOrder.findAll({
      where: { answer: null },
    });

    return res.json(unansweredQuestions);
  }

  async store(req, res) {
    // get question id
    const { id } = req.params;
    const helpOrder = await HelpOrder.findOne({
      where: { id, answer: null },
    });

    if (!helpOrder) {
      return res.status(401).json({
        error: 'This help order does not exist or has already been answered.',
      });
    }

    // get student id, name and email
    const { student_id } = helpOrder;
    const { name, email } = await Student.findByPk(student_id);

    // get answer
    const { answer } = req.body;

    // save answer on database
    await helpOrder.update({
      answer,
      answer_at: new Date(),
    });

    // notify student about the answer
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

    return res.json(helpOrder);
  }
}

export default new AnswerOrdersController();
