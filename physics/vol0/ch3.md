---
layout: chapter
title: "How Physicists Reason — Hypotheses, Evidence, and Uncertainty"
volume: "Volume 0: Learning Like a Physicist"
chapter_number: 3
permalink: /physics/vol0/ch3/
prev_url: /physics/vol0/ch2/
next_url: /physics/vol0/ch4/
---

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:
- Distinguish between a hypothesis, a theory, and a law in the physicist's sense
- Quantify uncertainty and propagate it through calculations
- Recognize the structure of a valid physical argument: premises → deduction → prediction → test
- Identify common logical fallacies that corrupt scientific reasoning
- Use order-of-magnitude reasoning to decide whether an effect is worth including
- Understand the difference between precision and accuracy, and between systematic and random error

---

## 📜 Historical Background

In 1919, Arthur Eddington sailed to Príncipe island off the coast of Africa to photograph a total solar eclipse. He was not there to admire the spectacle. He was there to test a prediction made by Albert Einstein's general theory of relativity: that starlight passing near the Sun would bend by approximately 1.75 arcseconds — twice the amount predicted by Newtonian gravity.

Eddington's measurement was difficult. The weather was poor. The photographic plates were imperfect. The deflection he measured was close to Einstein's prediction, but the uncertainty was large enough that historians still debate whether the data truly supported relativity or whether Eddington, already convinced of Einstein's theory, interpreted ambiguous results favorably.

This episode encapsulates a tension as old as science itself: the human mind wants to confirm its beliefs. The scientific method is the discipline of resisting that urge.

The formal structure of hypothesis testing emerged much earlier. Francis Bacon, in the early 1600s, advocated for systematic experimentation and inductive reasoning. But it was Isaac Newton, in his *Principia* (1687), who demonstrated the power of the hypothetico-deductive method: propose a general principle, derive a specific prediction, and compare it to observation. If the prediction fails, the principle is wrong — or at least incomplete.

In the nineteenth century, the development of probability theory by Laplace, Gauss, and later Pearson and Fisher gave physicists the tools to quantify uncertainty rather than merely acknowledge it. The modern error bar — that small vertical line on every data point — is the visual signature of this revolution.

---

## 1. Intuition

Imagine you are a physician in 1854 London. A cholera outbreak is killing hundreds in Soho. The prevailing theory — the "miasma" model — says bad air causes disease. But John Snow, a physician and anesthetist, noticed something: almost every victim drank water from the Broad Street pump. He removed the pump handle. The outbreak stopped.

Snow did not prove germ theory (that came later, from Koch and Pasteur). What he did was construct a **crucial experiment**: a test that could distinguish between two competing explanations. If miasma were correct, the air in Soho should have caused disease regardless of water source. The clustering around the pump contradicted the miasma hypothesis and supported an alternative — contaminated water — even before the mechanism was understood.

This is how physicists reason. They do not merely collect facts. They construct competing models, derive contradictory predictions, and design observations that force nature to choose. The logic is not "believe the most elegant theory." It is "let the experiment decide."

---

## 2. Mathematical Formalism

### The Structure of a Physical Argument

A valid physical argument has the same logical skeleton as a Euclidean proof:

1. **Premises** (axioms, established laws, measured parameters)
2. **Deduction** (mathematical derivation)
3. **Prediction** (a quantitative, testable statement about observable quantities)
4. **Test** (experiment or observation)

If the test contradicts the prediction, at least one premise is wrong. The deduction may contain an error. Or the test itself may be flawed. The physicist's job is to determine which.

### Uncertainty and Error Propagation

Every measurement carries uncertainty. If we measure a length $x = (10.0 \\pm 0.2)\\,\\text{cm}$, the $\\pm 0.2$ is not a mistake — it is an honest statement of our ignorance.

For a function $f(x, y)$ where $x$ and $y$ have uncertainties $\\sigma_x$ and $\\sigma_y$, the **standard error propagation formula** (for uncorrelated variables) is:

$$ \\sigma_f^2 = \\left( \\frac{\\partial f}{\\partial x} \\right)^2 \\sigma_x^2 + \\left( \\frac{\\partial f}{\\partial y} \\right)^2 \\sigma_y^2 $$

This is derived from a first-order Taylor expansion of $f$ about the measured values. It tells us how uncertainties in input quantities "flow through" a calculation to produce uncertainty in the result.

**Example:** The period of a pendulum $T = 2\\pi\\sqrt{\\ell/g}$. If we measure $\\ell = 1.00 \\pm 0.01\\,\\text{m}$ and know $g = 9.81 \\pm 0.01\\,\\text{m/s}^2$, then:

$$ \\frac{\\sigma_T}{T} = \\frac{1}{2} \\sqrt{ \\left( \\frac{\\sigma_\\ell}{\\ell} \\right)^2 + \\left( \\frac{\\sigma_g}{g} \\right)^2 } $$

