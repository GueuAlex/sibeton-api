import Head from 'next/head';

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Welcome to My Next.js Project</title>
        <meta name="description" content="A starter project for building APIs with Next.js, TypeScript, Prisma, and Vercel Storage." />
      </Head>
      <main style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>🚀 Welcome to Your Next.js API Project!</h1>
          <p style={styles.subtitle}>
            This project is configured with <strong>Next.js</strong>, <strong>TypeScript</strong>, <strong>Prisma</strong>, and <strong>Vercel Storage</strong>.
          </p>
          <p style={styles.text}>
            Start building your APIs in <code>src/pages/api</code>. Use Prisma for database interactions and Vercel for deployment.
          </p>
          <a href="https://nextjs.org/docs" style={styles.link} target="_blank" rel="noopener noreferrer">
            Learn more about Next.js →
          </a>
        </div>
      </main>
    </>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px',
  },
  content: {
    textAlign: 'center' as const,
    maxWidth: '600px',
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '2rem',
    color: '#333333',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#555555',
    marginBottom: '10px',
  },
  text: {
    fontSize: '1rem',
    color: '#666666',
    marginBottom: '20px',
  },
  link: {
    display: 'inline-block',
    fontSize: '1rem',
    color: '#0070f3',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default HomePage;
