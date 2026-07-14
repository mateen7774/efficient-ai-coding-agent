import { useState } from "react";
import Header from "./Header";
import RepositoryUpload from "./RepositoryUpload";
import FeatureCard from "./FeatureCard";

function Home() {
  const [repository, setRepository] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setRepository(selectedFile);
    }
  };

  const handleRemove = () => {
    setRepository(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Header />

        <RepositoryUpload
          repository={repository}
          onFileChange={handleFileChange}
          onRemove={handleRemove}
        />

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon="🔍"
            title="Bug Detection"
            description="Identify common programming errors in source code."
          />

          <FeatureCard
            icon="🛠️"
            title="Code Repair"
            description="Generate intelligent code repair suggestions."
          />

          <FeatureCard
            icon="📊"
            title="Evaluation"
            description="Measure repair accuracy, time and token usage."
          />
        </section>
      </div>
    </main>
  );
}

export default Home;