The factor of $1/2$ appears because $T \\propto \\ell^{1/2}$. This is a general rule: if $f \\propto x^n$, then the relative uncertainty in $f$ is $|n|$ times the relative uncertainty in $x$.

### Systematic vs. Random Error

| Type | Source | Behavior | Reduction |
|------|--------|----------|-----------|
| **Random** | Statistical fluctuations, finite counting | Scatters data symmetrically around true value | Take more data, average |
| **Systematic** | Miscalibrated instrument, flawed model | Shifts all data in one direction | Identify and correct the source |

Random errors shrink as $1/\\sqrt{N}$ with $N$ measurements. Systematic errors do not. This is why physicists obsess over calibration.

### Precision vs. Accuracy

- **Precision**: How reproducible is the measurement? (Small random error)
- **Accuracy**: How close is the measurement to the true value? (Small systematic error)

A broken clock is accurate twice a day but never precise. A clock that runs fast by exactly one minute per hour is precise but never accurate. A good clock is both.

---

## 3. Derivations: The Logic of Significant Figures

Significant figures are not arbitrary rules from high school chemistry. They are a heuristic for tracking uncertainty propagation without formal calculus.

**Rule of thumb:** When multiplying or dividing, the result carries the same number of significant figures as the least precise input. When adding or subtracting, the result is limited by the term with the fewest decimal places.

This follows from the error propagation formula. Consider $z = x \\cdot y$ with $x = 2.0$ (2 sig figs, $\\sigma_x \\approx 0.05$) and $y = 3.14$ (3 sig figs, $\\sigma_y \\approx 0.005$):

$$ \\frac{\\sigma_z}{z} = \\sqrt{ \\left( \\frac{0.05}{2.0} \\right)^2 + \\left( \\frac{0.005}{3.14} \\right)^2 } \\approx \\sqrt{0.000625 + 0.0000025} \\approx 0.025 $$

So $\\sigma_z / z \\approx 2.5\\%$, meaning $z$ is known to about 2 significant figures — matching the less precise input, $x$.

The significant figure rules are a quick-and-dirty version of full error propagation. They fail when operations are correlated or when uncertainties are highly asymmetric, but for most back-of-the-envelope physics, they are indispensable.

---

## 4. Experiments

### The Eddington Eclipse (1919)

Eddington's expedition is a masterclass in how messy real science is. Two teams were sent: one to Príncipe, one to Sobral, Brazil. The Sobral plates were clearer, but one instrument was misaligned. The Príncipe plates were fogged by clouds. Eddington discarded some Sobral data as unreliable and weighted the Príncipe results heavily.

The final measured deflection was $1.61 \\pm 0.30$ arcseconds at Sobral and $1.98 \\pm 0.30$ arcseconds at Príncipe. Einstein predicted $1.75$. The agreement was good but not overwhelming. Yet the result made global headlines and turned Einstein into a household name.

Why? Because Newtonian gravity predicted $0.87$ arcseconds (half the Einstein value). The data decisively ruled out Newton's theory for this effect, even if the precision was modest. This illustrates a crucial point: **you do not need infinite precision to falsify a theory.** You only need a prediction that lies outside your uncertainty bounds.

### The Michelson-Morley Null Result (1887)

Michelson and Morley set out to detect the "luminiferous aether" — the medium through which light was thought to propagate. Their interferometer was sensitive enough to measure differences in the speed of light as small as $10^{-8}$. They found nothing. The speed of light was the same in every direction.

This was not a failure. It was a **null result** — an experiment that rules out a hypothesis by finding no effect where one was expected. Null results are as scientifically valuable as positive discoveries. Michelson-Morley did not detect the aether; therefore, the aether model was wrong. This opened the door for Einstein's special relativity in 1905.

---

## 🧠 Think Like a Physicist

- **Falsification, not verification:** No amount of confirming evidence proves a theory true. One contradictory experiment can prove it false. This asymmetry, emphasized by Karl Popper, is the logical foundation of physics.
- **The null hypothesis:** When testing a new effect, always ask: "What would I expect to see if my hypothesis is *wrong*?" Design your experiment to distinguish between these two outcomes.
- **Bayesian updating:** As evidence accumulates, your confidence in a theory should shift gradually, not jump from "unproven" to "proven." A single experiment nudges your belief; a thousand experiments settle it.
- **When Eddington was asked what he would have said if his data had disagreed with Einstein, he replied: "I would have trusted the data. But I would have suspected the experiment first."** This is honest scientific reasoning: the theory is not sacred, but neither is a single measurement.

---

## 🩺 Medicine Connection

Clinical trials are the medical equivalent of a physics experiment. The **randomized controlled trial (RCT)** is designed to isolate a single variable (e.g., a drug) while controlling for confounders (age, diet, genetics) through randomization and blinding.

