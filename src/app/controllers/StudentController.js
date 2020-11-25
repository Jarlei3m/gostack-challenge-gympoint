import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      age: Yup.string().required(),
      weight: Yup.string().required(),
      height: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;

    const studentExists = await Student.findOne({
      where: { email },
    });

    if (studentExists) {
      return res.status(401).json({ error: 'Student already exists' });
    }

    const { id, name, age, weight, height } = await Student.create(req.body);

    return res.json({
      student: {
        id,
        name,
        email,
        age,
        weight,
        height,
      },
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.string(),
      weight: Yup.string(),
      height: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(401).json({ error: 'Student not found!' });
    }

    const { email } = req.body;

    if (email !== student.email) {
      const emailExists = await Student.findOne({
        where: { email },
      });

      if (emailExists) {
        return res.status(401).json({ error: 'Email already taken' });
      }
    }

    const { name, age, weight, height } = await student.update(req.body);

    return res.json({
      student: {
        id,
        name,
        email,
        age,
        weight,
        height,
      },
    });
  }
}

export default new StudentController();
