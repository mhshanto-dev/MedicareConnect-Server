import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';

export const getDoctors = async (req, res, next) => {
  try {
    const { search, sort, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (search) {
      // Find matching users first for the doctor name search
      const matchingUsers = await User.find({ 
        name: { $regex: search, $options: 'i' },
        role: 'doctor' 
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      query = {
        $or: [
          { specialty: { $regex: search, $options: 'i' } },
          { userId: { $in: userIds } }
        ]
      };
    }

    let sortObj = {};
    if (sort === 'asc') sortObj.consultationFee = 1;
    if (sort === 'desc') sortObj.consultationFee = -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    res.json(doctors);
  } catch (error) { next(error); }
};
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

export const getMyDoctorProfile = async (req, res, next) => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name email profilePicture phone gender');
    if (!doctor) {
      doctor = await Doctor.create({
        userId: req.user._id,
        specialty: 'General',
        experience: 1,
        qualifications: [],
        bio: '',
        consultationFee: 0,
        availability: [],
      });
      doctor = await doctor.populate('userId', 'name email profilePicture phone gender');
    }
    res.json(doctor);
  } catch (error) { next(error); }
};

export const updateMyDoctorProfile = async (req, res, next) => {
  try {
    const { specialty, experience, qualifications, bio, consultationFee, availability } = req.body;
    let doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      doctor = new Doctor({ userId: req.user._id });
    }
    if (specialty !== undefined) doctor.specialty = specialty;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (qualifications !== undefined) doctor.qualifications = qualifications;
    if (bio !== undefined) doctor.bio = bio;
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (availability !== undefined) doctor.availability = availability;

    await doctor.save();
    const populated = await Doctor.findById(doctor._id).populate('userId', 'name email profilePicture phone gender');
    res.json(populated);
  } catch (error) { next(error); }
};

export const getDoctorStats = async (req, res, next) => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user._id });

    // Auto-create a stub profile if none exists (e.g. newly registered doctors)
    if (!doctor) {
      doctor = await Doctor.create({
        userId: req.user._id,
        specialty: 'General Practice',
        experience: 0,
        qualifications: [],
        bio: '',
        consultationFee: 0,
        availability: [],
        isVerified: false,
      });
    }

    const doctorId = doctor._id;

    // Total appointments, completed appointments
    const [totalAppointments, completedAppointments, totalReviews] = await Promise.all([
      Appointment.countDocuments({ doctorId }),
      Appointment.countDocuments({ doctorId, status: 'completed' }),
      Review.countDocuments({ doctorId }),
    ]);

    // Unique Patients
    const uniquePatients = await Appointment.distinct('patientId', { doctorId });
    const totalPatients = uniquePatients.length;

    // Total Earnings (sum of successfully completed payments for this doctor's appointments)
    const appts = await Appointment.find({ doctorId, status: { $in: ['confirmed', 'completed'] } }).select('_id');
    const apptIds = appts.map(a => a._id);
    const revenueAgg = await Payment.aggregate([
      { $match: { appointmentId: { $in: apptIds }, status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalEarnings = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Average rating
    const ratingAgg = await Review.aggregate([
      { $match: { doctorId } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const averageRating = ratingAgg.length > 0 ? parseFloat(ratingAgg[0].avg.toFixed(1)) : 5.0;

    // Monthly stats for last 6 months
    const monthlyAppointments = [];
    const revenueChart = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);

      const count = await Appointment.countDocuments({ doctorId, createdAt: { $gte: start, $lt: end } });
      const rev = await Payment.aggregate([
        { $match: { appointmentId: { $in: apptIds }, status: 'succeeded', createdAt: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const monthLabel = start.toLocaleString('default', { month: 'short' });
      monthlyAppointments.push({ month: monthLabel, count });
      revenueChart.push({ month: monthLabel, revenue: rev.length > 0 ? rev[0].total : 0 });
    }

    res.json({
      totalPatients,
      totalAppointments,
      completedAppointments,
      totalEarnings,
      averageRating,
      totalReviews,
      monthlyAppointments,
      revenueChart,
    });
  } catch (error) { next(error); }
};