The **p-value**, widely used in medical statistics, is a measure of how surprising the data would be if the null hypothesis (no effect) were true. A p-value of 0.05 means: "If this drug actually does nothing, there is a 5% chance I would see results this extreme by random luck." It does *not* mean there is a 95% chance the drug works. This misinterpretation — the **p-value fallacy** — has led to the replication crisis in both medicine and psychology.

In **diagnostic imaging**, radiologists must distinguish true signals from noise. A CT scan produces thousands of pixels; some will appear abnormal purely by statistical fluctuation. The radiologist's training is, in part, learning the Bayesian prior: given the patient's symptoms, how likely is this bright spot to be a tumor rather than an artifact?

---

## 💡 Interesting Facts

- The **most precise measurement in physics** is the electron's anomalous magnetic moment, known to 12 decimal places. The theoretical prediction (from QED) and the experimental value agree to within one part in a trillion — the most stringent test of any physical theory in history.
- In 2011, the OPERA experiment reported neutrinos traveling faster than light. The physics community did not celebrate a revolution; they scrutinized the experiment. The culprit was a loose fiber-optic cable. The result was retracted. This is how physics self-corrects.
- **Publication bias**: Positive results are more likely to be published than null results. This creates a distorted picture of reality — medicine and psychology have been particularly damaged by this. Physics has largely avoided it because theory and experiment are tightly coupled, and major null results (like Michelson-Morley) are too important to ignore.

---

## ⚠️ Common Misconceptions

**Misconception:** "A scientific theory is just a guess."

**Why it seems plausible:** In everyday language, "theory" means speculation.

**Correction:** In physics, a theory is a well-tested explanatory framework that has survived repeated experimental scrutiny. The germ theory of disease, the theory of evolution, and the theory of general relativity are among the most secure structures of knowledge humanity possesses. A "guess" is a hypothesis. A theory is what a hypothesis becomes after decades of successful predictions.

**Diagnostic question:** If someone says "gravity is just a theory," what is the error? (Answer: They are using the colloquial meaning of "theory" to imply uncertainty, when the scientific meaning implies the opposite — gravity as described by general relativity is one of the most thoroughly tested frameworks in existence.)

---

## 📝 Practice Questions

**Level 1 — Foundational**

1. You measure the sides of a rectangle as $l = 5.0 \\pm 0.1\\,\\text{cm}$ and $w = 3.00 \\pm 0.05\\,\\text{cm}$. Calculate the area $A = l \\times w$ and its uncertainty using error propagation.
2. A student reports a measurement as $12.34567 \\pm 0.2$. What is wrong with this presentation? Rewrite it correctly.

**Level 2 — Intermediate**

3. Explain why taking 100 measurements and averaging them reduces the random error by a factor of 10, but does nothing to reduce systematic error. Give an example of each type in a medical context.
4. The OPERA neutrino anomaly (2011) was eventually traced to a hardware fault. Using the hypothetico-deductive framework, explain why the physics community was right to be skeptical even before the fault was found.

**Level 3 — Advanced**

5. A drug trial reports that a new treatment reduces mortality by 20% with $p = 0.04$. A replication study finds a 5% reduction with $p = 0.30$. A physicist and a physician discuss these results. Construct the physicist's argument for why the original result should be treated with caution, using the concepts of statistical power, effect size, and publication bias.
6. Using dimensional analysis (Chapter 1) and error propagation, estimate the fractional uncertainty in the Schwarzschild radius $R_s = 2GM/c^2$ if $G$ is known to 4 significant figures, $M$ to 3, and $c$ to 9.

**Level 4 — Challenge Problems 🎓**

7. **Design a Crucial Experiment:** In the 18th century, some physicians believed bloodletting cured disease; others thought it was harmful. Using only the concepts from this chapter, design an experiment (as it might have been conducted in 1800) that could have settled the question. What would be your control group? What would you measure? What confounders would you worry about?
8. **The Bayesian Physician:** A screening test for a disease has 99% sensitivity and 99% specificity. The disease prevalence in the population is 0.1%. A patient tests positive. Using Bayes' theorem, calculate the probability that the patient actually has the disease. Then explain, in plain language, why even an excellent test produces mostly false positives when the disease is rare.

---

## 🔍 Chapter Summary

- Physical reasoning follows the **hypothetico-deductive** structure: hypothesis → prediction → test.
- **Uncertainty is quantifiable** and propagates through calculations via the error propagation formula.
- **Systematic errors** shift results in one direction; **random errors** scatter them symmetrically. Only random errors shrink with more data.
- **Precision** (reproducibility) and **accuracy** (closeness to truth) are independent properties.
- **Null results** are scientifically valuable — they rule out hypotheses.
- A **theory** in physics is not a guess; it is a framework that has survived extensive experimental testing.
- The medical application of these ideas appears in clinical trial design, diagnostic testing, and the interpretation of medical imaging.
