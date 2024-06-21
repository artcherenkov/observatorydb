const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const { faker } = require("@faker-js/faker");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "observatory",
});

connection.connect((err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err.stack);
    return;
  }
  console.log("Соединение с базой данных установлено");
});

app.get("/api/:table", (req, res) => {
  const table = req.params.table;
  const allowedTables = [
    "Sector",
    "Objects",
    "NaturalObjects",
    "Position",
    "Observation",
  ];

  if (!allowedTables.includes(table)) {
    res.status(400).send("Invalid table name");
    return;
  }

  connection.query(`SELECT * FROM ${table}`, (err, results) => {
    if (err) {
      res.status(500).send("Ошибка выполнения запроса");
      return;
    }
    res.json(results);
  });
});

app.post("/api/:table/random", async (req, res) => {
  const table = req.params.table;
  const allowedTables = [
    "Sector",
    "Objects",
    "NaturalObjects",
    "Position",
    "Observation",
  ];

  if (!allowedTables.includes(table)) {
    return res.status(400).send("Invalid table name");
  }

  try {
    let query = "";
    let values = [];

    switch (table) {
      case "Sector":
        const sector = generateRandomSector();
        query = `
          INSERT INTO Sector (coordinates, light_intensity, foreign_objects, star_objects_count, undefined_objects_count, defined_objects_count, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          sector.coordinates,
          sector.light_intensity,
          sector.foreign_objects,
          sector.star_objects_count,
          sector.undefined_objects_count,
          sector.defined_objects_count,
          sector.notes,
        ];
        break;
      case "Objects":
        const object = generateRandomObject();
        query = `
          INSERT INTO Objects (type, accuracy, count, time, date, notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        values = [
          object.type,
          object.accuracy,
          object.count,
          object.time,
          object.date,
          object.notes,
        ];
        break;
      case "NaturalObjects":
        const naturalObject = generateRandomNaturalObject();
        query = `
          INSERT INTO NaturalObjects (type, galaxy, accuracy, light_flux, associated_objects, notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        values = [
          naturalObject.type,
          naturalObject.galaxy,
          naturalObject.accuracy,
          naturalObject.light_flux,
          naturalObject.associated_objects,
          naturalObject.notes,
        ];
        break;
      case "Position":
        const position = generateRandomPosition();
        query = `
          INSERT INTO \`Position\` (earth_position, sun_position, moon_position)
          VALUES (?, ?, ?)
        `;
        values = [
          position.earth_position,
          position.sun_position,
          position.moon_position,
        ];
        break;
      case "Observation":
        const sectorId = await getRandomId("Sector");
        const objectId = await getRandomId("Objects");
        const naturalObjectId = await getRandomId("NaturalObjects");
        const positionId = await getRandomId("Position");
        query = `
          INSERT INTO Observation (sector_id, object_id, natural_object_id, position_id)
          VALUES (?, ?, ?, ?)
        `;
        values = [sectorId, objectId, naturalObjectId, positionId];
        break;
      default:
        return res.status(400).send("Invalid table name");
    }

    executeQuery(query, values, res);
  } catch (error) {
    console.error("Error generating random data:", error);
    res.status(500).send("Error generating random data");
  }
});

app.put("/api/Objects/:id", (req, res) => {
  const { id } = req.params;
  const { type, accuracy, count, time, date, notes } = req.body;

  const query = `
    UPDATE Objects
    SET type = ?, accuracy = ?, count = ?, time = ?, date = ?, notes = ?
    WHERE id = ?
  `;
  const values = [type, accuracy, count, time, date, notes, id];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating record:", err);
      res.status(500).send("Error updating record");
      return;
    }
    res.send("Record updated successfully");
  });
});

app.get("/api/join/:table1/:table2", (req, res) => {
  const { table1, table2 } = req.params;
  const allowedTables = [
    "Sector",
    "Objects",
    "NaturalObjects",
    "Position",
    "Observation",
  ];

  if (!allowedTables.includes(table1) || !allowedTables.includes(table2)) {
    res.status(400).send("Invalid table name");
    return;
  }

  const query = `CALL join_tables(?, ?)`;
  const values = [table1, table2];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error executing join query:", err);
      res.status(500).send("Error executing join query");
      return;
    }
    res.json(results[0]);
  });
});

function generateRandomSector() {
  return {
    coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
    light_intensity: faker.number.float({ min: 0, max: 100 }),
    foreign_objects: faker.word.words(),
    star_objects_count: faker.number.int({ min: 0, max: 100 }),
    undefined_objects_count: faker.number.int({ min: 0, max: 50 }),
    defined_objects_count: faker.number.int({ min: 0, max: 50 }),
    notes: faker.lorem.sentence(),
  };
}

function generateRandomObject() {
  return {
    type: faker.science.chemicalElement().name,
    accuracy: faker.number.float({ min: 0, max: 100 }),
    count: faker.number.int({ min: 1, max: 10 }),
    time: faker.date.past().toISOString().split("T")[1].slice(0, -1),
    date: faker.date.past().toISOString().split("T")[0],
    notes: faker.lorem.sentence(),
  };
}

function generateRandomNaturalObject() {
  return {
    type: faker.science.chemicalElement().name,
    galaxy: faker.word.words(),
    accuracy: faker.number.float({ min: 0, max: 100 }),
    light_flux: faker.number.float({ min: 0, max: 100 }),
    associated_objects: faker.word.words(),
    notes: faker.lorem.sentence(),
  };
}

function generateRandomPosition() {
  return {
    earth_position: `${faker.location.latitude()},${faker.location.longitude()}`,
    sun_position: `${faker.location.latitude()},${faker.location.longitude()}`,
    moon_position: `${faker.location.latitude()},${faker.location.longitude()}`,
  };
}

function executeQuery(query, values, res) {
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error executing query");
      return;
    }
    res.send("Record created successfully");
  });
}

async function getRandomId(table) {
  return new Promise((resolve, reject) => {
    const query = `SELECT id FROM ${table} ORDER BY RAND() LIMIT 1`;
    connection.query(query, (err, results) => {
      if (err || results.length === 0) {
        reject("Error fetching random id");
      } else {
        resolve(results[0].id);
      }
    });
  });
}

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
