/**
 * Repository Templates
 * 
 * Each template defines a set of files to be committed to a new GitHub repo.
 * Files are returned as { path, content } arrays.
 */

// =============================================
// HELPER: README header block (shared across templates)
// =============================================
function readmeHeader(name, description, githubUser = 'thisisrober') {
  return `<div align="center">

# ${name}

${description}

[![Preview](https://img.shields.io/badge/🌐_Preview-Visit_Site-6366f1?style=for-the-badge)](https://thisisrober.es/projects/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')})
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Follow-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/${githubUser})
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/${githubUser})
[![Stars](https://img.shields.io/github/stars/${githubUser}/${name}?style=for-the-badge&color=f59e0b)](https://github.com/${githubUser}/${name}/stargazers)

</div>

---

`;
}

// =============================================
// MIT LICENSE
// =============================================
function mitLicense(year = new Date().getFullYear()) {
  return `MIT License

Copyright (c) ${year} thisisrober (Robert Lita Jeler)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

// =============================================
// TEMPLATE: basic
// =============================================
function basicTemplate(name, description) {
  return [
    {
      path: 'LICENSE',
      content: mitLicense(),
    },
    {
      path: 'README.md',
      content: readmeHeader(name, description) +
`## 📖 Overview

${description}

## 📂 Project Structure

\`\`\`
├── README.md
├── LICENSE
└── src/
\`\`\`

## 🛠️ Technologies

- ...

## 🚀 Getting Started

\`\`\`bash
# Clone the repository
git clone https://github.com/thisisrober/${name}.git
cd ${name}

# Start developing
\`\`\`

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <a href="https://thisisrober.es">thisisrober</a>
</div>
`,
    },
    {
      path: '.gitignore',
      content: `# Dependencies
node_modules/
vendor/

# Build
dist/
build/
*.min.js
*.min.css

# OS
.DS_Store
Thumbs.db
*.swp
*.swo

# IDE
.idea/
.vscode/
*.code-workspace

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
`,
    },
  ];
}

