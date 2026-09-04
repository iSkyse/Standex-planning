const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Stockage temporaire en mémoire vive (évite les pertes de données)
let projects = [];
let devTextures = [];

// Route pour récupérer tous les projets
app.get('/api/projects', (req, res) => {
    res.json(projects);
});

// Route pour ajouter ou modifier un projet
app.post('/api/projects', (req, res) => {
    const projectData = req.body;
    
    if (!projectData.id) {
        projectData.id = Date.now();
    }

    // Assurer des valeurs par défaut valides
    projectData.priority = projectData.priority || 'yellow';
    projectData.photo = projectData.photo || '';
    projectData.date_reelle = projectData.date_reelle || null;

    const index = projects.findIndex(p => p.id === Number(projectData.id));
    if (index !== -1) {
        projects[index] = { ...projects[index], ...projectData };
    } else {
        projects.push(projectData);
    }

    res.json({ success: true, project: projectData });
});

// Route pour supprimer un projet
app.delete('/api/projects/:id', (req, res) => {
    const id = Number(req.params.id);
    projects = projects.filter(p => p.id !== id);
    res.json({ success: true });
});

// Route pour récupérer tous les développements de texture
app.get('/api/development', (req, res) => {
    res.json(devTextures);
});

// Route pour ajouter ou modifier un développement de texture
app.post('/api/development', (req, res) => {
    const devData = req.body;

    if (!devData.id) {
        devData.id = Date.now();
    }

    // Assurer des valeurs par défaut valides
    devData.priority = devData.priority || 'CRITICAL';
    devData.state = devData.state || 'IN PROGRESS';
    devData.approved = devData.approved || 'no';
    devData.date_approval = devData.date_approval || '';

    const index = devTextures.findIndex(d => d.id === Number(devData.id));
    if (index !== -1) {
        devTextures[index] = { ...devTextures[index], ...devData };
    } else {
        devTextures.push(devData);
    }

    res.json({ success: true, development: devData });
});

// Route pour supprimer un développement de texture
app.delete('/api/development/:id', (req, res) => {
    const id = Number(req.params.id);
    devTextures = devTextures.filter(d => d.id !== id);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
