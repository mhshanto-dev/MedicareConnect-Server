import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';

// GET /api/admin/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      pendingDoctors,
      todayAppointments,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Doctor.countDocuments({ isVerified: false }),
      Appointment.countDocuments({ date: { $gte: startOfToday, $lt: endOfToday } }),
      Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Monthly appointments — last 6 months
    const monthlyAppointments = [];
    const revenueChart = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);

      const count = await Appointment.countDocuments({ createdAt: { $gte: start, $lt: end } });
      const rev = await Payment.aggregate([
        { $match: { status: 'succeeded', createdAt: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const monthLabel = start.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyAppointments.push({ month: monthLabel, count });
      revenueChart.push({ month: monthLabel, revenue: rev.length > 0 ? rev[0].total : 0 });
    }

    res.json({
      totalUsers,
      totalDoctors,
      totalAppointments,
      totalRevenue,
      pendingDoctors,
      todayAppointments,
      monthlyAppointments,
      revenueChart,
    });
  } catch (error) { next(error); }
};

// GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) { next(error); }
};

// GET /api/admin/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json(user);
  } catch (error) { next(error); }
};

// PATCH /api/admin/users/:id/status — Toggle active/inactive
export const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { status } = req.body;

    if (status && ['active', 'inactive'].includes(status)) {
      user.status = status;
    } else {
      // Toggle if no status provided
      user.status = user.status === 'active' ? 'inactive' : 'active';
    }

    await user.save();
    res.json(user);
  } catch (error) { next(error); }
};

// GET /api/admin/doctors
export const getAllDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, verified } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (verified === 'true') query.isVerified = true;
    if (verified === 'false') query.isVerified = false;

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email profilePicture status phone gender')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Doctor.countDocuments(query);

    res.json({
      doctors,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) { next(error); }
};

// PATCH /api/admin/doctors/:id/verify
export const verifyDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    doctor.isVerified = true;
    await doctor.save();

    const populated = await Doctor.findById(doctor._id)
      .populate('userId', 'name email profilePicture');

    res.json({ message: 'Doctor verified successfully', doctor: populated });
  } catch (error) { next(error); }
};

// PATCH /api/admin/doctors/:id/reject
export const rejectDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    doctor.isVerified = false;
    await doctor.save();

    const populated = await Doctor.findById(doctor._id)
      .populate('userId', 'name email profilePicture');

    res.json({ message: 'Doctor rejected successfully', doctor: populated });
  } catch (error) { next(error); }
};

// GET /api/admin/appointments — All appointments paginated
export const getAllAppointmentsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (status) query.status = status;
    if (search) {
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

// GET /api/admin/payments — All payments paginated
export const getAdminPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('patientId', 'name email profilePicture')
      .populate({
        path: 'appointmentId',
        populate: {
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' },
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) { next(error); }
};
