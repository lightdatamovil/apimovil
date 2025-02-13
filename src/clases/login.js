const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const crypto = require('crypto');

class Login {
  constructor(Aempresas) {
     this.Aempresas = Aempresas;
  }

  generateToken(userId, idEmpresa, perfil) {
	const payload = {
	  userId: userId,
	  perfil: perfil,
	  idEmpresa: idEmpresa
	};
	
	const options = {
      expiresIn: '2558h'  // Configura el tiempo de expiración en 8 horas
    };

    return jwt.sign(payload, 'ruteate', options);
  }

  async loginUser(username, password, idEmpresa) {
      
     const empresa = this.Aempresas[idEmpresa];

     let dbConfig = {
          host: "bhsmysql1.lightdata.com.ar",
          user: empresa.dbuser,
          password: empresa.dbpass,
          database: empresa.dbname
     };
      
    const dbConnection = mysql.createConnection(dbConfig);

    try {
       await dbConnection.connect();
      
       var lat_dep = 0;
       var long_dep = 0;
       var adir = "";
      
       const querydeposito = "SELECT latitud,longitud FROM `depositos` where superado=0 and elim=0 and propio=1 and did = 1";
       const resultsdeposito = await this.executeQuery(dbConnection, querydeposito, []);
       if (resultsdeposito.length > 0) {
            const lineadeposito = resultsdeposito[0];
            lat_dep = lineadeposito.latitud;
            long_dep = lineadeposito.longitud;
       }

      const query = `SELECT u.did, u.bloqueado, u.nombre, u.apellido, u.email, u.telefono, u.pass, u.elim, u.usuario, u.token_fcm , a.perfil, u.direccion FROM sistema_usuarios as u JOIN sistema_usuarios_accesos as a on ( a.elim=0 and a.superado=0 and a.usuario = u.did) WHERE u.usuario = ? AND u.elim=0 and u.superado=0 `;
      const results = await this.executeQuery(dbConnection, query, [username]);
	  
      if (results.length === 0) {
        return { estadoRespuesta: false, body:{}, mensaje: 'Credenciales inválidas V1' };
      }
      
      console.log("RESULTS",results[0]);

      const usuario = results[0];
	  
	  if (usuario.elim === 1) {
        return { estadoRespuesta: false,body:{}, mensaje: 'Usuario eliminado' };
      }


      if (usuario.bloqueado === 1) {
        return { estadoRespuesta: false,body:{}, mensaje: 'Usuario bloqueado' };
      }
	  
	  const hashPassword = crypto.createHash('sha256').update(password).digest('hex');

      if (usuario.pass !== hashPassword) {
        return { estadoRespuesta: false,body:{}, mensaje: 'Credenciales inválidas V2'  };
      }

      const perfil = usuario.perfil;
      const token = this.generateToken(usuario.did, idEmpresa, perfil);
      
      var lat_casa = 0;
      var long_casa = 0;
      
     // console.log("direccion",usuario.direccion);
      
      if(usuario.direccion != ""){
          adir = JSON.parse(usuario.direccion);
           console.log(adir);
          lat_casa = adir.lat;
          long_casa = adir.lng;
      }
	  var menu_info_envio = true;
	  
	  if(idEmpresa != 200 ){
	      menu_info_envio = false;
	  }

     var ubicaciones = [];
     ubicaciones.push({"id":2,"name":"Casa","lat":lat_casa,"long":long_casa}); //-34.598043, -58.492330
     ubicaciones.push({"id":3,"name":"Deposito","lat":lat_dep,"long":long_dep});
     
     var imagen = "";

      return { estadoRespuesta: true,  body:{"token": token, "id": usuario.did , "fotoPerfil": imagen,  "username":usuario.usuario, "email": usuario.email ,"tokenFCM": usuario.token_fcm ,"perfil": perfil, "ubicaciones":ubicaciones, "menu_info_envio":menu_info_envio, "telefono":usuario.telefono}, mensaje: 'OK'};
    } catch (error) {
		console.log(error);
		return { estadoRespuesta: false, body:{}, respuesta: 'Error en la consulta Log'   };
    } finally {
		dbConnection.end();
    }
  }

  async executeQuery(connection, query, values) {
    return new Promise((resolve, reject) => {
      connection.query(query, values, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

}

module.exports = Login;
