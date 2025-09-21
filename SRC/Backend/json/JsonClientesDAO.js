// SRC/Backend/json/JsonClientesDAO.js
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

// ==================== Helpers de validación/normalización ====================
const stripAndCollapse = (s) => String(s || '').trim().replace(/\s+/g, ' ');
const normalizeEmail   = (e) => String(e || '').toLowerCase().trim();
const hasEmoji         = (s) => /\p{Extended_Pictographic}/u.test(String(s || ''));

function pickAllowedFields(obj, allowed) {
  return allowed.reduce((acc, k) => {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) {
      acc[k] = obj[k];
    }
    return acc;
  }, {});
}

function isValidNombre(nombre) {
  if (!nombre) return false;
  if (hasEmoji(nombre)) return false;
  if (nombre.length < 2 || nombre.length > 60) return false;
  // Letras (incluye tildes/ñ), espacios, guion y apóstrofe
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(nombre);
}

function isValidEmail(email) {
  if (!email) return false;
  if (email.length > 100) return false;
  if (/\s/.test(email)) return false;
  if (email.includes('..')) return false;

  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (local.length > 64) return false;
  if (domain.length > 255) return false; // longitud total del dominio

  // Dominio con al menos un punto y TLD 2–24
  if (!/^[^\s@]+\.[^\s@]{2,24}$/.test(domain)) return false;

  // Chequeo general
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidPassword(pw) {
  const s = String(pw || '');
  if (s.length < 8 || s.length > 64) return false;
  if (/\s/.test(s)) return false;
  let classes = 0;
  if (/[a-z]/.test(s)) classes++;
  if (/[A-Z]/.test(s)) classes++;
  if (/\d/.test(s)) classes++;
  if (/[^A-Za-z0-9]/.test(s)) classes++;
  return classes >= 2; // Al menos 2 de 4 clases
}

// ============================== Clase DAO ==============================
class JsonClientesDAO {
  constructor() {
    this.filePath = path.join(__dirname, '..', 'data', 'clientes.json');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        console.log('📁 Archivo de clientes creado:', this.filePath);
      }
    } catch (error) {
      console.error('❌ Error inicializando clientes DAO:', error);
    }
  }

  // Lee crudo del JSON para no perder campos (incluye hashes)
  async _readAllRaw() {
    const data = await fs.readFile(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  async _writeAllRaw(arr) {
    await fs.writeFile(this.filePath, JSON.stringify(arr, null, 2));
  }

  // Público: lista sin exponer hashes
  async getAll() {
    const raw = await this._readAllRaw();
    return raw.map(({ passwordHash, password, ...rest }) => rest);
  }

  async _findByEmailRaw(email) {
    const clientes = await this._readAllRaw();
    const needle = (email || '').toLowerCase();
    return clientes.find(c => (c.email || '').toLowerCase() === needle) || null;
  }

  async getByEmail(email) {
    const raw = await this._readAllRaw();
    const needle = String(email || '').toLowerCase().trim();
    const u = raw.find(c => String(c.email || '').toLowerCase() === needle);
    if (!u) return null;
    if (!u.passwordHash) {
      throw new Error(`Usuario ${u.email} no tiene passwordHash válido. Debe volver a registrarse.`);
    }
    return u; // incluye hash, úsalo para login
  }

  async getById(id) {
    const clientes = await this._readAllRaw();
    return clientes.find(c => c.id === id) || null;
  }

  // ============================== Crear cliente ==============================
  async save(cliente) {
    try {
      // 1) Whitelist de entrada
      const input = pickAllowedFields(cliente, ['nombre', 'email', 'telefono', 'password']);

      // 2) Normalización
      const nombre = stripAndCollapse(input.nombre);
      const email  = normalizeEmail(input.email);

      // 3) Requeridos
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

      // 4) Validaciones de formato
      if (!isValidNombre(nombre)) {
        const err = new Error('Nombre inválido: usa solo letras (puede incluir tildes y ñ), espacios, guion o apóstrofe; 2 a 60 caracteres.');
        err.code = 'NAME_INVALID';
        throw err;
      }
      if (!isValidEmail(email)) {
        const err = new Error('Email inválido');
        err.code = 'EMAIL_INVALID';
        throw err;
      }
      if (!isValidPassword(input.password)) {
        const err = new Error('Contraseña débil: mínimo 8, sin espacios y combina mayúsculas/minúsculas/números/símbolos (2 de 4).');
        err.code = 'PASSWORD_WEAK';
        throw err;
      }
      // 4.1) Solo límite de largo para el teléfono (si viene)
      let telefono = null;
      if (input.telefono !== undefined && input.telefono !== null) {
        telefono = String(input.telefono).trim();
        if (telefono.length > 12) {
          const err = new Error('Teléfono demasiado largo (máx. 12 caracteres).');
          err.code = 'PHONE_TOO_LONG';
          throw err;
        }
        // si permites vacío como “sin teléfono”
        if (telefono === '') telefono = null;
      }

      // 5) Leer base
      const raw = await this._readAllRaw();

      // 6) Duplicados
      const dupEmail = raw.find(c => String(c.email || '').toLowerCase().trim() === email);
      if (dupEmail) {
        const err = new Error('El email ya está registrado');
        err.code = 'EMAIL_DUP';
        throw err;
      }

      // 7) Construir y persistir (ignorar role/id/activo del cliente)
      const toSave = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        nombre,
        email,
        telefono,
        passwordHash: bcrypt.hashSync(input.password, 10),
        role: 'user',
        activo: true,
      };

      raw.push(toSave);
      await this._writeAllRaw(raw);

      // 8) Respuesta pública
      const { passwordHash, password, ...publicUser } = toSave;
      return publicUser;

    } catch (error) {
      console.error('❌ Error guardando cliente:', error);
      throw error;
    }
  }

  // ============================== Actualizar cliente ==============================
  async update(id, updatedCliente) {
    const clientes = await this._readAllRaw();
    const idx = clientes.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const current = clientes[idx];

    // Whitelist de campos permitidos en update
    const patchIn = pickAllowedFields(updatedCliente, [
      'nombre', 'email', 'telefono', 'password', 'activo'
    ]);

    const patch = {};

    // --- Nombre ---
    if (patchIn.nombre !== undefined) {
      const nombre = stripAndCollapse(patchIn.nombre);
      if (!isValidNombre(nombre)) {
        const err = new Error('Nombre inválido');
        err.code = 'NAME_INVALID';
        throw err;
      }
      patch.nombre = nombre;
    }

    // --- Email ---
    if (patchIn.email !== undefined) {
      const email = normalizeEmail(patchIn.email);
      if (!isValidEmail(email)) {
        const err = new Error('Email inválido');
        err.code = 'EMAIL_INVALID';
        throw err;
      }
      const dup = clientes.find((c, i) => i !== idx && String(c.email || '').toLowerCase() === email);
      if (dup) {
        const err = new Error('El email ya está registrado por otro usuario');
        err.code = 'EMAIL_DUP';
        throw err;
      }
      patch.email = email;
    }

    // --- Teléfono (solo largo) ---
    if (patchIn.telefono !== undefined) {
      let telefono = String(patchIn.telefono).trim();
      if (telefono === '') telefono = null;
      if (telefono && telefono.length > 12) {
        const err = new Error('Teléfono demasiado largo (máx. 12 caracteres).');
        err.code = 'PHONE_TOO_LONG';
        throw err;
      }
      patch.telefono = telefono;
    }

    // --- Password ---
    if (patchIn.password !== undefined) {
      const pw = String(patchIn.password || '');
      if (!isValidPassword(pw)) {
        const err = new Error('Contraseña débil');
        err.code = 'PASSWORD_WEAK';
        throw err;
      }
      patch.passwordHash = await bcrypt.hash(pw, 10);
    }

    // --- Activo ---
    if (patchIn.activo !== undefined) {
      patch.activo = Boolean(patchIn.activo);
    }

    // Campos NO editables
    delete patch.role;
    delete patch.id;
    delete patch.createdAt;

    const updated = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    clientes[idx] = updated;
    await this._writeAllRaw(clientes);

    // Devuelve SIN hash
    const { passwordHash, password, ...publicUser } = updated;
    return publicUser;
  }

  // ============================== Borrar cliente ==============================
  async delete(id) {
    const clientes = await this._readAllRaw();
    const filtered = clientes.filter(c => c.id !== id);
    if (clientes.length === filtered.length) return false;

    await this._writeAllRaw(filtered);
    console.log('✅ Cliente eliminado:', id);
    return true;
  }
}

module.exports = JsonClientesDAO;