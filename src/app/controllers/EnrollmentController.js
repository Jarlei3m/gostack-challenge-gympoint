import * as Yup from 'yup';
import { addMonths, format, parseISO, isBefore } from 'date-fns';
import en from 'date-fns/locale/en-US';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Mail from '../../lib/Mail';

class EnrollmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const enrollment = await Enrollment.findAll({
      order: ['start_date'],
      attributes: ['id', 'student_id', 'plan_id', 'start_date', 'end_date'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(enrollment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    // check if student exist
    const student = await Student.findOne({
      where: { id: student_id },
    });

    if (!student) {
      return res.status(401).json({ error: 'Student does not exist' });
    }

    // check if student is enrolled
    const hasEnrollment = await Enrollment.findOne({
      where: { student_id },
    });

    if (hasEnrollment) {
      return res.status(401).json({
        error: 'The student is already enrolled',
      });
    }

    // check if plan exist
    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exist' });
    }

    // Calculating the price according to the plan
    const { price, duration } = plan;
    const totalPrice = price * duration;

    // check if start_date has past
    const dayStart = parseISO(start_date);

    if (isBefore(dayStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }

    // Calculating the end_date
    const end_date = addMonths(dayStart, duration);

    // create the enrollment
    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date: dayStart,
      end_date,
      price: totalPrice,
    });

    // Notify stundent about the enrollment

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Successful Registration',
      template: 'enrollConfirmation',
      context: {
        student: student.name,
        plan: plan.title,
        price: `$${totalPrice},00`,
        start_date: format(dayStart, " MMMM dd',' yyyy ", {
          locale: en,
        }),
        end_date: format(end_date, " MMMM dd',' yyyy ", {
          locale: en,
        }),
      },
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(401).json({ error: 'Validation fails' });
    }

    // check if enrollment exist
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(401).json({ error: 'Enrrolment not found' });
    }

    const { plan_id, start_date } = req.body;

    // check if plan exist
    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exist' });
    }

    // Calculating the price with the new Plan
    const { price, duration } = plan;
    const totalPrice = price * duration;

    // check if start_date has past
    const dayStart = parseISO(start_date);

    if (isBefore(dayStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }

    // Calculating the new end_date
    const end_date = addMonths(dayStart, duration);

    await enrollment.update({
      plan_id,
      start_date,
      end_date,
      price: totalPrice,
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    // check if enrollment exist
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(401).json({ error: 'Enrollment not found!' });
    }

    await enrollment.destroy();

    return res.json({
      message: `enrrolment with id ${id} was successfully deleted`,
    });
  }
}

export default new EnrollmentController();
