document.addEventListener('DOMContentLoaded', () => {
    const togglerBtn = document.getElementById('chatbot-toggler-btn');
    const modal = document.getElementById('chatbot-modal');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatArea = document.getElementById('chat-area');

    // Función para abrir/cerrar el modal
    function toggleChatbot() {
        modal.classList.toggle('visible');
    }

    // --- Listeners de Interfaz ---
    togglerBtn.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', toggleChatbot);

    // Enviar mensaje al presionar el botón o Enter
    sendBtn.addEventListener('click', handleChat);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            handleChat();
        }
    });

    // --- Lógica de Envío de Mensajes ---
    async function handleChat() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // 1. Mostrar mensaje del usuario
        appendMessage(userMessage, 'outgoing');
        chatInput.value = ''; // Limpiar input

        // 2. Mostrar "Escribiendo..." (simulado)
        const thinkingIndicator = appendMessage('Escribiendo...', 'incoming');
        
        // 3. Llamar al API de tu backend
        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                    // No se necesita Auth por el momento según tu router
                },
                body: JSON.stringify({ message: userMessage, userId: getUserId() }) 
            });

            const data = await res.json();

            // 4. Eliminar indicador de "Escribiendo..."
            chatArea.removeChild(thinkingIndicator);
            
            // Usamos data.reply porque tu backend responde con "reply"
            if (res.ok && data.reply) { 
                // 5. Mostrar respuesta del bot
                appendMessage(data.reply, 'incoming');
            } else {
                appendMessage(`Error (${res.status}): No pude obtener una respuesta de la API.`, 'incoming');
            }

        } catch (error) {
            if (chatArea.contains(thinkingIndicator)) { 
                 chatArea.removeChild(thinkingIndicator); 
            }
            appendMessage('Error de conexión con el servidor de chat.', 'incoming');
            console.error('Error en API Chatbot:', error);
        }
    }

    // Función auxiliar para agregar mensajes al DOM
    function appendMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
        
        chatArea.appendChild(messageDiv);
        
        // Desplazarse al final del chat
        chatArea.scrollTop = chatArea.scrollHeight; 
        
        return messageDiv; 
    }
    
    // Función para obtener el ID de usuario desde tu localStorage
    function getUserId() {
        const userStr = localStorage.getItem('fruna_user');
        try {
            const user = userStr ? JSON.parse(userStr) : {};
            return user.id || 'guest';
        } catch {
            return 'guest';
        }
    }
});