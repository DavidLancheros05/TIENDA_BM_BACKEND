require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('tareas');

    const yaExiste = await db.collection('usuarios').findOne({ correo: "admin@example.com" });

    if (yaExiste) {
      console.log("⚠️ El usuario admin ya existe");
    } else {
      const hashed = await bcrypt.hash('admin123', 10);

      await db.collection('usuarios').insertOne({
        nombre: "Admin",
        correo: "admin@example.com",
        contraseña: hashed,
        rol: "admin"
      });

      console.log('✅ Usuario administrador insertado con contraseña hasheada');
    }
  } catch (error) {
    console.error('❌ Error insertando admin:', error);
  } finally {
    await client.close();
  }
}

run();
