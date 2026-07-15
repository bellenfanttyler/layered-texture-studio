import { copy } from "../config/copy";

export function WorkflowSteps() {
  return (
    <section className="workflow-steps" aria-label="Workflow overview">
      {copy.steps.map((step) => (
        <article key={step.number}>
          <span>{step.number}</span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
