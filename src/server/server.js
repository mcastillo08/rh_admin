// server.js - Archivo principal del servidor usando sintaxis ESM

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import crypto from 'crypto';

// Configuración para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '../..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rh_admin'
};

// Crear pool de conexiones MySQL
const pool = mysql.createPool(dbConfig);

// Ruta para autenticar usuarios
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const connection = await pool.getConnection();

    // Consultar el usuario por email
    const [users] = await connection.query(`
      SELECT id, name, last_name, email, password, agency 
      FROM Users 
      WHERE email = ?
    `, [email]);

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = users[0];

    // Verificar la contraseña - usando MD5 como en tu script SQL
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    if (user.password !== hashedPassword) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Crear un objeto de usuario sin la contraseña
    const userResponse = {
      id: user.id,
      name: user.name,
      last_name: user.last_name,
      email: user.email,
      agency: user.agency
    };

    // En un sistema real, aquí generarías un JWT
    // Por ahora usamos un token simple
    const token = crypto.randomBytes(64).toString('hex');

    res.json({
      success: true,
      user: userResponse,
      token: token
    });
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Ruta para obtener todos los empleados
app.get('/api/employees', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Consulta para obtener los empleados con la información del usuario asociado
    const [rows] = await connection.query(`
      SELECT 
        e.id, 
        e.name, 
        e.last_name, 
        e.agency, 
        DATE_FORMAT(e.date_of_birth, '%d/%m/%Y') as date_of_birth, 
        DATE_FORMAT(e.high_date, '%d/%m/%Y') as high_date, 
        e.status, 
        DATE_FORMAT(e.low_date, '%d/%m/%Y') as low_date, 
        e.photo, 
        e.id_user,
        u.email as user_email
      FROM Employees e
      JOIN Users u ON e.id_user = u.id
    `);

    connection.release();

    // Convertir fechas a formato adecuado y manejar valores nulos
    const formattedEmployees = rows.map(employee => ({
      ...employee,
      low_date: employee.low_date || null
    }));

    res.json(formattedEmployees);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ message: 'Error al obtener datos de empleados', error: error.message });
  }
});

