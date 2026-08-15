---
layout: chapter
title: "Graphs, Proportionality, and Functional Thinking"
volume: 0
volume_title: "Volume 0: Learning Like a Physicist"
chapter_number: 5
permalink: /read/physics/vol0/ch5/
prev_chapter: /read/physics/vol0/ch4/
prev_chapter_title: "Fermi Problems — Chained Estimation and Bounding the Unknown"
next_chapter: /read/physics/vol0/ch6/
next_chapter_title: "Synthesis — The Complete Problem-Solving Toolkit"
---

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:
- Extract physical meaning from the slope and intercept of a linear graph
- Determine functional relationships from log–log plots
- Use proportionality reasoning to predict behavior without full calculation
- Recognize when a non-linear relationship can be "straightened" by a change of variables
- Construct graphs that reveal hidden structure in data
- Distinguish between direct proportion, inverse proportion, and power-law relationships

---

## 📜 Historical Background

In 1619, Johannes Kepler published his third law of planetary motion: the square of a planet's orbital period is proportional to the cube of its semi-major axis. He did not derive this from first principles — Newton did that sixty years later. Kepler found it by plotting. He took Tycho Brahe's meticulously compiled observational data, calculated ratios, and noticed a pattern. The graph — or rather, the table of calculated values — revealed what pure thought could not.

This was not an isolated event. In 1785, Charles-Augustin de Coulomb measured the force between charged spheres and plotted force versus distance. The resulting curve suggested an inverse-square law. In 1798, Henry Cavendish measured the gravitational constant using a torsion balance and plotted his results to extract the tiny force between masses. The graph was the bridge between raw measurement and physical law.

The twentieth century brought log–log paper. When a physicist suspects a power law $y = kx^n$ but does not know $n$, plotting $\log y$ versus $\log x$ produces a straight line whose slope is $n$. This technique — curve straightening — turned complex non-linear relationships into simple linear ones, making them tractable.

The lesson: a graph is not a decoration for a report. It is a tool of discovery.

---

## 1. Intuition

Suppose you drop a ball and measure its position at successive times. You could stare at the numbers:

| $t$ (s) | 0 | 0.1 | 0.2 | 0.3 | 0.4 |
|---------|---|-----|-----|-----|-----|
| $y$ (m) | 0 | 0.05 | 0.20 | 0.45 | 0.80 |

The pattern is not obvious. But plot $y$ versus $t$ and the curve is unmistakably parabolic. Plot $y$ versus $t^2$ and the points fall on a straight line through the origin. The straight line tells you $y \propto t^2$ — the signature of constant acceleration.

This is the physicist's use of graphs: not to display what you already know, but to discover what you do not.

---

## 2. Mathematical Formalism

### The Linear Graph

A straight line has the form:

$$ y = mx + c $$

- **Slope** $m = \Delta y / \Delta x$: the rate of change of $y$ with respect to $x$
- **Intercept** $c$: the value of $y$ when $x = 0$

In physics, slope and intercept almost always carry physical meaning:

| Relationship | Graph | Slope means | Intercept means |
|-------------|-------|-------------|-----------------|
| $v = u + at$ | $v$ vs $t$ | acceleration $a$ | initial velocity $u$ |
| $F = kx$ (Hooke) | $F$ vs $x$ | spring constant $k$ | zero (if ideal) |
| $PV = nRT$ | $P$ vs $1/V$ | $nRT$ | zero |

### Power Laws and Log–Log Plots

If $y = kx^n$, taking logarithms:

$$ \log y = \log k + n \log x $$

This is a straight line on a log–log plot:
- **Slope** = $n$ (the power)
- **Intercept** = $\log k$ (the constant)

### Proportionality Chains

If $a \propto b$ and $b \propto c$, then $a \propto c$. More generally:

$$ a \propto b^m c^n \quad \Rightarrow \quad rac{a_1}{a_2} = \left( rac{b_1}{b_2} 
ight)^m \left( rac{c_1}{c_2} 
ight)^n $$

