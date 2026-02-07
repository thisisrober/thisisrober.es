import { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const prompts = [
  {
    title: 'Generate blog post (ES)',
    prompt: `Escribe un artículo de blog sobre [TEMA] en español. Debe tener un título atractivo, un extracto de 2 frases, y el contenido en formato Markdown con secciones bien organizadas. Incluye ejemplos prácticos y una conclusión con las ideas principales. Tono profesional pero accesible. Longitud aproximada: 800-1200 palabras.`,
  },
  {
    title: 'Generate blog post (EN)',
    prompt: `Write a blog article about [TOPIC] in English. It should have an engaging title, a 2-sentence excerpt, and the content in Markdown format with well-organized sections. Include practical examples and a conclusion with key takeaways. Professional but accessible tone. Approximate length: 800-1200 words.`,
  },
  {
    title: 'Translate post ES → EN',
    prompt: `Traduce el siguiente artículo de blog del español al inglés. Mantén el formato Markdown exacto, incluidas las cabeceras, listas y bloques de código. Adapta expresiones idiomáticas al inglés de forma natural, no traduzcas literalmente. Proporciona también un título y extracto traducidos.\n\n[PASTE ARTICLE HERE]`,
  },
  {
    title: 'Improve excerpt',
    prompt: `Mejora el siguiente extracto de blog para que sea más atractivo y genere curiosidad. Debe tener máximo 2 frases y captar la atención del lector. Proporciona versión en español e inglés.\n\nExcerpt actual: [EXCERPT]`,
  },
  {
    title: 'SEO meta description',
    prompt: `Genera una meta description SEO-friendly (máximo 155 caracteres) para un artículo de blog con el siguiente título y contenido. Proporciona versión en español e inglés.\n\nTítulo: [TITLE]\nTema: [TOPIC]`,
  },
  {
    title: 'Post ideas',
    prompt: `Sugiere 10 ideas de artículos de blog sobre desarrollo web, cloud computing, o tecnología en general. Para cada idea, proporciona:\n- Título (ES e EN)\n- Breve descripción (1 frase)\n- Categoría sugerida\n- Nivel de dificultad (básico/intermedio/avanzado)\n\nEvita temas genéricos. Enfócate en contenido práctico y actualizado.`,
  },
];

export default function DashPromptsPage() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <h1>Prompts IA</h1>
        <p>Prompts útiles para generar contenido del blog con IA</p>
      </div>

      <div className="dash-prompts-grid">
        {prompts.map((p, i) => (
          <div key={i} className="dash-card dash-prompt-card">
            <h3 className="dash-card-title">{p.title}</h3>
            <pre className="dash-prompt-text">{p.prompt}</pre>
            <button
              className={`dash-btn ${copied === i ? 'dash-btn-success' : 'dash-btn-ghost'}`}
              onClick={() => copyToClipboard(p.prompt, i)}
            >
              {copied === i ? <><FaCheck /> Copiado</> : <><FaCopy /> Copiar</>}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
