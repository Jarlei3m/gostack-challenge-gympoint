import { format } from 'date-fns';
import en from 'date-fns/locale/en-US';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import User from '../models/User';
import Mail from '../../lib/Mail';

class HelpOrdersController {
  async index(req, res) {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(401).json({ error: 'Student not found.' });
    }

    const allMyQuestions = await HelpOrder.findAll({
      where: { student_id: id },
    });

    return res.json(allMyQuestions);
  }

  async store(req, res) {
    // get student id from url
    const { id } = req.params;

    // get info from body
    const { student_id, question } = req.body;

    // check student_id equal to id from url
    if (student_id !== id) {
      return res.status(401).json({
        error: 'ID error. Please, check the informed id and try again.',
      });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(401).json({ error: 'Student id not found' });
    }

    // create question on database
    const helpOrder = await HelpOrder.create({
      student_id,
      question,
    });

    // send question by email to user admin
    const { name, email } = await User.findOne({
      where: { email: 'admin@gympoint.com' },
    });

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

    return res.json(helpOrder);
  }
}

export default new HelpOrdersController();
