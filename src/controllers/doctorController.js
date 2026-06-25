import Doctor from '../models/Doctor.js';

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isVerified: true }).populate('userId', 'name email profilePicture');
    res.json(doctors);
  } catch (error) { next(error); }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email profilePicture');
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404);
      throw new Error('Doctor not found');
    }
  } catch (error) { next(error); }
};
