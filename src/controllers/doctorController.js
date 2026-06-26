import Doctor from '../models/Doctor.js';

import User from '../models/User.js';

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