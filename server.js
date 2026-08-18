const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Stockage temporaire en mémoire vive (évite les pertes de données)
let projects = [];

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
