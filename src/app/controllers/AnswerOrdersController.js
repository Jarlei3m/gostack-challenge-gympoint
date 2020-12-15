import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import AnswerOrderMail from '../jobs/AnswerOrderMail';
import Queue from '../../lib/Queue';

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

    await Queue.add(AnswerOrderMail.key, {
      name,
      email,
      helpOrder,
      answer,
    });

    return res.json(helpOrder);
  }
}

export default new AnswerOrdersController();
