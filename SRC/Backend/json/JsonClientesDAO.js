// SRC/Backend/json/JsonClientesDAO.js
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
// Archivo donde guardamos los clientes
// Limpia espacios extras y deja solo un espacio entre palabras
const stripAndCollapse = (s) => String(s || '').trim().replace(/\s+/g, ' ');

// Convierte emails a minúsculas y quita espacios
const normalizeEmail = (e) => String(e || '').toLowerCase().trim();

// Detecta si un texto tiene emojis (no los permitimos en nombres)
const hasEmoji = (s) => /\p{Extended_Pictographic}/u.test(String(s || ''));

// Toma solo los campos que nos interesan de un objeto
function pickAllowedFields(obj, allowed) {
  return allowed.reduce((acc, k) => {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) {
      acc[k] = obj[k];
    }
    return acc;
  }, {});
}

// Limpia y normaliza direcciones
function normalizeDireccion(val) {
  if (val == null) return null;
  let s = String(val).normalize('NFC').trim();
  s = s.replace(/\s+/g, ' '); // quita espacios de más
  return s === '' ? null : s;
}

// Verifica que un nombre sea válido
function isValidNombre(nombre) {
  if (!nombre) return false;
  if (hasEmoji(nombre)) return false; // no emojis en nombres
  if (nombre.length < 2 || nombre.length > 60) return false; // largo razonable
  
  // Solo letras (con tildes y ñ), espacios, guiones y apóstrofes
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(nombre);
}

