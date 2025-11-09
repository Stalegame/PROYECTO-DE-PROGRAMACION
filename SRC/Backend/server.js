const { app, PersistenceFactory } = require('./app');
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await PersistenceFactory.initialize();

    app.listen(PORT, () => {
      console.log(`🟢 Servidor FRUNA escuchando en http://localhost:${PORT}`);
      console.log(`🧩 Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
})();