// Ruta para obtener un empleado por ID
app.get('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [rows] = await connection.query(`
      SELECT 
        e.id, 
        e.name, 
        e.last_name, 
        e.agency, 
        DATE_FORMAT(e.date_of_birth, '%d/%m/%Y') as date_of_birth, 
        DATE_FORMAT(e.high_date, '%d/%m/%Y') as high_date, 
        e.status, 
        DATE_FORMAT(e.low_date, '%d/%m/%Y') as low_date, 
        e.photo, 
        e.id_user,
        u.email as user_email
      FROM Employees e
      JOIN Users u ON e.id_user = u.id
      WHERE e.id = ?
    `, [id]);

    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.json({
      ...rows[0],
      low_date: rows[0].low_date || null
    });
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ message: 'Error al obtener datos del empleado', error: error.message });
  }
});

// Ruta para crear un nuevo usuario/administrador
app.post('/api/users', async (req, res) => {
  try {
    const { name, last_name, email, password, agency } = req.body;

    if (!name || !last_name || !email || !password || !agency) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const connection = await pool.getConnection();

    // Verificar si el email ya existe
    const [existingUsers] = await connection.query('SELECT id FROM Users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Ya existe un usuario con este correo electrónico' });
    }

    // Hash de la contraseña
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    // Insertar el nuevo usuario
    const [result] = await connection.query(`
      INSERT INTO Users (name, last_name, email, password, agency) 
      VALUES (?, ?, ?, ?, ?)
    `, [name, last_name, email, hashedPassword, agency]);

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Ruta para obtener todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Modificado para manejar el caso donde la columna admin no existe
    const [users] = await connection.query(`
      SELECT id, name, last_name, email, agency, 
      'No' as admin 
      FROM Users 
      ORDER BY id DESC
    `);

    connection.release();

    // No incluir las contraseñas en la respuesta por seguridad
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener datos de usuarios', error: error.message });
  }
});

// Ruta para obtener un usuario por ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [users] = await connection.query(`
      SELECT id, name, last_name, email, agency, admin
      FROM Users
      WHERE id = ?
    `, [id]);

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener datos del usuario', error: error.message });
  }
});



// Ruta para actualizar un usuario existente
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, last_name, email, password, agency } = req.body;
    // Eliminamos admin del destructuring ya que no existe la columna

    const connection = await pool.getConnection();

    // Verificar si el usuario existe
    const [existingUsers] = await connection.query('SELECT id FROM Users WHERE id = ?', [id]);

    if (existingUsers.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se proporciona una nueva contraseña, hash
    let query;
    let params;

    if (password && password.trim() !== '') {
      const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
      query = `
        UPDATE Users 
        SET name = ?, last_name = ?, email = ?, password = ?, agency = ?
        WHERE id = ?
      `;
      params = [name, last_name, email, hashedPassword, agency, id];
    } else {
      // Si no hay nueva contraseña, no cambiar la existente
      query = `
        UPDATE Users 
        SET name = ?, last_name = ?, email = ?, agency = ?
        WHERE id = ?
      `;
      params = [name, last_name, email, agency, id];
    }

    await connection.query(query, params);

    connection.release();

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Ruta para eliminar un usuario
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Verificar si el usuario existe
    const [existingUsers] = await connection.query('SELECT id FROM Users WHERE id = ?', [id]);

    if (existingUsers.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si hay empleados asociados a este usuario
    const [employees] = await connection.query('SELECT id FROM Employees WHERE id_user = ?', [id]);

    if (employees.length > 0) {
      connection.release();
      return res.status(400).json({
        message: 'No se puede eliminar este usuario porque tiene empleados asociados. Actualice o elimine esos empleados primero.'
      });
    }

    // Eliminar el usuario
    await connection.query('DELETE FROM Users WHERE id = ?', [id]);

    connection.release();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Ruta para crear un nuevo empleado
app.post('/api/employees', async (req, res) => {
  try {
    const { name, last_name, agency, date_of_birth, high_date, status, photo, id_user } = req.body;

    if (!name || !last_name || !agency || !date_of_birth || !high_date || !status || !id_user) {
      return res.status(400).json({ message: 'Todos los campos requeridos deben ser proporcionados' });
    }

    const connection = await pool.getConnection();

    // Verificar si el id_user existe
    const [existingUsers] = await connection.query('SELECT id FROM Users WHERE id = ?', [id_user]);

    if (existingUsers.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'El usuario asociado no existe' });
    }

    // Insertar el nuevo empleado
    const [result] = await connection.query(`
      INSERT INTO Employees (name, last_name, agency, date_of_birth, high_date, status, photo, id_user) 
      VALUES (?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d'), STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?)
    `, [name, last_name, agency, date_of_birth, high_date, status, photo, id_user]);

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Empleado creado exitosamente',
      employeeId: result.insertId
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});


// Agregar esta ruta al archivo src/server/server.js

// Ruta para actualizar un empleado existente
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, last_name, agency, date_of_birth, high_date, status, photo, id_user } = req.body;

    if (!name || !last_name || !agency || !date_of_birth || !high_date || !status || !id_user) {
      return res.status(400).json({ message: 'Todos los campos requeridos deben ser proporcionados' });
    }

    const connection = await pool.getConnection();

    // Verificar si el empleado existe
    const [existingEmployees] = await connection.query('SELECT id FROM Employees WHERE id = ?', [id]);

    if (existingEmployees.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Verificar si el id_user existe
    const [existingUsers] = await connection.query('SELECT id FROM Users WHERE id = ?', [id_user]);

    if (existingUsers.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'El usuario asociado no existe' });
    }

    // Actualizar el empleado
    await connection.query(`
      UPDATE Employees 
      SET name = ?, last_name = ?, agency = ?, 
      date_of_birth = STR_TO_DATE(?, '%Y-%m-%d'), 
      high_date = STR_TO_DATE(?, '%Y-%m-%d'), 
      status = ?, photo = ?, id_user = ?
      WHERE id = ?
    `, [name, last_name, agency, date_of_birth, high_date, status, photo, id_user, id]);

    connection.release();

    res.json({
      success: true,
      message: 'Empleado actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});