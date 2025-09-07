const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const PersistenceFactory = require('../persistence/PersistenceFactory');

const chatbotDAO = PersistenceFactory.getDAO('chatbot');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.array()
    });
  }
  next();
};

// Validaciones para mensajes de chatbot
const validateMessage = [
  body('userId')
    .notEmpty().withMessage('El ID de usuario es requerido')
    .trim().escape(),
  body('message')
    .notEmpty().withMessage('El mensaje no puede estar vacío')
    .isLength({ max: 500 }).withMessage('El mensaje es demasiado largo')
    .trim().escape(),
  body('type')
    .optional()
    .isIn(['user', 'bot']).withMessage('El tipo debe ser user o bot')
    .default('user')
];

// POST /api/chatbot/message - Enviar mensaje al chatbot
router.post('/message', validateMessage, handleValidationErrors, async (req, res) => {
  try {
    const { userId, message, type = 'user' } = req.body;
    
    // Guardar mensaje del usuario
    const userMessage = await chatbotDAO.saveMessage({
      userId,
      message,
      type,
      timestamp: new Date().toISOString()
    });

    // Simular respuesta del bot (aquí puedes integrar tu lógica de IA)
    let botResponse = '';
    
    // Respuestas predefinidas basadas en palabras clave
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas tardes')) {
      botResponse = '¡Hola! ¿En qué puedo ayudarte hoy?';
    } else if (lowerMessage.includes('horario') || lowerMessage.includes('hora') || lowerMessage.includes('abierto')) {
      botResponse = 'Nuestro horario de atención es de lunes a domingo de 8:00 a 22:00 hrs.';
    } else if (lowerMessage.includes('producto') || lowerMessage.includes('productos') || lowerMessage.includes('alfajor') || lowerMessage.includes('chocolate')) {
      botResponse = 'Tenemos una variedad de productos como alfajores, chocolates y galletas. ¿Te interesa algún producto en específico?';
    } else if (lowerMessage.includes('precio') || lowerMessage.includes('cost') || lowerMessage.includes('valor')) {
      botResponse = 'Puedes ver todos nuestros precios en la sección de productos. ¿Necesitas información sobre algún producto específico?';
    } else if (lowerMessage.includes('gracias') || lowerMessage.includes('agradezco') || lowerMessage.includes('thank you')) {
      botResponse = '¡De nada! Estoy aquí para ayudarte. ¿Hay algo más en lo que pueda asistirte?';
    } else {
      // Buscar en FAQs si existe
      try {
        const faqs = await chatbotDAO.getFAQs();
        const matchingFAQ = faqs.find(faq => 
          message.toLowerCase().includes(faq.question.toLowerCase()) ||
          faq.question.toLowerCase().includes(message.toLowerCase())
        );
        
        botResponse = matchingFAQ 
          ? matchingFAQ.answer 
          : 'Lo siento, no entendí tu pregunta. ¿Podrías reformularla o contactar con un representante humano?';
      } catch (error) {
        botResponse = 'Estoy teniendo dificultades para acceder a la información. Por favor, intenta nuevamente o contacta con soporte.';
      }
    }

    // Guardar respuesta del bot
    const botMessage = await chatbotDAO.saveMessage({
      userId,
      message: botResponse,
      type: 'bot',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        userMessage: {
          id: userMessage.id,
          message: userMessage.message,
          timestamp: userMessage.timestamp
        },
        botResponse: {
          id: botMessage.id,
          message: botMessage.message,
          timestamp: botMessage.timestamp
        }
      }
    });

  } catch (error) {
    console.error('❌ Error en chatbot:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar el mensaje'
    });
  }
});

// GET /api/chatbot/conversation/:userId - Obtener conversación de usuario
router.get('/conversation/:userId', [
  body('userId').notEmpty().withMessage('El ID de usuario es requerido')
], handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const conversation = await chatbotDAO.getConversation(userId, parseInt(limit));
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener la conversación'
    });
  }
});

// GET /api/chatbot/faqs - Obtener FAQs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await chatbotDAO.getFAQs();
    
    res.json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener las FAQs'
    });
  }
});

// POST /api/chatbot/faqs - Agregar nueva FAQ (solo admin)
router.post('/faqs', [
  body('question').notEmpty().withMessage('La pregunta es requerida').trim().escape(),
  body('answer').notEmpty().withMessage('La respuesta es requerida').trim().escape()
], handleValidationErrors, async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    const faqs = await chatbotDAO.getFAQs();
    const newFAQ = {
      id: Date.now().toString(),
      question,
      answer,
      timestamp: new Date().toISOString()
    };
    
    faqs.push(newFAQ);
    await chatbotDAO.saveFAQs(faqs);
    
    res.status(201).json({
      success: true,
      message: 'FAQ agregada correctamente',
      data: newFAQ
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al agregar la FAQ'
    });
  }
});

// DELETE /api/chatbot/conversation/:userId - Limpiar conversación de usuario
router.delete('/conversation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await chatbotDAO.clearUserMessages(userId);
    
    res.json({
      success: true,
      message: 'Conversación limpiada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al limpiar la conversación'
    });
  }
});

module.exports = router;