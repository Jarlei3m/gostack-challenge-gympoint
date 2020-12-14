import { format, subDays } from 'date-fns';
import en from 'date-fns/locale/en-US';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import User from '../models/User';
import checkinNotification from '../schemas/CheckinNotification';

class CheckinController {
  async index(req, res) {
    //  check if is an admin
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(400).json({ error: 'For admins only' });
    }

    // get student id
    const { id } = req.params;
    const student = await Student.findByPk(id);

    // get student chekins(all) by student id
    const studentCheckins = await checkinNotification
      .find({
        student_id: student.id,
      })
      .sort({ createdAt: 'desc' });

    return res.json(studentCheckins);
  }

  async store(req, res) {
    // check if student exist
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(401).json({ error: 'Access denied! Not a student.' });
    }

    // check if student is enrolled
    const hasEnrollment = await Enrollment.findOne({
      where: { student_id: id },
    });

    if (!hasEnrollment) {
      return res.status(401).json({
        error: 'Access denied! Student does not have an active enrollment.',
      });
    }

    // check student checkins for the last seven days
    const startDay = subDays(new Date(), 7);

    const countCheckins = await checkinNotification
      .find({
        student_id: student.id,
      })
      .where('createdAt')
      .gt(startDay)
      .sort({ createdAt: 'desc' });

    if (countCheckins.length >= 5) {
      return res
        .status(401)
        .json({ error: 'Limit of 5 access per week has exceeded' });
    }

    // notify user admin about chekin
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(400).json({ error: 'For admins only' });
    }

    const formattedDate = format(new Date(), " MMMM dd',' yyyy ", {
      locale: en,
    });

    await checkinNotification.create({
      content: `Checkin by ${student.name} on ${formattedDate}`,
      user: user.id,
      student_id: student.id,
    });

    return res.json(`Checkin by ${student.name} on ${formattedDate}`);
  }
}

export default new CheckinController();
