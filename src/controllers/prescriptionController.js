import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';

// GET /api/prescriptions
// Patient: returns their own prescriptions. Doctor: returns prescriptions they wrote.
export const getPrescriptions = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      query.doctorId = doctor._id;
    } else if (req.user.role === 'admin') {
      // Admin can see all
      query = {};
    }

    const prescriptions = await Prescription.find(query)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      })
      .populate('patientId', 'name email profilePicture')
      .populate('appointmentId', 'date time status reasonForVisit')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) { next(error); }
};

// POST /api/prescriptions — Doctor only
export const createPrescription = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      res.status(403);
      throw new Error('Only doctors can create prescriptions');
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }

    const { patientId, appointmentId, diagnosis, medications, notes } = req.body;

    if (!patientId || !appointmentId || !diagnosis || !medications) {
      res.status(400);
      throw new Error('patientId, appointmentId, diagnosis, and medications are required');
    }

    const prescription = await Prescription.create({
      doctorId: doctor._id,
      patientId,
      appointmentId,
      diagnosis,
      medications,
      notes,
    });

    const populated = await Prescription.findById(prescription._id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      })
      .populate('patientId', 'name email profilePicture')
      .populate('appointmentId', 'date time status reasonForVisit');

    res.status(201).json(populated);
  } catch (error) { next(error); }
};

// GET /api/prescriptions/:id
export const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email profilePicture' },
      })
      .populate('patientId', 'name email profilePicture')
      .populate('appointmentId', 'date time status reasonForVisit');

    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }

    // Access control: patient can only see their own; doctor can see theirs
    if (req.user.role === 'patient') {
      if (prescription.patientId._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this prescription');
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || prescription.doctorId._id.toString() !== doctor._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this prescription');
      }
    }

    res.json(prescription);
  } catch (error) { next(error); }
};
