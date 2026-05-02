const { FieldLog } = require('../models');

exports.logInspection = async (req, res) => {
  try {
    const { Worker_ID, Result, Note, GPS_Lat, GPS_Lon, Location_Text } = req.body;
    const Officer_ID = req.user.id;

    const log = await FieldLog.create({
      Worker_ID,
      Officer_ID,
      Result: Result || 'Verified',
      Note: Note || 'Field inspection completed via mobile app',
      Scan_Time: new Date(),
      Local_Timestamp: new Date(),
      GPS_Lat,
      GPS_Lon,
      Location_Text
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Log Inspection Error:', error);
    res.status(500).json({ message: 'Error logging inspection' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const logs = await FieldLog.findAll({
      include: [
        { model: require('../models').Worker, attributes: ['Full_Name', 'Passport_Number'] },
        { model: require('../models').User, attributes: ['Name'] }
      ],
      order: [['Scan_Time', 'DESC']]
    });
    res.json(logs);
  } catch (error) {
    console.error('Get All Logs Error:', error);
    res.status(500).json({ message: 'Error retrieving logs' });
  }
};

exports.getMyLogs = async (req, res) => {
  try {
    const Officer_ID = req.user.id;
    const logs = await FieldLog.findAll({
      where: { Officer_ID },
      include: [
        { model: require('../models').Worker, attributes: ['Full_Name', 'Passport_Number'] }
      ],
      order: [['Scan_Time', 'DESC']]
    });
    res.json(logs);
  } catch (error) {
    console.error('Get My Logs Error:', error);
    res.status(500).json({ message: 'Error retrieving logs' });
  }
};
