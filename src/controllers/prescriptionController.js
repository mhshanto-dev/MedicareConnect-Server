import Prescription from '../models/Prescription.js';

export const getPrescriptions = async (req, res, next) => {
  try {
    res.json([]);
  } catch (error) { next(error); }
};
