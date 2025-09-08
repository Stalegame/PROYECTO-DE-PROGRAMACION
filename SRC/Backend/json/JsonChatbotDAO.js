// json/JsonChatbotDAO.js
const fs = require('fs').promises;
const path = require('path');

class JsonChatbotDAO {
  constructor() {
    // data/ está al lado de json/
    this.filePath = path.join(__dirname, '..', 'data', 'conversaciones-chatbot.json');
    this.faqsPath = path.join(__dirname, '..', 'data', 'chatbot-faqs.json');
    this.init();
  }

  async init() {
    try {
      // Crear directorio data si no existe
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });

      // Conversaciones
      try {
        await fs.access(this.filePath);
        console.log('📁 Archivo de chatbot encontrado:', this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        console.log('📁 Archivo de chatbot creado:', this.filePath);
      }

      // FAQs (lo creamos vacío para evitar errores posteriores)
      try {
        await fs.access(this.faqsPath);
        console.log('📁 Archivo de FAQs encontrado:', this.faqsPath);
      } catch {
        await fs.writeFile(this.faqsPath, JSON.stringify([], null, 2));
        console.log('📁 Archivo de FAQs creado:', this.faqsPath);
      }
    } catch (error) {
      console.error('❌ Error inicializando chatbot DAO:', error);
    }
  }

  // ===== Conversaciones =====
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
      const toSave = {
        ...mensaje,
        id: mensaje.id || Date.now().toString(),
        timestamp: mensaje.timestamp || new Date().toISOString(),
      };
      mensajes.push(toSave);
      await fs.writeFile(this.filePath, JSON.stringify(mensajes, null, 2));
      console.log('💬 Mensaje guardado:', toSave.id);
      return toSave;
    } catch (error) {
      console.error('❌ Error guardando mensaje:', error);
      throw error;
    }
  }

  async getMessagesByUser(userId) {
    const mensajes = await this.getAllMessages();
    return mensajes.filter((m) => m.userId === userId);
  }

  /**
   * Devuelve la conversación del usuario en orden cronológico (más antiguo → más reciente)
   * Si la quieres inversa, cambia el sort por (b - a).
   */
  async getConversation(userId, limit = 50) {
    const mensajes = await this.getMessagesByUser(userId);
    return mensajes
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);
  }

  async clearUserMessages(userId) {
    try {
      const mensajes = await this.getAllMessages();
      const filtered = mensajes.filter((m) => m.userId !== userId);
      await fs.writeFile(this.filePath, JSON.stringify(filtered, null, 2));
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

  // ===== FAQs =====
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

module.exports = JsonChatbotDAO;