This allows prediction without knowing the proportionality constant.

---

## 3. Derivations: Curve Straightening

### Example: The Pendulum Period

The period $T$ of a simple pendulum depends on length $\ell$ and gravity $g$. We suspect $T \propto \ell^a g^b$. From dimensional analysis (Chapter 1), $a = 1/2$ and $b = -1/2$.

To verify experimentally:
1. Measure $T$ for various $\ell$ at fixed $g$.
2. Plot $T$ vs $\ell$ — curve.
3. Plot $T$ vs $\sqrt{\ell}$ — straight line through origin. ✓
4. Measure slope: $T/\sqrt{\ell} pprox 2.0$ s/m$^{1/2}$.
5. Predict $g = 4\pi^2 / (	ext{slope})^2 pprox 9.9$ m/s$^2$.

The graph turned an unknown power law into a measurable slope.

---

## 4. Experiments

### Galileo's Inclined Plane Revisited

Galileo measured distance versus time for a rolling ball. He did not have graph paper. But he did have ratios. By showing that $d_1 : d_2 : d_3 : \ldots = 1 : 4 : 9 : \ldots$ for equal time intervals, he proved $d \propto t^2$ without plotting a single point. This was ratio analysis — the algebraic cousin of graphing.

### Millikan's Oil Drop (1909)

Millikan measured the charge on individual oil drops by balancing electric and gravitational forces. He plotted charge versus drop number and noticed that all charges clustered around integer multiples of a fundamental unit. The graph revealed quantization — the discrete nature of electric charge — before quantum mechanics explained it.

---

## 🧠 Think Like a Physicist

- **Always ask: "What would make this straight?"** If your data curves, you have the wrong variables on your axes. Try $y$ vs $x^2$, $\log y$ vs $\log x$, $1/y$ vs $x$, etc.
- **The slope is more reliable than a single point.** A single measurement can be an outlier. A slope uses all the data.
- **Extrapolation is dangerous; interpolation is safe.** Never extend a line beyond your data without a theoretical justification.
- **Feynman's graph habit:** Richard Feynman would sketch graphs before writing equations. If he could not draw the expected shape of a function, he did not understand the physics.

---

## 🩺 Medicine Connection

In **pharmacokinetics**, drug concentration $C(t)$ in blood is plotted versus time. The shape of the curve reveals:
- **Exponential decay** → first-order elimination
- **Linear decline** → zero-order elimination (saturation)
- **Multi-exponential** → multi-compartment model (drug distributes between blood and tissue)

Clinicians use these graphs to determine dosing intervals. A straight line on a semi-log plot ($\log C$ vs $t$) confirms first-order kinetics and gives the elimination rate constant from the slope.

In **epidemiology**, plotting $\log$(cases) versus time reveals whether an outbreak is exponential (straight line) or being controlled (curving downward). The slope is the growth rate; flattening the curve means reducing the slope.

---

## 💡 Interesting Facts

