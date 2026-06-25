import Appointment from '../models/Appointment.js';

export const getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id }).populate('doctorId');
    res.json(appointments);
  } catch (error) { next(error); }
};

export const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, time, reasonForVisit } = req.body;
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      time,
      reasonForVisit
    });
    res.status(201).json(appointment);
  } catch (error) { next(error); }
};
