export default function StructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Anoopchandra Parampalli",
    "jobTitle": "AI/ML Engineer",
    "description": "AI/ML engineer and full-stack developer specializing in PyTorch, React, FastAPI, and AWS cloud solutions.",
    "url": "https://anoopchandra.dev",
    "image": "https://anoopchandra.dev/anoopchandra.jpg",
    "sameAs": [
      "https://github.com/Anoop-Chandra-19",
      "https://linkedin.com/in/anoopchandra-parampalli"
      // Add other social profiles
    ],
    "knowsAbout": [
      "Machine Learning",
      "Artificial Intelligence", 
      "PyTorch",
      "React",
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