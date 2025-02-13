const mysql = require('mysql');
const cuentas = require('express').Router();
const verifyToken = require('../src/funciones/verifyToken');
const { buscarEmpresaById } = require('../db');

cuentas.post('/listarCuentas', verifyToken, async (req, res) => {
	try {

		const { idEmpresa, perfil, diduser } = req.body;
		const empresa = buscarEmpresaById(idEmpresa);

		if (!empresa) {
			return res.status(400).json({ estadoRespuesta: false, body: "", mensaje: 'Empresa no encontrada' });
		}

		var sqlduenio = "";

		if (perfil == 2) {
			sqlduenio = " AND e.didCliente = " + diduser;
		} else if (perfil == 3) {
			return res.status(400).json({ estadoRespuesta: false, body: "", mensaje: 'Perfil no es de cliente' });
		}

		let dbConfig = {
			host: "149.56.182.49",
			user: "ue" + empresa.id,
			password: "78451296",
			database: "e" + empresa.id,
			port: 44339
		};

		const dbConnection = mysql.createConnection(dbConfig);
		dbConnection.connect();
		var Atemp = [];
		const query = "SELECT id,did,tipoCuenta,dataCuenta,ML_user,ML_id_vendedor, tn_id,tn_url,woo_api,woo_secreto,woo_web,shop_url,shop_api,shop_api2,clientes_cuentas.data,pre_url,pre_api,vtex_url,vtex_key,vtex_token,ingreso_automatico,fala_key,fala_userid,jumpseller_login,jumpseller_token,fulfillment,me1,sync_woo,flexdata FROM `clientes_cuentas` Where superado=0 and elim=0 and didCliente = " + sqlduenio;
		const results = await executeQuery(dbConnection, query, []);

		for (i = 0; i < results.length; i++) {

			nombrecuenta = "";
			if (row.tipoCuenta == 1) {
				nombrecuenta = row.ML_id_vendedor;
			} else if (row.tipoCuenta == 2) {
				nombrecuenta = row.tn_url;
			} else if (row.tipoCuenta == 3) {
				nombrecuenta = row.shop_url;
			} else if (row.tipoCuenta == 4) {
				nombrecuenta = row.woo_web;
			} else if (row.tipoCuenta == 5) {
				nombrecuenta = row.vtex_url;
			}

			var row = results[i];
			var objetoJSON = {
				"id": row.id,
				"did": row.did,
				"flex": row.tipoCuenta,
				"dataCuenta": row.dataCuenta,
				"ML_user": row.ML_user,
				"ML_id_vendedor": row.ML_id_vendedor,
				"tn_id": row.tn_id,
				"tn_url": row.tn_url,
				"woo_api": row.woo_api,
				"woo_secreto": row.woo_secreto,
				"woo_web": row.woo_web,
				"shop_url": row.shop_url,
				"shop_api": row.shop_api,
				"shop_api2": row.shop_api2,
				"pre_api": row.pre_api,
				"pre_url": row.pre_url,
				"vtex_url": row.vtex_url,
				"vtex_key": row.vtex_key,
				"vtex_token": row.vtex_token,
				"ingreso_automatico": row.ingreso_automatico,
				"fala_key": row.fala_key,
				"fala_userid": row.fala_userid,
				"jumpseller_login": row.jumpseller_login,
				"jumpseller_token": row.jumpseller_token,
				"fulfillment": row.fulfillment,
				"me1": row.me1,
				"sync_woo": row.sync_woo,
				"flexdata": row.flexdata,
				"nombrecuenta": nombrecuenta
			};

			Atemp.push(objetoJSON);
		}

		dbConnection.end();
		res.status(200).json({ estadoRespuesta: true, body: Atemp, mensaje: "" });
	} catch (error) {
		console.error('Error al listar cuentas:', error);
		res.status(500).json({ estadoRespuesta: false, body: "", mensaje: 'Error interno del servidor' });
	}

});

module.exports = cuentas;