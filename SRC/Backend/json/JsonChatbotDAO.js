<<<<<<< HEAD
const fs = require('fs').promises;
const path = require('path');

class JsonChatbotDAO {
  constructor() {
    // RUTA CORREGIDA: apunta a vscode/data/conversaciones-chatbot.json
    this.filePath = path.join(__dirname, '..', 'vscode', 'data', 'conversaciones-chatbot.json');
    this.init();
  }
  async init() {
    try {
      // Crear directorio data si no existe
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      
      // Inicializar archivo de conversaciones
      try {
        await fs.access(this.filePath);
        console.log('📁 Archivo de chatbot encontrado:', this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        console.log('📁 Archivo de chatbot creado:', this.filePath);
      }

      // Inicializar archivo de FAQs si existe
      try {
        await fs.access(this.faqsPath);
        console.log('📁 Archivo de FAQs encontrado:', this.faqsPath);
      } catch {
        // No crear FAQs automáticamente, puede que no se necesiten
        console.log('ℹ️ Archivo de FAQs no encontrado, se creará cuando sea necesario');
      }
    } catch (error) {
      console.error('❌ Error inicializando chatbot DAO:', error);
    }
  }

  async getAllMessages() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error leyendo mensajes:', error);
      return [];
    }
  }

  async saveMessage(mensaje) {
    try {
      const mensajes = await this.getAllMessages();
      mensaje.id = mensaje.id || Date.now().toString();
      mensaje.timestamp = new Date().toISOString();
      mensajes.push(mensaje);
      await fs.writeFile(this.filePath, JSON.stringify(mensajes, null, 2));
      console.log('💬 Mensaje guardado:', mensaje.id);
      return mensaje;
    } catch (error) {
      console.error('❌ Error guardando mensaje:', error);
      throw error;
    }
  }

  async getMessagesByUser(userId) {
    const mensajes = await this.getAllMessages();
    return mensajes.filter(m => m.userId === userId);
  }

  async getConversation(userId, limit = 50) {
    const mensajes = await this.getMessagesByUser(userId);
    return mensajes
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async clearUserMessages(userId) {
    try {
      const mensajes = await this.getAllMessages();
      const filteredMessages = mensajes.filter(m => m.userId !== userId);
      await fs.writeFile(this.filePath, JSON.stringify(filteredMessages, null, 2));
      console.log('🧹 Mensajes eliminados para usuario:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error limpiando mensajes:', error);
      throw error;
    }
  }

  async clearAllMessages() {
    try {
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
      console.log('🧹 Todos los mensajes eliminados');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando mensajes:', error);
      throw error;
    }
  }

  async getFAQs() {
    try {
      const data = await fs.readFile(this.faqsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error leyendo FAQs:', error);
      return [];
    }
  }

  async saveFAQs(faqs) {
    try {
      await fs.writeFile(this.faqsPath, JSON.stringify(faqs, null, 2));
      console.log('✅ FAQs guardadas correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error guardando FAQs:', error);
      throw error;
    }
  }
}

=======
const fs = require('fs').promises;
const path = require('path');

class JsonChatbotDAO {
  constructor() {
    this.filePath = path.join(__dirname, '..', '..', 'vscode', 'data', 'conversaciones-chatbot.json');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      try {
        await fs.access(this.filePath);
        console.log('📁 Archivo de chatbot encontrado:', this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        console.log('📁 Archivo de chatbot creado:', this.filePath);
      }
    } catch (error) {
      console.error('❌ Error inicializando chatbot DAO:', error);
    }
  }

  async getAllMessages() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error leyendo mensajes:', error);
      return [];
    }
  }

  async saveMessage(mensaje) {
    try {
      const mensajes = await this.getAllMessages();
      mensaje.id = mensaje.id || Date.now().toString();
      mensaje.timestamp = new Date().toISOString();
      mensajes.push(mensaje);
      await fs.writeFile(this.filePath, JSON.stringify(mensajes, null, 2));
      console.log('💬 Mensaje guardado:', mensaje.id);
      return mensaje;
    } catch (error) {
      console.error('❌ Error guardando mensaje:', error);
      throw error;
    }
  }

  async getMessagesByUser(userId) {
    const mensajes = await this.getAllMessages();
    return mensajes.filter(m => m.userId === userId);
  }

  async getConversation(userId, limit = 50) {
    const mensajes = await this.getMessagesByUser(userId);
    return mensajes
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async clearUserMessages(userId) {
    try {
      const mensajes = await this.getAllMessages();
      const filteredMessages = mensajes.filter(m => m.userId !== userId);
      await fs.writeFile(this.filePath, JSON.stringify(filteredMessages, null, 2));
      console.log('🧹 Mensajes eliminados para usuario:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error limpiando mensajes:', error);
      throw error;
    }
  }

  async clearAllMessages() {
    try {
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
      console.log('🧹 Todos los mensajes eliminados');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando mensajes:', error);
      throw error;
    }
  }

  async getFAQs() {
    try {
      const faqsPath = path.join(__dirname, '..', '..', 'vscode', 'data', 'faqs-chatbot.json');
      const data = await fs.readFile(faqsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error leyendo FAQs:', error);
      return [];
    }
  }
}

>>>>>>> origin
module.exports = JsonChatbotDAO;