// =============================================
// TEMPLATE: data-analysis
// =============================================
function dataAnalysisTemplate(name, description) {
  return [
    {
      path: 'LICENSE',
      content: mitLicense(),
    },
    {
      path: 'README.md',
      content: readmeHeader(name, description) +
`## 📖 Overview

${description}

## 📂 Project Structure

\`\`\`
├── README.md
├── LICENSE
├── requirements.txt
├── notebooks/
│   └── analysis.ipynb
├── data/
│   ├── raw/
│   └── processed/
├── src/
│   └── utils.py
└── output/
    └── figures/
\`\`\`

## 🛠️ Technologies

- Python 3.10+
- Jupyter Notebook
- pandas
- numpy
- matplotlib / seaborn
- scikit-learn

## 🚀 Getting Started

\`\`\`bash
# Clone the repository
git clone https://github.com/thisisrober/${name}.git
cd ${name}

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\\Scripts\\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Launch Jupyter
jupyter notebook
\`\`\`

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <a href="https://thisisrober.es">thisisrober</a>
</div>
`,
    },
    {
      path: 'requirements.txt',
      content: `pandas>=2.0
numpy>=1.24
matplotlib>=3.7
seaborn>=0.12
scikit-learn>=1.3
jupyter>=1.0
openpyxl>=3.1
`,
    },
    {
      path: 'notebooks/analysis.ipynb',
      content: JSON.stringify({
        nbformat: 4,
        nbformat_minor: 5,
        metadata: {
          kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
          language_info: { name: 'python', version: '3.10.0' },
        },
        cells: [
          {
            cell_type: 'markdown',
            metadata: {},
            source: [`# ${name}\n`, `\n`, `${description}\n`, `\n`, `## Setup`],
          },
          {
            cell_type: 'code',
            metadata: {},
            source: [
              'import pandas as pd\n',
              'import numpy as np\n',
              'import matplotlib.pyplot as plt\n',
              'import seaborn as sns\n',
              '\n',
              'sns.set_theme(style="whitegrid")\n',
              'plt.rcParams["figure.figsize"] = (12, 6)',
            ],
            outputs: [],
            execution_count: null,
          },
          {
            cell_type: 'markdown',
            metadata: {},
            source: ['## 1. Data Loading'],
          },
          {
            cell_type: 'code',
            metadata: {},
            source: ['# df = pd.read_csv("../data/raw/dataset.csv")\n', '# df.head()'],
            outputs: [],
            execution_count: null,
          },
          {
            cell_type: 'markdown',
            metadata: {},
            source: ['## 2. Exploratory Data Analysis'],
          },
          {
            cell_type: 'code',
            metadata: {},
            source: ['# df.describe()'],
            outputs: [],
            execution_count: null,
          },
          {
            cell_type: 'markdown',
            metadata: {},
            source: ['## 3. Visualization'],
          },
          {
            cell_type: 'code',
            metadata: {},
            source: ['# Your visualization code here'],
            outputs: [],
            execution_count: null,
          },
          {
            cell_type: 'markdown',
            metadata: {},
            source: ['## 4. Conclusions'],
          },
        ],
      }, null, 2),
    },
    {
      path: 'src/utils.py',
      content: `"""Utility functions for data analysis."""


def load_data(filepath: str):
    """Load dataset from file path."""
    import pandas as pd
    
    if filepath.endswith('.csv'):
        return pd.read_csv(filepath)
    elif filepath.endswith('.xlsx'):
        return pd.read_excel(filepath)
    elif filepath.endswith('.json'):
        return pd.read_json(filepath)
    else:
        raise ValueError(f"Unsupported file format: {filepath}")


def save_figure(fig, name: str, output_dir: str = "output/figures"):
    """Save matplotlib figure to output directory."""
    import os
    os.makedirs(output_dir, exist_ok=True)
    fig.savefig(os.path.join(output_dir, f"{name}.png"), dpi=150, bbox_inches="tight")
`,
    },
    {
      path: 'data/raw/.gitkeep',
      content: '',
    },
    {
      path: 'data/processed/.gitkeep',
      content: '',
    },
    {
      path: 'output/figures/.gitkeep',
      content: '',
    },
    {
      path: '.gitignore',
      content: `# Python
__pycache__/
*.py[cod]
*$py.class
*.egg-info/
dist/
build/
venv/
.venv/
*.egg

# Jupyter
.ipynb_checkpoints/
*.ipynb_checkpoints

# Data (keep structure, ignore large files)
data/raw/*.csv
data/raw/*.xlsx
data/raw/*.json
data/raw/*.parquet
!data/raw/.gitkeep
data/processed/*.csv
data/processed/*.parquet
!data/processed/.gitkeep

# Output
output/figures/*.png
output/figures/*.pdf
!output/figures/.gitkeep

# OS
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/

# Environment
.env
`,
    },
  ];
}

