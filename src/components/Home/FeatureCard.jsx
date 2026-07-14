function FeatureCard({ icon, title, description }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-3 text-2xl">{icon}</div>

      <h3 className="font-semibold text-white">{title}</h3>

      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </article>
  );
}

export default FeatureCard;