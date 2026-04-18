const tips = [
  {
    title: "Before donation",
    items: [
      "Drink water in the hours before donating.",
      "Eat a balanced meal and avoid greasy food.",
      "Sleep well the night before your appointment."
    ]
  },
  {
    title: "After donation",
    items: [
      "Rest for a short while before leaving.",
      "Drink extra fluids through the day.",
      "Avoid strenuous activity for the next 24 hours."
    ]
  }
];

export default function TipsPage() {
  return (
    <section className="page-shell container">
      <div className="section-heading compact">
        <p className="eyebrow">Awareness</p>
        <h1>Simple blood donation guidance.</h1>
      </div>
      <div className="card-grid two-up">
        {tips.map((tip) => (
          <article className="info-card" key={tip.title}>
            <h3>{tip.title}</h3>
            <ul className="tip-list">
              {tip.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