// =============================================
// TEMPLATE: node-fullstack
// =============================================
function nodeFullstackTemplate(name, description) {
  return [
    {
      path: 'LICENSE',
      content: mitLicense(),
    },
    {
      path: 'README.md',
      content: readmeHeader(name, description) +
`## 📖 Overview

${description}

## 📂 Project Structure

\`\`\`
├── package.json
├── vite.config.js
├── index.html
├── .github/
│   └── copilot-instructions.md
├── server/
│   ├── index.js
│   ├── database/
│   │   └── db.js
│   ├── routes/
│   │   └── api.js
│   └── middleware/
│       └── auth.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   ├── pages/
│   ├── services/
│   │   └── api.js
│   └── styles/
│       └── main.css
├── public/
├── docs/
│   └── README.md
└── tests/
\`\`\`

## 🛠️ Technologies

- **Frontend**: React 18, Vite, CSS
- **Backend**: Express, Node.js
- **Database**: SQLite (sql.js)

## 🚀 Getting Started

\`\`\`bash
git clone https://github.com/thisisrober/${name}.git
cd ${name}
npm install
npm run dev
\`\`\`

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <a href="https://thisisrober.es">thisisrober</a>
</div>
`,
    },
    {
      path: 'package.json',
      content: JSON.stringify({
        name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'concurrently "npm run dev:client" "npm run dev:server"',
          'dev:client': 'vite',
          'dev:server': 'node --watch server/index.js',
          build: 'vite build',
          start: 'node server/index.js',
        },
        dependencies: {
          express: '^4.21.1',
          cors: '^2.8.5',
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'react-router-dom': '^6.28.0',
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.3.4',
          concurrently: '^9.1.0',
          vite: '^6.0.0',
        },
      }, null, 2),
    },
    {
      path: '.github/copilot-instructions.md',
      content: `# Copilot Instructions — ${name}

## Project Overview

${description}

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v6 |
| **Backend** | Express 4 |

## Architecture

See docs/README.md for detailed architecture documentation.

## Key Conventions

- Functional components with hooks
- Use the API wrapper in src/services/api.js
- CSS variables for theming
- Express routes in server/routes/
`,
    },
    {
      path: 'server/index.js',
      content: `import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In production, serve Vite build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
});
`,
    },
    {
      path: 'src/main.jsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    },
    {
      path: 'src/App.jsx',
      content: `export default function App() {
  return (
    <div className="app">
      <h1>${name}</h1>
      <p>${description}</p>
    </div>
  );
}
`,
    },
    {
      path: 'src/styles/main.css',
      content: `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0a0a0a;
  color: #e5e5e5;
  min-height: 100vh;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
`,
    },
    {
      path: 'src/services/api.js',
      content: `const API_BASE = '/api';

const api = {
  async get(url) {
    const res = await fetch(\`\${API_BASE}\${url}\`, { credentials: 'include' });
    return { data: await res.json(), status: res.status };
  },
  async post(url, body) {
    const res = await fetch(\`\${API_BASE}\${url}\`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { data: await res.json(), status: res.status };
  },
};

export default api;
`,
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`,
    },
    {
      path: 'vite.config.js',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  build: { outDir: 'dist' },
});
`,
    },
    {
      path: 'docs/README.md',
      content: `# ${name} — Documentation\n\n## Architecture\n\nTBD\n`,
    },
    {
      path: 'tests/.gitkeep',
      content: '',
    },
    {
      path: '.gitignore',
      content: `node_modules/
dist/
.env
.env.local
.DS_Store
Thumbs.db
*.log
.idea/
.vscode/
`,
    },
  ];
}

// =============================================
// TEMPLATE: node-api
// =============================================
function nodeApiTemplate(name, description) {
  return [
    {
      path: 'LICENSE',
      content: mitLicense(),
    },
    {
      path: 'README.md',
      content: readmeHeader(name, description) +
`## 📖 Overview

${description}

## 📂 Project Structure

\`\`\`
├── package.json
├── server/
│   ├── index.js
│   ├── routes/
│   │   └── api.js
│   ├── middleware/
│   │   └── auth.js
│   ├── services/
│   └── database/
├── tests/
└── docs/
\`\`\`

## 🛠️ Technologies

- Node.js 18+
- Express 4
- SQLite (sql.js)

## 🚀 Getting Started

\`\`\`bash
git clone https://github.com/thisisrober/${name}.git
cd ${name}
npm install
npm run dev
\`\`\`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <a href="https://thisisrober.es">thisisrober</a>
</div>
`,
    },
    {
      path: 'package.json',
      content: JSON.stringify({
        name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'node --watch server/index.js',
          start: 'node server/index.js',
          test: 'node --test tests/',
        },
        dependencies: {
          express: '^4.21.1',
          cors: '^2.8.5',
        },
      }, null, 2),
    },
    {
      path: 'server/index.js',
      content: `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`🚀 API running on http://localhost:\${PORT}\`);
});
`,
    },
    {
      path: 'server/routes/api.js',
      content: `import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

