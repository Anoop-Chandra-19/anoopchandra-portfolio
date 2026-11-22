export default function StructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Anoopchandra Parampalli",
    "alternateName": "Anoop Parampalli",
    "jobTitle": "Applied AI Engineer",
    "worksFor": {
      "@type": "Organization",
      "name": "Panacea Financial"
    },
    "description": "Applied AI engineer at Panacea Financial, building LLM assistants with RAG and MCP tool calls, and the full-stack apps around them in React, React Native, NestJS, and Python.",
    "url": "https://anoopchandra.dev",
    "image": "https://anoopchandra.dev/anoopchandra.webp",
    "sameAs": [
      "https://github.com/Anoop-Chandra-19",
      "https://linkedin.com/in/anoopchandra-parampalli"
    ],
    "knowsAbout": [
      "Machine Learning",
      "Artificial Intelligence",
      "LLMs",
      "RAG",
      "Azure AI Foundry",
      "PyTorch",
      "TypeScript",
      "React",
      "React Native",
      "NestJS",
      "FastAPI",
      "AWS",
      "Full Stack Development"
    ]
  };

  const portfolioSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Anoopchandra Parampalli Portfolio",
    "description": "Portfolio showcasing AI/ML projects and full-stack development work",
    "url": "https://anoopchandra.dev",
    "author": {
      "@type": "Person",
      "name": "Anoopchandra Parampalli"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(portfolioSchema)
        }}
      />
    </>
  );
}