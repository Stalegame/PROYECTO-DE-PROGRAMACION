class ChatbotDAO {
  // Conversaciones
  async getAllMessages()             { throw new Error('Método no implementado'); }
  async saveMessage(msg)             { throw new Error('Método no implementado'); }
  async getMessagesByUser(userId)    { throw new Error('Método no implementado'); }
  async getConversation(userId, lim) { throw new Error('Método no implementado'); }
  async clearUserMessages(userId)    { throw new Error('Método no implementado'); }
  async clearAllMessages()           { throw new Error('Método no implementado'); }

  // FAQs
  async getFAQs()                    { throw new Error('Método no implementado'); }
  async saveFAQs(faqs)               { throw new Error('Método no implementado'); }
}
module.exports = ChatbotDAO;