export default router;
`,
    },
    {
      path: '.github/copilot-instructions.md',
      content: `# Copilot Instructions — ${name}\n\n## Overview\n\n${description}\n\n## Stack\n\n- Node.js + Express API\n- RESTful conventions\n`,
    },
    {
      path: 'tests/.gitkeep',
      content: '',
    },
    {
      path: 'docs/README.md',
      content: `# ${name} — API Documentation\n\n## Endpoints\n\nTBD\n`,
    },
    {
      path: '.gitignore',
      content: `node_modules/\n.env\n.env.local\n.DS_Store\n*.log\n.idea/\n.vscode/\n`,
    },
  ];
}

// =============================================
// TEMPLATE: react-vite
// =============================================
function reactViteTemplate(name, description) {
  return [
    {
      path: 'LICENSE',
      content: mitLicense(),
    },
    {
      path: 'README.md',
      content: readmeHeader(name, description) +
`## 📖 Overview

${description}

## 🛠️ Technologies

- React 18
- Vite 6
- React Router v6
- CSS Variables

## 🚀 Getting Started

\`\`\`bash
git clone https://github.com/thisisrober/${name}.git
cd ${name}
npm install
npm run dev
\`\`\`

## 📝 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  Made with ❤️ by <a href="https://thisisrober.es">thisisrober</a>
</div>
`,
    },
    {
      path: 'package.json',
      content: JSON.stringify({
        name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'react-router-dom': '^6.28.0',
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.3.4',
          vite: '^6.0.0',
        },
      }, null, 2),
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`,
    },
    {
      path: 'vite.config.js',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
});
`,
    },
    {
      path: 'src/main.jsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
`,
    },
    {
      path: 'src/App.jsx',
      content: `export default function App() {
  return (
    <div className="app">
      <h1>${name}</h1>
      <p>${description}</p>
    </div>
  );
}
`,
    },
    {
      path: 'src/styles/main.css',
      content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #e5e5e5; min-height: 100vh; }
.app { max-width: 1200px; margin: 0 auto; padding: 2rem; }
`,
    },
    {
      path: '.github/copilot-instructions.md',
      content: `# Copilot Instructions — ${name}\n\n## Overview\n${description}\n\n## Stack\nReact 18 + Vite SPA\n`,
    },
    {
      path: '.gitignore',
      content: `node_modules/\ndist/\n.env\n.DS_Store\n*.log\n.idea/\n.vscode/\n`,
    },
  ];
}

// =============================================
// TEMPLATE: static-site
// =============================================
function staticSiteTemplate(name, description) {
  return [
    {
      path: 'LICENSE',
      content: mitLicense(),
    },
    {
      path: 'README.md',
      content: readmeHeader(name, description) +
`## 📖 Overview

${description}

## 🛠️ Technologies

- HTML5
- CSS3
- Vanilla JavaScript

## 🚀 Getting Started

\`\`\`bash
git clone https://github.com/thisisrober/${name}.git
cd ${name}
# Open index.html in your browser
\`\`\`

## 📝 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  Made with ❤️ by <a href="https://thisisrober.es">thisisrober</a>
</div>
`,
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header>
    <h1>${name}</h1>
    <p>${description}</p>
  </header>
  <main id="app"></main>
  <script src="js/main.js"></script>
</body>
</html>
`,
    },
    {
      path: 'css/style.css',
      content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #e5e5e5; min-height: 100vh; }
header { text-align: center; padding: 4rem 2rem 2rem; }
main { max-width: 1200px; margin: 0 auto; padding: 2rem; }
`,
    },
    {
      path: 'js/main.js',
      content: `// ${name} — Main JavaScript\n\nconsole.log('${name} loaded');\n`,
    },
    {
      path: 'assets/.gitkeep',
      content: '',
    },
    {
      path: '.gitignore',
      content: `.DS_Store\nThumbs.db\n*.log\n.idea/\n.vscode/\n`,
    },
  ];
}