- Kepler discovered his third law by plotting ratios — the first example of data-driven discovery in physics.
- Log–log plots can reveal scaling laws in biology: metabolic rate scales as $M^{3/4}$ (Kleiber's law), and the relationship holds across 18 orders of magnitude in mass, from mitochondria to whales.
- The **Hertzsprung–Russell diagram** (luminosity vs temperature for stars) is arguably the most important graph in astrophysics. It revealed that stars are not scattered randomly but follow distinct evolutionary tracks.

---

## ⚠️ Common Misconceptions

**Misconception:** "A straight line on a graph proves a linear relationship."

**Why it seems plausible:** Straight lines look simple and convincing.

**Correction:** A straight line over a limited range can hide complexity. $y = x^3$ looks linear near $x = 0$. $y = \sin x$ looks linear for $x \ll 1$. Always check the theoretical prediction and the range of validity.

**Diagnostic question:** If you plot $y$ vs $x$ and get a straight line, does that mean $y = kx$? (Answer: Only if the line passes through the origin. If it has a non-zero intercept, the relationship is $y = kx + c$, which is affine, not proportional.)

---

## 📝 Practice Questions

**Level 1 — Foundational**

1. The following data shows the extension of a spring under load:

| Load (N) | 0 | 1 | 2 | 3 | 4 | 5 |
|----------|---|---|---|---|---|---|
| Extension (cm) | 0 | 0.8 | 1.6 | 2.4 | 3.2 | 4.0 |

Plot extension versus load. Determine the spring constant in N/m.

2. A student plots $y$ versus $x$ and gets a curve. They then plot $y$ versus $x^2$ and get a straight line through the origin. What is the functional relationship between $y$ and $x$?

**Level 2 — Intermediate**

3. The period $T$ of a simple pendulum is measured for different lengths $\ell$:

| $\ell$ (m) | 0.1 | 0.2 | 0.4 | 0.6 | 0.8 | 1.0 |
|------------|-----|-----|-----|-----|-----|-----|
| $T$ (s) | 0.63 | 0.90 | 1.26 | 1.55 | 1.79 | 2.00 |

Plot $T^2$ versus $\ell$. Determine $g$ from the slope.

4. In an experiment on gas pressure, $P$ is measured at constant temperature for various volumes $V$:

| $V$ (cm$^3$) | 10 | 15 | 20 | 25 | 30 |
|--------------|---|---|---|---|---|
| $P$ (kPa) | 250 | 167 | 125 | 100 | 83 |

What graph would you plot to obtain a straight line? Verify Boyle's law.

**Level 3 — Advanced**

5. A drug's plasma concentration $C$ decays with time $t$ as follows:

| $t$ (hr) | 0 | 2 | 4 | 6 | 8 | 10 |
|----------|---|---|---|---|---|----|
| $C$ (mg/L) | 100 | 71 | 50 | 35 | 25 | 18 |

Plot $\log C$ versus $t$. Is the elimination first-order? Determine the half-life.

6. The luminosity $L$ of main-sequence stars is related to their mass $M$ by $L \propto M^lpha$. Using the data below, determine $lpha$ by a log–log plot:

| $M$ ($M_\odot$) | 0.5 | 1.0 | 2.0 | 5.0 | 10 | 20 |
|-----------------|-----|-----|-----|-----|----|----|
| $L$ ($L_\odot$) | 0.03 | 1.0 | 11 | 500 | 4000 | 35000 |

**Level 4 — Challenge Problems 🎓**

7. **The Kepler Discovery:** Using only the data below (orbital period $T$ and semi-major axis $a$ for solar system planets), construct a graph that reveals Kepler's third law. Determine the power-law exponent without using a calculator.

| Planet | $a$ (AU) | $T$ (years) |
|--------|----------|-------------|
| Mercury | 0.39 | 0.24 |
| Venus | 0.72 | 0.62 |
| Earth | 1.00 | 1.00 |
| Mars | 1.52 | 1.88 |
| Jupiter | 5.20 | 11.9 |
| Saturn | 9.54 | 29.5 |

8. **Design a Diagnostic Graph:** A physician measures a patient's blood glucose every 30 minutes after a meal. Design a graphing strategy that would distinguish between:
   - A healthy patient (glucose rises then returns to baseline)
   - A diabetic patient (glucose rises higher and returns slowly)
   - A patient with impaired insulin response (glucose rises but never peaks)
   What would you plot on each axis? What shape would each case produce?

---

## 🔍 Chapter Summary

- The **slope** and **intercept** of a linear graph carry direct physical meaning.
- **Log–log plots** straighten power laws and reveal the exponent as the slope.
- **Proportionality reasoning** allows prediction without knowing the proportionality constant.
- **Curve straightening** is the art of finding the variable transformation that reveals a hidden linear relationship.
- Graphs are tools of discovery, not merely presentation. Kepler, Coulomb, and Millikan all found new physics by plotting.
