import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

// GET /api/appointments — Get patient's own appointments
export const getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      })
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) { next(error); }
};

// POST /api/appointments — Create a new appointment
export const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, time, reasonForVisit } = req.body;

    if (!doctorId || !date || !time || !reasonForVisit) {
      res.status(400);
      throw new Error('doctorId, date, time, and reasonForVisit are required');
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      time,
      reasonForVisit,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      });

    res.status(201).json(populated);
  } catch (error) { next(error); }
};

// GET /api/appointments/:id — Get single appointment with population
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      })
      .populate('patientId', 'name email profilePicture phone');

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    // Access check
    const isPatient = appointment.patientId._id.toString() === req.user._id.toString();
    let isDoctor = false;

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      isDoctor = doctor && appointment.doctorId._id.toString() === doctor._id.toString();
    }

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this appointment');
    }

    res.json(appointment);
  } catch (error) { next(error); }
};

// PATCH /api/appointments/:id — Update appointment status / reschedule
export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    const { status, date, time, meetingLink } = req.body;

    if (req.user.role === 'patient') {
      // Patients can only cancel their own appointments
      if (appointment.patientId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this appointment');
      }
      if (status && status !== 'cancelled') {
        res.status(403);
        throw new Error('Patients can only cancel appointments');
      }
      if (status) appointment.status = status;
      // Allow rescheduling (date/time changes) when not yet confirmed
      if (date && appointment.status !== 'confirmed' && appointment.status !== 'completed') {
        appointment.date = date;
      }
      if (time && appointment.status !== 'confirmed' && appointment.status !== 'completed') {
        appointment.time = time;
      }
    } else if (req.user.role === 'doctor') {
      // Doctors can confirm / complete their appointments
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this appointment');
      }
      if (status) appointment.status = status;
      if (meetingLink) appointment.meetingLink = meetingLink;
    } else if (req.user.role === 'admin') {
      if (status) appointment.status = status;
      if (date) appointment.date = date;
      if (time) appointment.time = time;
      if (meetingLink) appointment.meetingLink = meetingLink;
    } else {
      res.status(403);
      throw new Error('Not authorized');
    }

    const updated = await appointment.save();

    const populated = await Appointment.findById(updated._id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      })
      .populate('patientId', 'name email profilePicture phone');

    res.json(populated);
  } catch (error) { next(error); }
};

// GET /api/appointments/doctor/mine — Get logged-in doctor's appointments
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }

    const { status, page = 1, limit = 20 } = req.query;
    let query = { doctorId: doctor._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email profilePicture phone gender')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({ appointments, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) { next(error); }
};

// GET /api/appointments/admin/all — Admin only — all appointments paginated
export const getAllAppointmentsAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Admin access required');
    }

    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (status) query.status = status;

    if (search) {
      // Search by reasonForVisit or other text fields
      query.reasonForVisit = { $regex: search, $options: 'i' };
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      })
      .populate('patientId', 'name email profilePicture phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) { next(error); }
};
