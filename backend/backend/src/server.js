// Importer les routes IA
const cvRoutes = require('./routes/ai/cv.routes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cv', cvRoutes);  // Nouvelle route IA