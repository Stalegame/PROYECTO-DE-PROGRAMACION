// json/JsonClientesDAO.js
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

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

  // Lee crudo del JSON para no perder campos
  // Uso interno del DAO, devuelve todo lo que está en el archivo, incluidos los passwordHash. Es para validaciones, login, etc.
  async _readAllRaw() {
    const data = await fs.readFile(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  async _writeAllRaw(arr) {
    await fs.writeFile(this.filePath, JSON.stringify(arr, null, 2));
  }

  // Uso “público”, devuelve la lista de clientes sin exponer los hashes.
  // Ideal para mostrar un listado de clientes (admin panel, reportes, etc.) sin arriesgar contraseñas.
  async getAll() {
    const raw = await this._readAllRaw();
    // nunca muestra hashes
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
    return u;
  }

  async getById(id) {
    const clientes = await this._readAllRaw();
    return clientes.find(c => c.id === id) || null;
  }

  // Guardar clientes
  async save(cliente) {
  try {
    const raw = await this._readAllRaw();

    // Normaliza email
    const email = String(cliente.email || '').toLowerCase().trim();

    // Bloquea duplicados
    const exists = raw.find(c => String(c.email || '').toLowerCase() === email);
    if (exists) {
      const err = new Error('El email ya está registrado');
      err.code = 'EMAIL_DUP';
      throw err;
    }

    const toSave = {
      ...cliente,
      email, // guardado en minúsculas
      id: cliente.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
      passwordHash: bcrypt.hashSync(cliente.password, 10),
      role: cliente.role || 'user', // defecto todos "user"
    };

    delete toSave.password; // nunca guardes password plano

    raw.push(toSave);
    await fs.writeFile(this.filePath, JSON.stringify(raw, null, 2));

    // Devuelve sin el hash
    const { passwordHash, ...publicUser } = toSave;
    return publicUser;
  } catch (error) {
    console.error('❌ Error guardando cliente:', error);
    throw error;
  }
}

  //Actualizar clientes
  async update(id, updatedCliente) {
    const clientes = await this._readAllRaw();
    const idx = clientes.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const current = clientes[idx];
    const patch = { ...updatedCliente };

    // si viene password nuevo, re-hashear
    if (patch.password) {
      patch.passwordHash = await bcrypt.hash(patch.password, 10);
      delete patch.password;
    }

    // si viene email, normalízalo
    if (patch.email) {
      patch.email = patch.email.toLowerCase();
      // validar que no duplique a otro
      const dup = clientes.find(
        (c, i) => i !== idx && (c.email || '').toLowerCase() === patch.email
      );
      if (dup) {
        const err = new Error('El email ya está registrado por otro usuario');
        err.code = 'EMAIL_DUP';
        throw err;
      }
    }

    const updated = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    clientes[idx] = updated;
    await this._writeAllRaw(clientes);

    // devuelve SIN hash
    const { passwordHash, password, ...publicUser } = updated;
    return publicUser;
  }

  // Borrar clientes
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