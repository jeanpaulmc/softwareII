const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const port = 3003;

// Configuración de Sequelize
const sequelize = new Sequelize('microSer', 'postgres', '123456', {
  host: 'postgres', // Nombre del contenedor del servicio de base de datos
  dialect: 'postgres',
});

// Definición del modelo
const Fight = sequelize.define('microSer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  city: {
    type: DataTypes.STRING,
  },
  city_ascii: {
    type: DataTypes.STRING,
  },
  lat: {
    type: DataTypes.FLOAT,
  },
  lng: {
    type: DataTypes.FLOAT,
  },
  country: {
    type: DataTypes.STRING,
  },
  iso2: {
    type: DataTypes.STRING,
  },
  iso3: {
    type: DataTypes.STRING,
  },
  admin_name: {
    type: DataTypes.STRING,
  },
  capital: {
    type: DataTypes.STRING,
  },
  population: {
    type: DataTypes.INTEGER,
  },
  state_pokemon: {
    type: DataTypes.STRING,
  },
  health_pokemon: {
    type: DataTypes.INTEGER,
  },
});

app.use(express.json());

const RESULT_SERVICE_URL = 'http://localhost:20002/result'; // URL del servicio RESULT

// Función para enviar la información del Pokémon al microservicio RESULT
const sendToResultService = async (infocity) => {
  try {
    const response = await axios.post(RESULT_SERVICE_URL, infocity);
    console.log('Respuesta del microservicio RESULT:', response.data);
  } catch (error) {
    console.error('Error al enviar los datos al microservicio RESULT:', error.message);
  }
};

app.post('/load-csv', async (req, res) => {
  try {
    // Ruta al archivo CSV
    const csvFilePath = './data/worldcities.csv';

    // Leer el archivo CSV y cargar los datos en la base de datos
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (row) => {
        // Mapear los campos del CSV a los campos de la base de datos
        try {
          await Fight.create({
            city: row.city,
            city_ascii: row.city_ascii,
            lat: parseFloat(row.lat),
            lng: parseFloat(row.lng),
            country: row.country,
            iso2: row.iso2,
            iso3: row.iso3,
            admin_name: row.admin_name,
            capital: row.capital,
            population: parseInt(row.population),
            state_pokemon: "NORMAL",
            health_pokemon: 100, // Ajusta esto según tus necesidades
          });
        } catch (createError) {
          console.error('Error al crear un registro en la base de datos:', createError.message);
        }
      })
      .on('end', () => {
        console.log('Datos del CSV cargados en PostgreSQL');
        res.status(200).json('Datos del CSV cargados en PostgreSQL');
      });
  } catch (error) {
    console.error('Error al cargar datos desde el CSV:', error.message);
    res.status(500).json({ error: 'Error al cargar datos desde el CSV' });
  }
});

// Sincronización del modelo con la base de datos
sequelize.sync()
  .then(() => {
    console.log('Modelo "microSer" sincronizado con la base de datos');
    // Iniciar el servidor Express
    app.listen(port, () => {
      console.log(`Servidor Express en funcionamiento en el puerto ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar el modelo "microSer":', error.message);
  });
