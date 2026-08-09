export type LabSlug = "doodle" | "sentiment" | "kmeans";
export type LabAccent = "electric" | "teal" | "coral";

export type LabExp = {
  slug: LabSlug;
  num: string;
  title: string;
  accent: LabAccent;
  tag: string;
  blurb: string;
  /** the "✎ how it actually works" aside — describes the real model, not a stand-in */
  foot: string;
};

export const LAB_EXPS: LabExp[] = [
  {
    slug: "doodle",
    num: "exp-001",
    title: "Doodle Classifier",
    accent: "electric",
    tag: "CNN · QuickDraw",
    blurb:
      "Sketch a shape. The recognizer scores it against what it knows and shows its top guesses.",
    foot:
      "This is the real trained model: a convolutional neural net that learned from millions of Google QuickDraw sketches, downloaded once and run entirely in your browser with TensorFlow.js. It only knows its 50 classes (The Eiffel Tower through bulldozer), so anything else gets mapped to the nearest thing it has seen.",
  },
  {
    slug: "sentiment",
    num: "exp-002",
    title: "Sentiment Analysis",
    accent: "teal",
    tag: "LSTM · IMDB",
    blurb:
      "Type a sentence. The model reads the mood, word by word, and swings the needle.",
    foot:
      "A real LSTM trained on IMDB movie reviews runs locally in TensorFlow.js. The needle and verdict come from the network. The word highlights are a simple lexicon overlay, because an LSTM won't tell you which words moved it. Expect a movie-review accent to its taste.",
  },
  {
    slug: "kmeans",
    num: "exp-003",
    title: "Cluster & Classify",
    accent: "coral",
    tag: "clustering · perceptron",
    blurb:
      "Two toy learners share one grid. Group unlabelled points with K-Means, or label them and watch a perceptron find the dividing line.",
    foot:
      "Both algorithms are the real thing, running live in the page. K-Means: assign each point to the nearest centroid, move each centroid to the mean of its members, repeat until nothing moves. Classifier: a single-layer perceptron nudges its weights point by point (lr 0.13) until the line separates the two colours or reaches its limit.",
  },
];

export function getLabExp(slug: string): LabExp | undefined {
  return LAB_EXPS.find((e) => e.slug === slug);
}
