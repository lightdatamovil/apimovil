import { Router } from 'express';
import verifyToken from '../src/funciones/verifyToken.js';
import { getCompanyById } from '../db.js';
import { shipmentDetails, shipmentList } from '../controller/shipmentsController/shipments.js';

const shipments = Router();

shipments.post('/shipment-list', async (req, res) => {
  const { companyId, userId, profile, from, deviceId, appVersion, brand, model, androidVersion, dashboardValue } = req.body;

  if (!companyId || !userId || !profile || !from || !deviceId || !appVersion || !brand || !model || !androidVersion) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const result = await shipmentList(companyId, userId, profile, from, dashboardValue);

    return res.status(200).json({ body: result, message: "Datos obtenidos correctamente" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

shipments.post("/shipment-details", verifyToken, async (req, res) => {


  const { companyId, profile, userId, shipmentId, deviceId, appVersion, brand, model, androidVersion } = req.body;

  if (!companyId || !profile || !userId || !shipmentId || !deviceId || !appVersion || !brand || !model || !androidVersion) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const company = await getCompanyById(companyId);

    const result = await shipmentDetails(company, shipmentId, userId);

    res.status(200).json({ body: result, message: "Datos obtenidos correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default shipments;