// Verifica que un email tenga formato correcto
function isValidEmail(email) {
  if (!email) return false;
  if (email.length > 100) return false; // no demasiado largo
  if (/\s/.test(email)) return false; // no espacios
  if (email.includes('..')) return false; // no dos puntos seguidos

  const parts = email.split('@');
  if (parts.length !== 2) return false; // debe tener una @

  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (local.length > 64) return false;
  if (domain.length > 255) return false;

  // El dominio debe tener al menos un punto y terminación válida
  if (!/^[^\s@]+\.[^\s@]{2,24}$/.test(domain)) return false;

  // Chequeo general de formato de email
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Verifica que la contraseña sea segura
function isValidPassword(pw) {
  const s = String(pw || '');
  if (s.length < 8 || s.length > 64) return false; // largo adecuado
  if (/\s/.test(s)) return false; // no espacios
  
  // Contamos los tipos de caracteres que tiene
  let tiposDeCaracteres = 0;
  if (/[a-z]/.test(s)) tiposDeCaracteres++; // minúsculas
  if (/[A-Z]/.test(s)) tiposDeCaracteres++; // mayúsculas  
  if (/\d/.test(s)) tiposDeCaracteres++; // números
  if (/[^A-Za-z0-9]/.test(s)) tiposDeCaracteres++; // símbolos
  
  return tiposDeCaracteres >= 2; // al menos 2 tipos diferentes
}

// ============================== Clase principal ==============================
class JsonClientesDAO {
  constructor() {
    // Donde guardamos el archivo de clientes
    this.filePath = path.join(__dirname, '..', 'data', 'clientes.json');
    this.init();
  }

  // Prepara el archivo cuando arranca la aplicación
  async init() {
    try {
      // Asegura que la carpeta data exista
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      
      // Si el archivo no existe, lo crea vacío
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        console.log('📁 Archivo de clientes creado:', this.filePath);
      }
    } catch (error) {
      console.error('❌ Error preparando el archivo de clientes:', error);
    }
  }

  // Lee todos los clientes directamente del archivo
  async _readAllRaw() {
    const data = await fs.readFile(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  // Guarda todos los clientes en el archivo
  async _writeAllRaw(arr) {
    await fs.writeFile(this.filePath, JSON.stringify(arr, null, 2));
  }

  // Obtiene la lista de clientes (sin mostrar contraseñas)
  async getAll() {
    const raw = await this._readAllRaw();
    // Quitamos la información sensible antes de devolver
    return raw.map(({ passwordHash, password, ...rest }) => rest);
  }

  // Busca un cliente por email (para login)
  async getByEmail(email) {
    const raw = await this._readAllRaw();
    const emailBuscado = String(email || '').toLowerCase().trim();
    const usuario = raw.find(c => String(c.email || '').toLowerCase() === emailBuscado);
    
    if (!usuario) return null;
    
    // Verificamos que tenga contraseña guardada correctamente
    if (!usuario.passwordHash) {
      throw new Error(`El usuario ${usuario.email} no tiene contraseña guardada. Debe registrarse de nuevo.`);
    }
    
    return usuario; // Incluye el hash para poder verificar la contraseña
  }

  // Busca un cliente por ID
  async getById(id) {
    const clientes = await this._readAllRaw();
    return clientes.find(c => c.id === id) || null;
  }

  // ============================== Crear nuevo cliente ==============================
  async save(cliente) {
    try {
      //Tomamos solo los campos que nos interesan
      const input = pickAllowedFields(cliente, ['nombre', 'email', 'telefono', 'password', 'direccion']);

      // Limpiamos los datos
      const nombre = stripAndCollapse(input.nombre);
      const email = normalizeEmail(input.email);

      // Verificamos que tenga los datos obligatorios
      if (!nombre) {
        const err = new Error('El nombre es requerido');
        err.code = 'NAME_REQUIRED';
        throw err;
      }
      if (!email) {
        const err = new Error('El email es requerido');
        err.code = 'EMAIL_REQUIRED';
        throw err;
      }
      if (!input.password) {
        const err = new Error('La contraseña es requerida');
        err.code = 'PASSWORD_REQUIRED';
        throw err;
      }

      // Teléfono es obligatorio
      const telefonoRaw = String(input.telefono ?? '').trim();
      if (!telefonoRaw) {
        const err = new Error('El teléfono es requerido');
        err.code = 'PHONE_REQUIRED';
        throw err;
      }

      // Validamos que los datos tengan formato correcto
      if (!isValidNombre(nombre)) {
        const err = new Error('El nombre solo puede contener letras (con tildes y ñ), espacios, guiones o apóstrofes. Entre 2 y 60 caracteres.');
        err.code = 'NAME_INVALID';
        throw err;
      }
      if (!isValidEmail(email)) {
        const err = new Error('El email no tiene un formato válido');
        err.code = 'EMAIL_INVALID';
        throw err;
      }
      if (!isValidPassword(input.password)) {
        const err = new Error('La contraseña debe tener al menos 8 caracteres, sin espacios, y combinar mayúsculas, minúsculas, números o símbolos (al menos 2 de estos tipos).');
        err.code = 'PASSWORD_WEAK';
        throw err;
      }

      // Validamos el teléfono: solo números y exactamente 8 dígitos
      if (!/^\d+$/.test(telefonoRaw)) {
        const err = new Error('El teléfono solo puede contener números.');
        err.code = 'PHONE_INVALID_CHARS';
        throw err;
      }
      if (telefonoRaw.length !== 8) {
        const err = new Error('El teléfono debe tener exactamente 8 dígitos.');
        err.code = 'PHONE_INVALID_LENGTH';
        throw err;
      }
      const telefono = telefonoRaw;

      // La dirección es opcional, pero si viene la validamos
      let direccion = null;
      if (input.direccion != null) {
        const d = normalizeDireccion(input.direccion);
        if (d !== null) {
          if (d.length > 120) {
            const err = new Error('La dirección no puede superar 120 caracteres.');
            err.code = 'ADDRESS_TOO_LONG';
            throw err;
          }
          // Solo caracteres permitidos en direcciones
          if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s,.\-#°º/()]+$/.test(d)) {
            const err = new Error('La dirección contiene caracteres no permitidos.');
            err.code = 'ADDRESS_INVALID_CHARS';
            throw err;
          }
          direccion = d;
        }
      }

      //  Leemos los clientes que ya existen
      const raw = await this._readAllRaw();

      //  Verificamos que el email no esté ya registrado
      const emailExistente = raw.find(c => String(c.email || '').toLowerCase().trim() === email);
      if (emailExistente) {
        const err = new Error('Este email ya está registrado');
        err.code = 'EMAIL_DUP';
        throw err;
      }

      //  Creamos el nuevo cliente
      const nuevoCliente = {
        id: Date.now().toString(), // ID único basado en el tiempo
        createdAt: new Date().toISOString(), // fecha de creación
        nombre,
        email,
        telefono: `+569${telefono}`, // formato chileno
        direccion,
        passwordHash: bcrypt.hashSync(input.password, 10), // contraseña encriptada
        role: 'user', // rol por defecto
        activo: true, // cliente activo
      };

      // Guardamos el nuevo cliente en la lista
      raw.push(nuevoCliente);
      await this._writeAllRaw(raw);

      //  Devolvemos el cliente sin información sensible
      const { passwordHash, password, ...clientePublico } = nuevoCliente;
      return clientePublico;

    } catch (error) {
      console.error('❌ Error guardando cliente:', error);
      throw error;
    }
  }

  // ============================== Actualizar cliente existente ==============================
  async update(id, updatedCliente) {
    const clientes = await this._readAllRaw();
    const indice = clientes.findIndex(c => c.id === id);
    if (indice === -1) return null; // no encontrado

    const clienteActual = clientes[indice];

    // Tomamos solo los campos que se pueden actualizar
    const cambios = pickAllowedFields(updatedCliente, [
      'nombre', 'email', 'telefono', 'password', 'activo', 'direccion'
    ]);

    const cambiosAplicados = {};

    // --- Actualizar nombre ---
    if (cambios.nombre !== undefined) {
      const nombre = stripAndCollapse(cambios.nombre);
      if (!isValidNombre(nombre)) {
        const err = new Error('Nombre inválido');
        err.code = 'NAME_INVALID';
        throw err;
      }
      cambiosAplicados.nombre = nombre;
    }

    // --- Actualizar email ---
    if (cambios.email !== undefined) {
      const email = normalizeEmail(cambios.email);
      if (!isValidEmail(email)) {
        const err = new Error('Email inválido');
        err.code = 'EMAIL_INVALID';
        throw err;
      }
      // Verificamos que el nuevo email no lo tenga otro cliente
      const emailDuplicado = clientes.find((c, i) => i !== indice && String(c.email || '').toLowerCase().trim() === email);
      if (emailDuplicado) {
        const err = new Error('Este email ya está registrado por otro usuario');
        err.code = 'EMAIL_DUP';
        throw err;
      }
      cambiosAplicados.email = email;
    }

    // --- Actualizar teléfono ---
    if (cambios.telefono !== undefined) {
      const telefono = String(cambios.telefono).trim();

      if (telefono === '') {
        const err = new Error('El teléfono es requerido');
        err.code = 'PHONE_REQUIRED';
        throw err;
      }
      if (!/^\d+$/.test(telefono)) {
        const err = new Error('El teléfono solo puede contener números.');
        err.code = 'PHONE_INVALID_CHARS';
        throw err;
      }
      if (telefono.length !== 8) {
        const err = new Error('El teléfono debe tener exactamente 8 dígitos.');
        err.code = 'PHONE_INVALID_LENGTH';
        throw err;
      }

      cambiosAplicados.telefono = `+569${telefono}`;
    }

    // --- Actualizar dirección ---
    if (cambios.direccion !== undefined) {
      const direccionRaw = String(cambios.direccion ?? '').trim();
      if (direccionRaw === '') {
        cambiosAplicados.direccion = null; // eliminar dirección
      } else {
        const direccion = normalizeDireccion(direccionRaw);
        if (direccion.length > 120) {
          const err = new Error('La dirección no puede superar 120 caracteres.');
          err.code = 'ADDRESS_TOO_LONG';
          throw err;
        }
        if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s,.\-#°º/()]+$/.test(direccion)) {
          const err = new Error('La dirección contiene caracteres no permitidos.');
          err.code = 'ADDRESS_INVALID_CHARS';
          throw err;
        }
        cambiosAplicados.direccion = direccion;
      }
    }

    // --- Actualizar contraseña ---
    if (cambios.password !== undefined) {
      const nuevaPassword = String(cambios.password || '');
      if (!isValidPassword(nuevaPassword)) {
        const err = new Error('La contraseña no es suficientemente segura');
        err.code = 'PASSWORD_WEAK';
        throw err;
      }
      cambiosAplicados.passwordHash = await bcrypt.hash(nuevaPassword, 10);
    }

    // --- Activar/desactivar cliente ---
    if (cambios.activo !== undefined) {
      cambiosAplicados.activo = Boolean(cambios.activo);
    }

    // Campos que NO se pueden cambiar
    delete cambiosAplicados.role;
    delete cambiosAplicados.id;
    delete cambiosAplicados.createdAt;

    // Nos aseguramos de que el teléfono siga existiendo
    const telefonoFinal = (cambiosAplicados.telefono !== undefined) ? cambiosAplicados.telefono : clienteActual.telefono;
    if (!telefonoFinal) {
      const err = new Error('El teléfono es requerido');
      err.code = 'PHONE_REQUIRED';
      throw err;
    }

    // Combinamos los cambios con los datos actuales
    const clienteActualizado = {
      ...clienteActual,
      ...cambiosAplicados,
      updatedAt: new Date().toISOString(), // marcamos la fecha de actualización
    };

    // Guardamos los cambios
    clientes[indice] = clienteActualizado;
    await this._writeAllRaw(clientes);

    // Devolvemos el cliente actualizado sin información sensible
    const { passwordHash, password, ...clientePublico } = clienteActualizado;
    return clientePublico;
  }

  // ============================== Eliminar cliente ==============================
  async delete(id) {
    const clientes = await this._readAllRaw();
    const clientesFiltrados = clientes.filter(c => c.id !== id);
    
    // Si no cambió la cantidad, es porque no se eliminó nada
    if (clientes.length === clientesFiltrados.length) return false;

    await this._writeAllRaw(clientesFiltrados);
    console.log('✅ Cliente eliminado:', id);
    return true;
  }
}
module.exports = JsonClientesDAO;