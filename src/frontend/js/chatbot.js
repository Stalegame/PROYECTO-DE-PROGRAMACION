document.addEventListener('DOMContentLoaded', () => {
    const togglerBtn = document.getElementById('chatbot-toggler-btn');
    const modal = document.getElementById('chatbot-modal');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatArea = document.getElementById('chat-area');

    // Cerrar carrito si está abierto cuando se abre el chatbot
    function toggleChatbot() {
        const carritoSidebar = document.getElementById('carritoSidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        // Cerrar carrito si está abierto
        if (carritoSidebar && carritoSidebar.classList.contains('active')) {
            carritoSidebar.classList.remove('active');
            if (sidebarOverlay) {
                sidebarOverlay.style.opacity = '0';
                sidebarOverlay.style.pointerEvents = 'none';
            }
        }
        
        modal.classList.toggle('visible');
        if (modal.classList.contains('visible')) {
            chatInput.focus();
        }
    }

    // --- Listeners de Interfaz ---
    togglerBtn.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('visible');
    });

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (modal.classList.contains('visible') && 
            !modal.contains(e.target) && 
            !togglerBtn.contains(e.target)) {
            modal.classList.remove('visible');
        }
    });

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
        chatInput.value = '';

        // 2. Mostrar "Escribiendo..." (mejorado)
        const thinkingIndicator = appendMessage('Escribiendo...', 'incoming typing');
        
        // 3. Llamar al API de tu backend
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    message: userMessage, 
                    userId: getUserId() 
                }) 
            });

            const data = await res.json();

            // 4. Eliminar indicador de "Escribiendo..."
            if (thinkingIndicator.parentNode) {
                chatArea.removeChild(thinkingIndicator);
            }
            
            // 5. Mostrar respuesta del bot
            if (res.ok && data.reply) { 
                appendMessage(data.reply, 'incoming');
            } else {
                appendMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.', 'incoming');
            }

        } catch (error) {
            // Eliminar indicador en caso de error
            if (thinkingIndicator.parentNode) { 
                chatArea.removeChild(thinkingIndicator); 
            }
            appendMessage('Error de conexión. Por favor verifica tu internet e intenta nuevamente.', 'incoming');
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
    
    // Función para obtener el ID de usuario
    function getUserId() {
        const userStr = localStorage.getItem('fruna_user');
        try {
            const user = userStr ? JSON.parse(userStr) : {};
            return user.id;
        } catch {
            return 'guest';
        }
    }
});