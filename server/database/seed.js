import { initDB, run, exec } from './db.js';
import bcrypt from 'bcryptjs';

await initDB();

console.log('🗄️  Initializing database...');

// --- Admins ---
run(`INSERT OR IGNORE INTO admins (id, username, password, email, created_at) VALUES (?, ?, ?, ?, ?)`,
  [1, 'thisisrober', bcrypt.hashSync('Lpdmvme1992cmmL&@123', 10), 'personal@thisisrober.com', '2025-11-18 14:33:34']);

// --- Categories ---
const cats = [
  [1, 'Cloud Computing', 'Cloud Computing', 'cloud-computing', 'Artículos sobre tecnologías cloud, Azure, AWS y más', 'Articles about cloud technologies, Azure, AWS and more', '2025-11-18 14:10:06'],
  [2, 'DevOps', 'DevOps', 'devops', 'Automatización, CI/CD, infraestructura como código', 'Automation, CI/CD, infrastructure as code', '2025-11-18 14:10:06'],
  [3, 'Big Data', 'Big Data', 'big-data', 'Análisis de datos, visualización y herramientas', 'Data analysis, visualization and tools', '2025-11-18 14:10:06'],
  [4, 'Programación', 'Programming', 'programming', 'Tutoriales y guías de programación', 'Programming tutorials and guides', '2025-11-18 14:10:06'],
  [5, 'Opinión', 'Opinion', 'opinion', 'Reflexiones y opiniones sobre tecnología', 'Reflections and opinions about technology', '2025-11-18 14:10:06'],
  [6, 'Actualidad', 'Present', 'actualidad', '', '', '2025-11-18 14:49:52'],
  [7, 'Inteligencia Artificial', 'Artificial Intelligence', 'inteligencia-artificial', 'Contenido sobre IA, ML y tecnología aplicada a DevOps, cloud y desarrollo.', 'Content on AI, ML, and technology applied to DevOps, cloud, and software development.', '2025-11-26 11:10:44'],
];
cats.forEach(c => run(`INSERT OR IGNORE INTO categories (id, name_es, name_en, slug, description_es, description_en, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, c));

// --- Blog Posts ---
const post3_es = `¡Hola a todos! 😁

Hoy quiero anunciar una noticia emocionante: el blog ahora está completamente integrado en la web de thisisrober.

## ¿Qué encontrarás aquí?

- Tutoriales y explicaciones sencillas sobre el mundo tech.
- Cobertura de noticias y tendencias tecnológicas.
- Opiniones y análisis de gadgets, apps, inteligencia artificial y mucho más.
- Artículos sobre descubrimientos y temas que simplemente nos parecen fascinantes.

## ¿Te apasiona la tecnología?

¿Quieres estar al día con las últimas novedades? Entonces este blog es para ti.

No importa si eres un experto en tecnología o si apenas estás empezando. Aquí encontrarás contenido para todos los niveles: desde guías paso a paso hasta análisis profundos de las tendencias que están transformando nuestra industria.

Este espacio nace con la intención de crear una comunidad donde podamos compartir conocimiento, debatir ideas y aprender juntos. Si tienes sugerencias sobre temas que te gustaría ver, no dudes en escribirme.

Nos vemos por aquí. 💕`;

const post3_en = `Hello everyone! 😁

Today I'm excited to announce some news: the blog is now fully integrated into the thisisrober website.

## What you'll find here

- Simple tutorials and explanations about the tech world.
- News coverage and tech trends.
- Thoughts and reviews about gadgets, apps, artificial intelligence, and more.
- Articles about discoveries and topics we think are just fascinating.

## Passionate about technology?

Want to stay up to date with the latest news? Then this blog is for you.

It doesn't matter if you're a tech expert or just getting started. Here you'll find content for all levels: from step-by-step guides to deep analyses of the trends that are transforming our industry.

This space was born with the intention of creating a community where we can share knowledge, debate ideas, and learn together. If you have suggestions about topics you'd like to see, don't hesitate to reach out.

See you here! 💕`;

const post5_es = `En tan solo unos días me presento al examen AWS CLF-C02 para certificarme como Cloud Practitioner. Tras 4 meses de preparación con la academia de la Cámara de Comercio Alemana en España, he experimentado de primera mano las carencias de AWS Academy.

¿El resultado? He desarrollado mi propia herramienta de estudio.

[![](https://thisisrober.es/blog/uploads/6963e051d3423_1768153169.png)](https://thisisrober.es/projects/aws-cloud-practitioner-exam-prep-app/)

## El problema con el estudio tradicional

Seamos honestos: la teoría está sobrevalorada. La mayoría de recursos disponibles para el examen CLF-C02 se basan en montañas de documentación que, aunque completa, resulta abrumadora y poco práctica.

AWS Academy ofrece un contenido extenso, pero la realidad es que el formato no se adapta a cómo la mayoría de nosotros aprendemos. Leer cientos de páginas de teoría sin una forma estructurada de evaluar lo aprendido resulta ineficiente. Te pasas horas leyendo, pero cuando llega el momento de la verdad, no sabes si realmente has interiorizado los conceptos.

La mayoría de simuladores de examen disponibles online son de pago, están desactualizados o no cubren los cuatro dominios del examen de forma equilibrada. Necesitaba algo diferente.

## Mi solución: estudio enfocado y efectivo

He condensado todo el contenido relevante de AWS Academy y lo he reorganizado siguiendo los 4 dominios oficiales del examen:

1. **Conceptos de la nube** — Propuesta de valor de AWS, principios de diseño del AWS Cloud, modelos de implementación, etc.
2. **Seguridad y cumplimiento** — Modelo de responsabilidad compartida, IAM, cifrado, seguridad de red.
3. **Tecnología y servicios en la nube** — EC2, S3, Lambda, VPC, RDS, y docenas de servicios más.
4. **Facturación, precios y soporte** — Modelos de pago, AWS Budgets, planes de soporte, TCO.

### Características principales

**📊 Sistema de seguimiento inteligente**
Controla tu progreso por dominio, identifica tus puntos débiles y enfoca tu tiempo donde más lo necesitas. El dashboard muestra estadísticas detalladas de cada dominio y tu evolución a lo largo del tiempo.

**📝 Tests en modo estudio**
Practica con preguntas agrupadas por tema, obteniendo retroalimentación inmediata con explicaciones detalladas de cada respuesta. Cada pregunta incorrecta incluye una referencia directa al concepto de AWS que necesitas repasar.

**🎯 Exámenes de práctica realistas**
Simula el examen real con 65 preguntas, temporizador de 90 minutos y condiciones idénticas al CLF-C02. Al finalizar, obtienes un análisis detallado de tu rendimiento desglosado por dominio.

**⚡ Interfaz intuitiva**
Diseño limpio y moderno que te permite centrarte en el estudio sin distracciones. Responsive para que puedas estudiar desde cualquier dispositivo.

## Contenido de calidad

Todo el contenido de los tests ha sido creado y revisado cuidadosamente, basándose en los objetivos oficiales del examen CLF-C02. Las preguntas cubren escenarios reales y están diseñadas para evaluar la comprensión conceptual, no la memorización.

Además, el mapa conceptual interactivo te permite visualizar cómo se relacionan los diferentes servicios y conceptos de AWS entre sí, lo cual es fundamental para entender el ecosistema cloud de Amazon.

## Tecnología

Desarrollada con **React + Vite** para ofrecer una experiencia rápida, fluida y moderna. La aplicación funciona completamente en el navegador, sin necesidad de backend, lo que garantiza tiempos de carga instantáneos y la posibilidad de estudiar offline una vez cargada.

El código es open source y está disponible en GitHub para que cualquiera pueda contribuir, reportar errores o adaptar la herramienta a sus necesidades.

## ¿Listo para aprobar?

Si estás preparándote para el examen AWS Cloud Practitioner, te invito a probar la app. Es completamente gratuita y está diseñada por alguien que está pasando por el mismo proceso de certificación.

Porque a veces, la mejor herramienta de estudio es la que creas tú mismo.

👉 [Prueba la app aquí](https://thisisrober.es/projects/aws-cloud-practitioner-exam-prep-app/)`;

const post5_en = `In just a few days, I'm taking the AWS CLF-C02 exam to become certified as a Cloud Practitioner. After 4 months of preparation with the German Chamber of Commerce academy in Spain, I've experienced firsthand the shortcomings of AWS Academy.

The result? I've built my own study tool.

[![](https://thisisrober.es/blog/uploads/6963e051d3423_1768153169.png)](https://thisisrober.es/projects/aws-cloud-practitioner-exam-prep-app/)

## The problem with traditional studying

Let's be honest: theory is overrated. Most resources available for the CLF-C02 exam are based on mountains of documentation that, while comprehensive, are overwhelming and impractical.

AWS Academy offers extensive content, but the reality is that the format doesn't adapt to how most of us learn. Reading hundreds of pages of theory without a structured way to evaluate what we've learned is inefficient. You spend hours reading, but when the moment of truth comes, you don't know if you've truly internalized the concepts.

Most exam simulators available online are paid, outdated, or don't cover the four exam domains in a balanced way. I needed something different.

## My solution: focused and effective studying

I've condensed all the relevant content from AWS Academy and reorganized it according to the four official exam domains:

1. **Cloud Concepts** — AWS value proposition, AWS Cloud design principles, deployment models, etc.
2. **Security and Compliance** — Shared responsibility model, IAM, encryption, network security.
3. **Cloud Technology and Services** — EC2, S3, Lambda, VPC, RDS, and dozens more services.
4. **Billing, Pricing, and Support** — Payment models, AWS Budgets, support plans, TCO.

### Key features

**📊 Smart tracking system**
Track your progress by domain, identify your weak points, and focus your time where you need it most. The dashboard shows detailed statistics for each domain and your progress over time.

**📝 Study mode tests**
Practice with questions grouped by topic, getting immediate feedback with detailed explanations for each answer. Each incorrect question includes a direct reference to the AWS concept you need to review.

**🎯 Realistic practice exams**
Simulate the real exam with 65 questions, a 90-minute timer, and conditions identical to the CLF-C02. After finishing, you get a detailed performance analysis broken down by domain.

**⚡ Intuitive interface**
Clean, modern design that lets you focus on studying without distractions. Responsive so you can study from any device.

## Quality content

All test content has been carefully created and reviewed, based on the official CLF-C02 exam objectives. Questions cover real scenarios and are designed to assess conceptual understanding, not memorization.

Additionally, the interactive concept map lets you visualize how different AWS services and concepts relate to each other, which is fundamental for understanding Amazon's cloud ecosystem.

## Technology

Built with **React + Vite** to deliver a fast, smooth, and modern experience. The app runs entirely in the browser, with no backend needed, ensuring instant load times and the ability to study offline once loaded.

The code is open source and available on GitHub for anyone to contribute, report bugs, or adapt the tool to their needs.

## Ready to pass?

If you're preparing for the AWS Cloud Practitioner exam, I invite you to try the app. It's completely free and designed by someone going through the same certification process.

Because sometimes, the best study tool is the one you create yourself.

👉 [Try the app here](https://thisisrober.es/projects/aws-cloud-practitioner-exam-prep-app/)`;

const post6_es = `Mirando hacia atrás, alrededor de 2022, vivimos el *boom* histórico de la Inteligencia Artificial. ChatGPT revolucionó la industria de la noche a la mañana, y con él llegaron decenas de herramientas que prometían cambiar para siempre la forma de programar.

Hoy quiero hablar de **cómo está afectando realmente a los desarrolladores junior**, desde mi experiencia personal como uno de ellos.

## El espejismo de la productividad

Como muchos otros juniors, al principio utilicé herramientas como Cursor e incluso el Copilot empresarial de mi empresa. La sensación inicial es alucinante: escribes un comentario y la IA te genera el código. Lo que antes te llevaba una hora, ahora se hace en minutos.

Pero ahí está el problema. Esa velocidad es un espejismo.

Cuando empecé a depender demasiado de estas herramientas, noté algo preocupante: estaba aceptando código que no entendía completamente. Funcionaba, sí, pero ¿sabía por qué? No siempre. ¿Podía modificarlo si algo cambiaba? A veces no.

## La trampa de la dependencia

He visto a compañeros que apenas llevan un año programando y ya no pueden escribir una función sin pedírsela a la IA. No es que no sepan programar, es que nunca desarrollaron el músculo de pensar el problema antes de escribir la solución.

Es como usar siempre GPS para ir al supermercado de tu barrio. Si un día no tienes cobertura, estás perdido. Literalmente.

La dependencia de la IA crea una falsa sensación de competencia. Produces mucho, pero entiendes poco. Y cuando llega un bug complejo, un requisito ambiguo o una decisión de arquitectura, te quedas en blanco.

## Lo que realmente importa

Después de meses usando y evaluando estas herramientas, he llegado a una conclusión: **los fundamentos no son negociables**.

No hablo de memorizar algoritmos de ordenación o saber de memoria los patrones de diseño. Hablo de:

- **Entender qué hace tu código y por qué**. Si no puedes explicar cada línea de lo que la IA generó, no lo uses.
- **Saber depurar**. La IA puede generar bugs tan fácilmente como genera código correcto. Si no sabes depurar, no podrás distinguir uno del otro.
- **Pensar antes de escribir**. El mejor código no es el que se escribe más rápido, sino el que resuelve el problema correctamente.
- **Leer código ajeno**. Gran parte de nuestro trabajo es mantener y entender código existente. La IA no va a hacer eso por ti.

## Cómo uso yo la IA ahora

No he dejado de usar herramientas de IA. Pero he cambiado radicalmente cómo las uso:

1. **Primero pienso la solución** — Antes de escribir nada, analizo el problema, diseño mentalmente la estructura y decido el enfoque.
2. **Escribo el código yo mismo** — Al menos la primera versión. Si me atasco, consulto documentación antes de recurrir a la IA.
3. **Uso la IA para revisar** — Le pido que revise mi código, que sugiera mejoras o que me explique alternativas. Es un excelente *code reviewer*.
4. **Pregunto "por qué"** — Si la IA sugiere algo que no entiendo, investigo hasta comprenderlo. No acepto código a ciegas.
5. **Automatizo lo tedioso** — Tests unitarios, boilerplate, documentación... Ahí la IA brilla. Pero la lógica de negocio la escribo yo.

## El futuro es prometedor

No soy pesimista. Creo que la IA es la herramienta más poderosa que hemos tenido como desarrolladores. Pero como toda herramienta poderosa, mal usada puede ser perjudicial.

Los juniors que aprendan a usar la IA como complemento — y no como sustituto de su cerebro — van a tener una ventaja competitiva brutal. Serán más rápidos, sí, pero también más sólidos técnicamente.

Los que la usen como muleta... se van a quedar atrás. No porque la IA les quite el trabajo, sino porque nunca desarrollaron las habilidades que la IA no puede darte: pensamiento crítico, capacidad de abstracción y resolución de problemas.

## Conclusión

La IA no va a quitarle el trabajo a los programadores junior.

Pero sí va a dejar atrás a quienes nunca aprendieron a pensar por sí mismos.

Porque cuando sabes lo que haces, la IA no te reemplaza.

**Te potencia.**`;

const post6_en = `Looking back, around 2022, we witnessed the historic *boom* of Artificial Intelligence. ChatGPT revolutionized the industry overnight, and with it came dozens of tools that promised to change forever how we write code.

Today I want to talk about **how it's really affecting junior developers**, from my personal experience as one of them.

## The productivity mirage

Like many other juniors, at the beginning I used tools like Cursor and even my company's enterprise Copilot. The initial feeling is amazing: you write a comment and the AI generates the code for you. What used to take an hour now takes minutes.

But that's exactly the problem. That speed is a mirage.

When I started relying too much on these tools, I noticed something concerning: I was accepting code I didn't fully understand. It worked, yes, but did I know why? Not always. Could I modify it if something changed? Sometimes not.

## The dependency trap

I've seen colleagues who have barely been programming for a year and can no longer write a function without asking the AI. It's not that they can't code — it's that they never developed the muscle of thinking through the problem before writing the solution.

It's like always using GPS to go to your neighborhood supermarket. If one day you have no signal, you're lost. Literally.

AI dependency creates a false sense of competence. You produce a lot, but understand little. And when a complex bug, an ambiguous requirement, or an architecture decision comes along, you draw a blank.

## What really matters

After months of using and evaluating these tools, I've reached a conclusion: **fundamentals are non-negotiable**.

I'm not talking about memorizing sorting algorithms or knowing design patterns by heart. I'm talking about:

- **Understanding what your code does and why**. If you can't explain every line the AI generated, don't use it.
- **Knowing how to debug**. AI can generate bugs just as easily as it generates correct code. If you can't debug, you can't tell one from the other.
- **Thinking before writing**. The best code isn't the one written fastest, but the one that correctly solves the problem.
- **Reading other people's code**. A large part of our job is maintaining and understanding existing code. AI won't do that for you.

## How I use AI now

I haven't stopped using AI tools. But I've radically changed how I use them:

1. **I think about the solution first** — Before writing anything, I analyze the problem, mentally design the structure, and decide on the approach.
2. **I write the code myself** — At least the first version. If I get stuck, I check documentation before turning to AI.
3. **I use AI to review** — I ask it to review my code, suggest improvements, or explain alternatives. It's an excellent code reviewer.
4. **I ask "why"** — If the AI suggests something I don't understand, I research until I do. I don't accept code blindly.
5. **I automate the tedious stuff** — Unit tests, boilerplate, documentation... That's where AI shines. But business logic? I write that myself.

## The future is promising

I'm not pessimistic. I believe AI is the most powerful tool we've ever had as developers. But like any powerful tool, used poorly it can be harmful.

Juniors who learn to use AI as a complement — and not a substitute for their brain — will have a brutal competitive advantage. They'll be faster, yes, but also more technically solid.

Those who use it as a crutch... they'll fall behind. Not because AI will take their jobs, but because they never developed the skills AI can't give you: critical thinking, abstraction, and problem-solving.

## Conclusion

AI won't take away jobs from junior programmers.

But it will leave behind those who never learned to think for themselves.

Because when you know what you're doing, AI doesn't replace you.

**It empowers you.**`;

run(`INSERT OR IGNORE INTO posts (id, category_id, title_es, title_en, slug, excerpt_es, excerpt_en, content_es, content_en, featured_image, author, views, published, featured, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [3, 6,
  'Nueva integración del blog en thisisrober.es',
  'New blog integration on thisisrober.es',
  'nueva-integracin-del-blog-en-thisisroberes',
  'El blog ahora está completamente integrado en la web de thisisrober. Esto nos abre muchas posibilidades para compartir contenido sobre tecnologia, noticias actuales y cosas interesantes.',
  'The blog is now fully integrated into the thisisrober website. This opens up many possibilities for sharing content about technology, current news, and interesting things.',
  post3_es, post3_en,
  '691cea563123b_1763502678.png', 'Robert Lita Jeler', 61, 1, 0, '2025-11-18 21:43:28', '2026-02-02 18:54:31', '2025-11-18 21:43:28']
);

run(`INSERT OR IGNORE INTO posts (id, category_id, title_es, title_en, slug, excerpt_es, excerpt_en, content_es, content_en, featured_image, author, views, published, featured, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [5, 1,
  'De aspirante a Cloud Practitioner certificado: te presento mi nueva app',
  'From aspiring Cloud Practitioner to certified: Introducing my new app',
  'de-aspirante-a-cloud-practitioner-certificado-te-presento-mi-nueva-app',
  'En pocos días me presento al examen AWS CLF-C02 para certificarme como Cloud Practitioner. Tras 4 meses de preparación, he experimentado de primera mano las carencias de AWS Academy.',
  'In a few days, I\'m taking the AWS CLF-C02 exam to become a Cloud Practitioner. After four months of preparation, I\'ve experienced firsthand the shortcomings of AWS Academy.',
  post5_es, post5_en,
  '6963e17549331_1768153461.png', 'Robert Lita Jeler', 1032, 1, 1, '2026-01-11 17:44:21', '2026-02-06 16:22:17', '2026-01-11 17:44:21']
);

run(`INSERT OR IGNORE INTO posts (id, category_id, title_es, title_en, slug, excerpt_es, excerpt_en, content_es, content_en, featured_image, author, views, published, featured, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [6, 7,
  'Cómo la IA está afectando a los programadores junior',
  'How AI is affecting junior programmers',
  'cmo-la-ia-est-afectando-a-los-programadores-junior',
  'La IA no va a quitarle el trabajo a los programadores junior. Pero sí va a dejar atrás a quienes nunca aprendieron a pensar por sí mismos.',
  'AI won\'t take away jobs from junior programmers. But it will leave behind those who never learned to think for themselves.',
  post6_es, post6_en,
  '697fcb077dc83_1769982727.png', 'Robert Lita Jeler', 216, 1, 1, '2026-02-01 21:52:07', '2026-02-06 15:26:24', '2026-02-01 21:52:07']
);

// --- Subscribers (merge blog_subscribers + newsletter usuarios) ---
const subs = [
  ['robert.lita.jeler@outlook.es', 'robert.lita.jeler@outlook.es', '2025-11-18 16:05:33', 1, 'blog'],
  ['joseferney-1994@hotmail.com', 'joseferney-1994@hotmail.com', '2026-01-28 21:38:29', 1, 'blog'],
  ['Robert', 'thisisrober@icloud.com', '2025-01-01 00:00:00', 1, 'legacy_newsletter'],
  ['Andrea Stefania', 'andreeastefaniaoprea@gmail.com', '2025-01-01 00:00:00', 1, 'legacy_newsletter'],
  ['Raúl', 'luar.raul.gijon@gmail.com', '2025-01-01 00:00:00', 1, 'legacy_newsletter'],
  ['tupapidominante', 'jokxab44@gmail.com', '2025-01-01 00:00:00', 1, 'legacy_newsletter'],
];
subs.forEach(s => run(`INSERT OR IGNORE INTO subscribers (name, email, subscribed_at, active, source) VALUES (?, ?, ?, ?, ?)`, s));

// --- Work Experience (unified bilingual) ---
const works = [
  [1, 'Encargado de Tienda', 'Store Manager', 'FOCUStel S.L.', 'FOCUStel S. L.', 'Responsable del puesto de venta de accesorios para móviles en tienda física.', 'Responsible for managing a mobile accessories store.', '2023-11-01', '2024-01-31'],
  [2, 'Becario en Servicios de TI, AI & Data Análisis', 'IT Services, AI & Data Analysis Intern', 'Siemens', 'Siemens', 'Desarrollo de automatizaciones con Power Automate y Excel (VBA), diseño de flujos inteligentes con Outlook, Sharepoint y AI Builder, optimización de procesos y estructura documental en entornos M365.', 'Developing automations with Power Automate and Excel (VBA), designing smart workflows with Outlook, Sharepoint, and AI Builder, and optimizing processes and document structure in M365 environments.', '2025-03-31', '2025-06-16'],
  [3, 'Becario en Data & AI', 'Data & AI intern', 'BASF Digital Solutions, S. L.', 'BASF Digital Solutions, S. L.', 'Desarrollo de aplicaciones web internas. Enfocado en crear soluciones que optimicen procesos y gestión de datos.\nFormándome simultáneamente en análisis de datos (BigData+ - Cámara de Comercio Alemana en España) para integrar desarrollo y analítica.', 'Internal web application development. Focused on creating solutions that optimize processes and data management.\nConcurrently training in data analysis (Big Data+ - German Chamber of Commerce in Spain) to integrate development and analytics.', '2025-09-08', '2026-05-26'],
];
works.forEach(w => run(`INSERT OR IGNORE INTO work_experience (id, position_es, position_en, company_es, company_en, description_es, description_en, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, w));

// --- Certifications (unified bilingual) ---
const certs = [
  [1, 'CCNA: Introducción a Redes', 'CCNA: Introduction to Networks', 'Cisco', 'Cisco', '2024-07-01', 'https://lnkd.in/dd9VxcSD'],
  [2, 'Introducción a Ciberseguridad', 'Introduction to Cybersecurity', 'Cisco', 'Cisco', '2024-03-01', 'https://lnkd.in/dWjE_dFA'],
  [3, 'Network Security', 'Network Security', 'Cisco', 'Cisco', '2025-06-01', 'https://www.credly.com/badges/c340badc-fd78-4700-bf84-7364197422ca'],
  [4, 'Linux Essentials', 'Linux Essentials', 'Cisco', 'Cisco', '2025-06-02', 'https://www.credly.com/badges/92e6779d-4aed-446c-927d-2888337699c3'],
  [5, 'Database Design and Programming with MySQL', 'Database Design and Programming with MySQL', 'Oracle', 'Oracle', '2025-06-03', 'https://www.linkedin.com/in/thisisrober/details/certifications/1749212777539/single-media-viewer/?profileId=ACoAAEloxZMBdClruJFwPwu4MsaSpuqNFJ6RiH4'],
  [6, 'CCNA: Enterprise Networking, Security and Automation', 'CCNA: Enterprise Networking, Security, and Automation', 'Cisco', 'Cisco', '2025-06-05', 'https://www.credly.com/badges/b3b0077f-28de-4b5b-a81f-2b3091d3394f'],
  [7, 'AZ-900 Course', 'AZ-900 Course', 'OpenWebinars', 'OpenWebinars', '2025-06-07', 'https://openwebinars.net/cert/Vpu1'],
];
certs.forEach(c => run(`INSERT OR IGNORE INTO certifications (id, title_es, title_en, provider_es, provider_en, issue_date, credential_url) VALUES (?, ?, ?, ?, ?, ?, ?)`, c));

// --- Projects (unified bilingual) ---
const projects = [
  [1, 'a', 'bingo!: red social', 'bingo!: social media app', 'Esta es mi primera red social creada con tecnologías básicas y Frameworks avanzados.', 'This is my first social media made with basic languages & advanced Frameworks. Deep into it!', '/img/bingo-banner.png', 'https://github.com/thisisrober/Bingo-TFG/', '/projects/bingo', 'PHP,MySQL,Bootstrap,jQuery', '', 1, 0, '2025-03-13 12:43:03'],
  [2, 's+', 'AWS CLF-02: Aplicación de preparación para el examen', 'AWS CLF-02: Exam prep application', 'Simulador interactivo para practicar el examen AWS Cloud Practitioner. Incluye pruebas específicas del dominio, un simulacro de examen de 90 minutos, retroalimentación inmediata, análisis de rendimiento y un mapa conceptual.', 'Interactive simulator for practicing the AWS Cloud Practitioner exam. Includes domain-specific tests, a full 90-minute mock exam, immediate feedback, performance analysis, and a concept map.', '/img/aws-certified.png', 'https://github.com/thisisrober/aws-cloud-practitioner-exam-prep-app', 'https://thisisrober.es/projects/aws-cloud-practitioner-exam-prep-app/', 'React,Vite,JavaScript', '', 0, 0, '2026-01-11 18:16:18'],
  [3, 's+', 'Loop Music Station', 'Loop Music Station', 'Una aplicación web de música creada para artistas y oyentes. ¡Colaboraciones abiertas!', 'A discontinued music web-app created for artists and listeners. Collaboration is available!', '/img/loop.png', 'https://github.com/thisisrober/loopmusicstation', 'https://loopmusicstation.es/', 'React,Node.js,MongoDB', '', 0, 0, '2025-10-05 12:43:03'],
];
projects.forEach(p => run(`INSERT OR IGNORE INTO projects (id, tier, name_es, name_en, description_es, description_en, preview_image, github_link, live_link, technologies, badge, is_new, not_available, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, p));

console.log('✅ Database initialized and seeded successfully!');
console.log('   Tables: admins, categories, posts, subscribers, work_experience, certifications, projects');
process.exit(0);