// =============================================
// TEMPLATE: python-project
// =============================================
function pythonProjectTemplate(name, description) {
  const pyName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return [
    {
      path: 'LICENSE',
      content: mitLicense(),
    },
    {
      path: 'README.md',
      content: readmeHeader(name, description) +
`## 📖 Overview

${description}

## 📂 Project Structure

\`\`\`
├── README.md
├── LICENSE
├── requirements.txt
├── setup.py
├── ${pyName}/
│   ├── __init__.py
│   └── main.py
├── tests/
│   └── test_main.py
└── docs/
\`\`\`

## 🛠️ Technologies

- Python 3.10+

## 🚀 Getting Started

\`\`\`bash
git clone https://github.com/thisisrober/${name}.git
cd ${name}
python -m venv venv
source venv/bin/activate  # or venv\\Scripts\\activate on Windows
pip install -r requirements.txt
python -m ${pyName}.main
\`\`\`

## 📝 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  Made with ❤️ by <a href="https://thisisrober.es">thisisrober</a>
</div>
`,
    },
    {
      path: 'requirements.txt',
      content: `# Add your dependencies here\n`,
    },
    {
      path: `${pyName}/__init__.py`,
      content: `"""${name} — ${description}"""\n\n__version__ = "1.0.0"\n`,
    },
    {
      path: `${pyName}/main.py`,
      content: `"""Main entry point for ${name}."""\n\n\ndef main():\n    print("Hello from ${name}!")\n\n\nif __name__ == "__main__":\n    main()\n`,
    },
    {
      path: 'tests/test_main.py',
      content: `"""Tests for ${name}."""\n\n\ndef test_placeholder():\n    assert True\n`,
    },
    {
      path: 'docs/.gitkeep',
      content: '',
    },
    {
      path: '.gitignore',
      content: `__pycache__/\n*.py[cod]\nvenv/\n.venv/\n*.egg-info/\ndist/\nbuild/\n.env\n.DS_Store\n.idea/\n.vscode/\n*.log\n`,
    },
  ];
}

// =============================================
// REGISTRY — All templates
// =============================================
export const TEMPLATES = {
  basic: {
    id: 'basic',
    name: 'Básico',
    description: 'Repositorio básico con licencia MIT, README estructurado y .gitignore',
    icon: '📄',
    generate: basicTemplate,
  },
  'data-analysis': {
    id: 'data-analysis',
    name: 'Análisis de Datos',
    description: 'Jupyter notebook vacío, requirements.txt, estructura data/raw y data/processed',
    icon: '📊',
    generate: dataAnalysisTemplate,
  },
  'node-fullstack': {
    id: 'node-fullstack',
    name: 'Node.js Fullstack',
    description: 'React + Express con estructura completa, docs y copilot-instructions.md',
    icon: '🟢',
    generate: nodeFullstackTemplate,
  },
  'node-api': {
    id: 'node-api',
    name: 'Node.js API',
    description: 'Express API backend con rutas, middleware y tests',
    icon: '⚡',
    generate: nodeApiTemplate,
  },
  'react-vite': {
    id: 'react-vite',
    name: 'React + Vite',
    description: 'SPA con React 18, Vite 6 y React Router',
    icon: '⚛️',
    generate: reactViteTemplate,
  },
  'static-site': {
    id: 'static-site',
    name: 'Sitio Estático',
    description: 'HTML/CSS/JS estático listo para desplegar',
    icon: '🌐',
    generate: staticSiteTemplate,
  },
  'python-project': {
    id: 'python-project',
    name: 'Proyecto Python',
    description: 'Estructura Python con módulos, tests y setup',
    icon: '🐍',
    generate: pythonProjectTemplate,
  },
};

/** Get template file list for a given template ID */
export function generateTemplate(templateId, repoName, description) {
  const tpl = TEMPLATES[templateId];
  if (!tpl) throw new Error(`Template "${templateId}" not found`);
  return tpl.generate(repoName, description);
}
