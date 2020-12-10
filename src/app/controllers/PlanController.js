import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll();

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.string().required(),
      price: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      plan: {
        id,
        title,
        duration,
        price,
      },
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.string(),
      price: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(401).json({ error: 'Plan not found!' });
    }

    const { title, duration, price } = await plan.update(req.body);

    return res.json({
      plan: {
        id,
        title,
        duration,
        price,
      },
    });
  }

  async delete(req, res) {
    const { id } = req.params;
    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(401).json({ error: 'Plan not found!' });
    }

    await plan.destroy();

    return res.json(plan);
  }
}

export default new PlanController();
