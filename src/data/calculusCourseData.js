// Content derived from UMaT's own CALCULUS (GM/GL/MN/MR/PE/ES/PG/NG/RP/CH 150)
// lecture notes (Faculty of Computing & Mathematical Sciences), covering:
// Limits of a Function, Differentiation, Partial Differentiation, and
// Integration. Explanations and worked examples are written fresh in this
// app's own teaching style — matching the syllabus's theorems, methods and
// chapter order, not copied verbatim from the handout.
//
// Quiz banks here run ~15 questions per topic (vs. 9 for French) since
// mathematics benefits from more repetition to build procedural fluency.
// Students still choose how many they attempt per sitting via QuizSetup.

let uid = 1;
const cid = () => `c${uid++}`;

function concept(title, slides, cards) {
  return { id: cid(), title, slides, cards };
}
function teach(text) {
  return { id: cid(), kind: "teach", text };
}
function example(french, english, note) {
  // Field names kept as french/english for schema parity across courses —
  // "french" holds the worked expression, "english" the plain explanation.
  return { id: cid(), kind: "example", french, english, note };
}
function card(front, back) {
  return { id: cid(), front, back };
}

export const CALCULUS_TOPICS = [
  // ================================================================= CAL-1
  {
    id: "limits",
    code: "CAL 150",
    week: "Chapter 1",
    title: "Limits of a Function",
    subtitle: "Direct substitution, indeterminate forms, and standard limits",
    subtopics: [
      {
        id: "limit-theorems",
        title: "Evaluating Limits by Substitution",
        concepts: [
          concept(
            "Direct substitution and the limit laws",
            [
              teach("For a polynomial or rational function that's defined at x = a, the limit as x approaches a is just found by substituting a. This works because such functions are continuous everywhere they're defined."),
              example("lim(x→2) (x² + 3x)", "Substitute x=2 directly: (2)² + 3(2) = 4 + 6 = 10", "No factoring needed — this is a plain polynomial, always continuous."),
              teach("The limit laws let you break a complicated limit into simpler pieces: the limit of a sum is the sum of the limits, the limit of a product is the product of the limits, and the limit of a quotient is the quotient of the limits — provided the denominator's limit isn't zero."),
              example("lim(x→−1) (3x−4)/(8x²+2x−2)", "Numerator at x=−1: −7. Denominator at x=−1: 4. Since 4≠0, the limit is −7/4.", "Always check the denominator's limit isn't zero before dividing — that's the one condition on the quotient law."),
              example("lim(x→5) (x²−2x)", "Substitute x=5: 25 − 10 = 15", "Another plain polynomial — direct substitution every time."),
            ],
            [
              card("What is the first thing to try when evaluating a limit of a polynomial or rational function?", "Direct substitution."),
              card("State the limit law for a quotient.", "lim[f(x)/g(x)] = lim f(x) / lim g(x), provided lim g(x) ≠ 0."),
              card("lim(x→2)(x²+3x) = ?", "10"),
              card("lim(x→5)(x²−2x) = ?", "15"),
            ]
          ),
        ],
      },
      {
        id: "indeterminate-standard",
        title: "Indeterminate Forms & Standard Limits",
        concepts: [
          concept(
            "0/0 is a signal to keep working, not an answer",
            [
              teach("If substituting x=a gives 0/0, that's called an indeterminate form. It doesn't mean the limit fails to exist — it means the expression needs to be simplified first, usually by factoring or rationalizing."),
              example("lim(x→3) (x²−9)/(x−3)", "Factor the numerator: (x−3)(x+3)/(x−3). Cancel (x−3): limit = x+3 = 6.", "Cancelling is valid here because we only care about values near x=3, not at x=3 itself."),
              teach("A handful of trig and exponential limits come up so often they're worth memorizing directly: as x→0, sin(x)→0, cos(x)→1, sin(x)/x→1, and (eˣ−1)/x→1."),
              example("lim(x→4) (x²−16)/(x−4)", "Factor: (x−4)(x+4)/(x−4). Cancel: limit = x+4 = 8.", "Same trick as before — the 0/0 form always hints that a common factor is waiting to be cancelled."),
            ],
            [
              card("What does a 0/0 result mean when evaluating a limit?", "An indeterminate form — simplify (factor or rationalize) and try again, it doesn't mean the limit doesn't exist."),
              card("lim(x→3)(x²−9)/(x−3) = ?", "6"),
              card("What is lim(x→0) sin(x)/x?", "1"),
              card("What is lim(x→0) cos(x)?", "1"),
              card("lim(x→4)(x²−16)/(x−4) = ?", "8"),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "mc", q: "What should you try first when evaluating any limit of a rational function?", options: ["Direct substitution", "L'Hôpital's rule immediately", "Guessing"], answer: "Direct substitution" },
      { type: "mc", q: "A result of 0/0 when substituting means:", options: ["The limit does not exist", "You must simplify further (factor/rationalize)", "The limit equals 0"], answer: "You must simplify further (factor/rationalize)" },
      { type: "fill", q: "lim(x→2) (x² + 3x) = ___", answer: "10" },
      { type: "fill", q: "lim(x→3) (x²−9)/(x−3) = ___", answer: "6" },
      { type: "fill", q: "lim(x→0) sin(x)/x = ___", answer: "1" },
      { type: "fill", q: "lim(x→0) cos(x) = ___", answer: "1" },
      { type: "mc", q: "The quotient limit law requires:", options: ["Numerator's limit is nonzero", "Denominator's limit is nonzero", "Both limits are equal"], answer: "Denominator's limit is nonzero" },
      { type: "mc", q: "lim(x→a) c, where c is a constant, equals:", options: ["a", "c", "0"], answer: "c" },
      { type: "fill", q: "lim(x→8) 5x = ___", answer: "40" },
      { type: "fill", q: "lim(x→5) (x²−2x) = ___", answer: "15" },
      { type: "fill", q: "lim(x→4) (x²−16)/(x−4) = ___", answer: "8" },
      { type: "mc", q: "The limit of a sum equals:", options: ["The sum of the limits", "The product of the limits", "Neither — sums can't be split"], answer: "The sum of the limits" },
      { type: "fill", q: "lim(x→10) x³ = ___", answer: "1000" },
      { type: "mc", q: "Existence of a limit at a point implies:", options: ["The limit value is unique", "The function is continuous there", "The function is differentiable there"], answer: "The limit value is unique" },
      { type: "fill", q: "lim(x→−2) (−3/2)x = ___", answer: "3" },
    ],
  },

  // ================================================================= CAL-2
  {
    id: "differentiation-basics",
    code: "CAL 150",
    week: "Chapter 2a",
    title: "Differentiation — First Principles & Rules",
    subtitle: "The definition of the derivative, and the power, product, quotient, and chain rules",
    subtopics: [
      {
        id: "first-principles",
        title: "Differentiation from First Principles",
        concepts: [
          concept(
            "The definition of the derivative",
            [
              teach("The derivative of f(x) is defined as the limit of [f(x+Δx) − f(x)] / Δx as Δx approaches 0 — geometrically, the slope of the tangent line; physically, an instantaneous rate of change."),
              example("f(x) = 2x² − 5x + 3, find f'(x) from first principles", "Expand f(x+Δx), subtract f(x), divide by Δx, then let Δx→0. The result is f'(x) = 4x − 5.", "This is the mechanical process every derivative rule is secretly built on."),
              teach("Applying first principles to f(x) = xⁿ in general gives the power rule directly: the derivative of xⁿ is n·xⁿ⁻¹, and this holds for negative and fractional n too."),
              example("f(x) = x³ + 2x, find f'(x) from first principles", "Expand (x+Δx)³ + 2(x+Δx), subtract f(x), divide by Δx, and let Δx→0: f'(x) = 3x² + 2.", "Same mechanical process, just a higher power — it always reduces to the power rule result in the end."),
            ],
            [
              card("What is the first-principles definition of f'(x)?", "The limit as Δx→0 of [f(x+Δx) − f(x)] / Δx."),
              card("If f(x) = 2x² − 5x + 3, what is f'(x)?", "4x − 5"),
              card("What does the power rule say for f(x) = xⁿ?", "f'(x) = n·xⁿ⁻¹"),
              card("If f(x) = x³ + 2x, what is f'(x)?", "3x² + 2"),
            ]
          ),
        ],
      },
      {
        id: "differentiation-rules",
        title: "Product, Quotient, and Chain Rules",
        concepts: [
          concept(
            "Combining functions",
            [
              teach("Product rule: the derivative of f(x)g(x) is f(x)g'(x) + g(x)f'(x) — differentiate each factor in turn, keeping the other fixed, and add the results."),
              example("f(x) = (x²+1)(2x−1)", "By the product rule: (x²+1)(2) + (2x−1)(2x) = 2x²+2 + 4x²−2x = 6x²−2x+2", "Same answer you'd get expanding first and differentiating term by term — the product rule just avoids the expansion."),
              teach("Quotient rule: the derivative of f(x)/g(x) is [g(x)f'(x) − f(x)g'(x)] / [g(x)]². Note the order in the numerator matters — it's not symmetric like the product rule."),
              teach("Chain rule: if y = f(u) and u = g(x), then dy/dx = (dy/du)·(du/dx). This is how you differentiate a function 'inside' another function."),
              example("y = (3x+1)⁴", "Let u=3x+1, so y=u⁴. dy/du=4u³, du/dx=3. dy/dx = 4u³·3 = 12(3x+1)³.", "Whenever you see 'something' raised to a power, the chain rule almost always applies."),
            ],
            [
              card("State the product rule for d/dx[f(x)g(x)].", "f(x)g'(x) + g(x)f'(x)"),
              card("State the quotient rule for d/dx[f(x)/g(x)].", "[g(x)f'(x) − f(x)g'(x)] / [g(x)]²"),
              card("State the chain rule for y=f(u), u=g(x).", "dy/dx = (dy/du)·(du/dx)"),
              card("Differentiate f(x) = (x²+1)(2x−1) using the product rule.", "6x² − 2x + 2"),
              card("Differentiate y = (3x+1)⁴ using the chain rule.", "12(3x+1)³"),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "fill", q: "d/dx of xⁿ = ___", answer: "nx^(n-1)" },
      { type: "fill", q: "If f(x) = 2x² − 5x + 3, then f'(x) = ___", answer: "4x-5" },
      { type: "mc", q: "The product rule for d/dx[f·g] is:", options: ["f·g' + g·f'", "f'·g'", "f·g' − g·f'"], answer: "f·g' + g·f'" },
      { type: "mc", q: "The quotient rule numerator [for d/dx(f/g)] is:", options: ["g·f' − f·g'", "f·g' − g·f'", "f·g' + g·f'"], answer: "g·f' − f·g'" },
      { type: "mc", q: "The chain rule states dy/dx equals:", options: ["(dy/du)·(du/dx)", "(dy/du) + (du/dx)", "(dy/du)/(du/dx)"], answer: "(dy/du)·(du/dx)" },
      { type: "fill", q: "Differentiate (x²+1)(2x−1) using the product rule: f'(x) = ___", answer: "6x^2-2x+2" },
      { type: "mc", q: "What does the first-principles definition of a derivative compute in the limit?", options: ["The average rate of change over a large interval", "The instantaneous rate of change at a point", "The value of the function at a point"], answer: "The instantaneous rate of change at a point" },
      { type: "fill", q: "d/dx of x⁻³ = ___", answer: "-3x^-4" },
      { type: "mc", q: "Which rule do you use to differentiate sin(3x²)?", options: ["Power rule only", "Chain rule", "Product rule only"], answer: "Chain rule" },
      { type: "fill", q: "If f(x) = x³ + 2x, f'(x) = ___", answer: "3x^2+2" },
      { type: "fill", q: "Differentiate y = (3x+1)⁴: dy/dx = ___", answer: "12(3x+1)^3" },
      { type: "mc", q: "For y = f(u) and u = g(x), which quantity do you compute first before multiplying?", options: ["dy/du and du/dx separately", "d²y/dx² directly", "Only du/dx"], answer: "dy/du and du/dx separately" },
      { type: "fill", q: "d/dx of x⁵ = ___", answer: "5x^4" },
      { type: "mc", q: "In the quotient rule, the denominator of the result is:", options: ["g(x)", "[g(x)]²", "f(x)·g(x)"], answer: "[g(x)]²" },
    ],
  },

  // ================================================================= CAL-3
  {
    id: "differentiation-applications",
    code: "CAL 150",
    week: "Chapter 2b",
    title: "Differentiation — Special Functions & Applications",
    subtitle: "Logarithmic and implicit differentiation, rates of change, and stationary points",
    subtopics: [
      {
        id: "logs-implicit",
        title: "Logarithmic & Implicit Differentiation",
        concepts: [
          concept(
            "Beyond simple explicit functions",
            [
              teach("If y = ln f(x), then dy/dx = f'(x)/f(x). This shows up constantly, since logarithms turn products and powers into sums, making otherwise messy derivatives manageable."),
              teach("For an implicit relation like F(x,y) = 0, where y isn't isolated, differentiate every term with respect to x — treating y as a function of x, so any term with y picks up a dy/dx by the chain rule — then solve algebraically for dy/dx."),
              example("y² − x² + xy = 3", "Differentiate term by term: 2y(dy/dx) − 2x + y + x(dy/dx) = 0. Collect dy/dx terms: dy/dx = (2x+y)/(2y+x).", "The key move is remembering every y-term needs its own dy/dx tacked on via the chain rule."),
              example("y = ln(x² + 1)", "Let f(x) = x²+1, so f'(x) = 2x. Then dy/dx = 2x/(x²+1).", "Straightforward application of the log-derivative rule once you identify f(x) inside the ln."),
            ],
            [
              card("If y = ln f(x), what is dy/dx?", "f'(x)/f(x)"),
              card("In implicit differentiation, why does a term containing y get an extra dy/dx?", "Because y is itself a function of x, so differentiating it invokes the chain rule."),
              card("If y = ln(x²+1), what is dy/dx?", "2x/(x²+1)"),
            ]
          ),
        ],
      },
      {
        id: "rates-stationary",
        title: "Rates of Change & Stationary Points",
        concepts: [
          concept(
            "Where derivatives become physical",
            [
              teach("If a quantity y depends on x, dy/dx is its rate of change with respect to x. When the 'with respect to' variable is time, this is just called 'the rate of change' — velocity is dx/dt, acceleration is dv/dt = d²x/dt²."),
              example("x = 3t³ − 2t² + 4t − 1, find velocity and acceleration at t=0", "v = dx/dt = 9t²−4t+4, so v(0)=4 m/s. a = dv/dt = 18t−4, so a(0)=−4 m/s².", "Differentiate once for velocity, twice for acceleration."),
              teach("A stationary point occurs where dy/dx = 0. To classify it: find d²y/dx² at that x-value. Positive means a minimum, negative means a maximum, and zero means a point of inflexion."),
              example("y = 3x² − 6x, locate and classify the turning point", "dy/dx = 6x−6 = 0 gives x=1, so y=3(1)²−6(1)=−3. d²y/dx² = 6, which is positive, so (1,−3) is a minimum.", "Same test works for any polynomial — solve dy/dx=0, then check the sign of the second derivative there."),
              example("A rectangle has perimeter 40cm — find the dimensions of maximum area", "With x+y=20, area A=x(20−x)=20x−x². dA/dx=20−2x=0 gives x=10, so y=10. d²A/dx²=−2 (negative ⇒ maximum). Max area = 100cm².", "Classic optimization pattern: express area in one variable using the constraint, then apply the stationary-point test."),
            ],
            [
              card("How is acceleration related to displacement x(t)?", "Acceleration is the second derivative of displacement with respect to time: a = d²x/dt²."),
              card("At a stationary point, what does a positive second derivative indicate?", "A minimum point."),
              card("At a stationary point, what does a negative second derivative indicate?", "A maximum point."),
              card("What does a zero second derivative at a stationary point indicate?", "A point of inflexion."),
              card("For a rectangle of fixed perimeter, what shape maximizes area?", "A square (equal length and breadth)."),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "fill", q: "If y = ln f(x), then dy/dx = ___", answer: "f'(x)/f(x)" },
      { type: "mc", q: "In implicit differentiation, a term containing y gets an extra factor of:", answer: "dy/dx", options: ["dy/dx", "dx/dy", "d²y/dx²"] },
      { type: "fill", q: "If x = 3t³ − 2t² + 4t − 1, velocity v(t) = ___ (in terms of t)", answer: "9t^2-4t+4" },
      { type: "fill", q: "Acceleration is the ___ derivative of displacement with respect to time.", answer: "second" },
      { type: "mc", q: "At a stationary point, if d²y/dx² is positive, the point is a:", options: ["Maximum", "Minimum", "Point of inflexion"], answer: "Minimum" },
      { type: "mc", q: "At a stationary point, if d²y/dx² is negative, the point is a:", options: ["Maximum", "Minimum", "Point of inflexion"], answer: "Maximum" },
      { type: "mc", q: "At a stationary point, if d²y/dx² = 0, the point is a:", options: ["Maximum", "Minimum", "Point of inflexion"], answer: "Point of inflexion" },
      { type: "fill", q: "For y = 3x² − 6x, the x-coordinate of the turning point is x = ___", answer: "1" },
      { type: "mc", q: "The procedure for finding stationary points starts by:", options: ["Setting dy/dx = 0 and solving for x", "Setting y = 0 and solving for x", "Setting d²y/dx² = 0"], answer: "Setting dy/dx = 0 and solving for x" },
      { type: "fill", q: "If y = ln(x²+1), dy/dx = ___", answer: "2x/(x^2+1)" },
      { type: "fill", q: "A rectangle has perimeter 40cm. The maximum possible area is ___ cm²", answer: "100" },
      { type: "mc", q: "For a fixed-perimeter rectangle of maximum area, the shape is:", options: ["A square", "As long and thin as possible", "Any rectangle works equally"], answer: "A square" },
      { type: "fill", q: "For x = 3t³ − 2t² + 4t − 1, acceleration a(t) = ___ (in terms of t)", answer: "18t-4" },
      { type: "mc", q: "A rate of change with respect to time, without further qualification, usually means:", options: ["d(quantity)/dt", "d(quantity)/dx", "The value of the quantity itself"], answer: "d(quantity)/dt" },
    ],
  },

  // ================================================================= CAL-4
  {
    id: "partial-differentiation",
    code: "CAL 150",
    week: "Chapter 3",
    title: "Partial Differentiation",
    subtitle: "Derivatives of functions of several variables",
    subtopics: [
      {
        id: "partial-basics",
        title: "Partial Derivatives — Definition & Computation",
        concepts: [
          concept(
            "Holding one variable fixed",
            [
              teach("For z = f(x,y), the partial derivative with respect to x (written ∂z/∂x or fₓ) is found by treating y as a constant and differentiating with respect to x as normal. Similarly for ∂z/∂y, treat x as constant."),
              example("z = 2x² + 3xy − 6y²", "∂z/∂x = 4x + 3y (treat y as constant). ∂z/∂y = 3x − 12y (treat x as constant).", "Every ordinary differentiation rule still applies — you're just freezing the other variable."),
              example("z = x²y³", "∂z/∂x = 2xy³ (y³ acts as a constant multiplier). ∂z/∂y = 3x²y² (x² acts as a constant multiplier).", "Whichever variable you're not differentiating with respect to is treated exactly like a numeric constant."),
            ],
            [
              card("To find ∂z/∂x for z=f(x,y), what do you treat y as?", "A constant."),
              card("For z = 2x² + 3xy − 6y², what is ∂z/∂x?", "4x + 3y"),
              card("For z = 2x² + 3xy − 6y², what is ∂z/∂y?", "3x − 12y"),
              card("For z = x²y³, what is ∂z/∂x?", "2xy³"),
            ]
          ),
        ],
      },
      {
        id: "higher-order-partials",
        title: "Higher Order Partial Derivatives",
        concepts: [
          concept(
            "Differentiating twice",
            [
              teach("Since ∂f/∂x and ∂f/∂y are themselves functions of x and y, they can be differentiated again — giving fₓₓ, f_yy, and the mixed partials fₓy and f_yx. For most functions you'll meet, the two mixed partials are equal."),
              example("z = x²y³ (continued)", "fₓₓ = 2y³ (differentiate 2xy³ with respect to x again). f_yy = 6x²y (differentiate 3x²y² with respect to y again).", "Second-order partials are just first-order partials, applied twice."),
            ],
            [
              card("What are fₓₓ and f_yy called?", "Second-order (pure) partial derivatives."),
              card("For most functions, how do the mixed partials fₓy and f_yx compare?", "They are equal."),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "fill", q: "For z = 2x² + 3xy − 6y², ∂z/∂x = ___", answer: "4x+3y" },
      { type: "fill", q: "For z = 2x² + 3xy − 6y², ∂z/∂y = ___", answer: "3x-12y" },
      { type: "mc", q: "When computing ∂z/∂x for z=f(x,y), y is treated as:", options: ["A constant", "Another function of x", "Zero"], answer: "A constant" },
      { type: "fill", q: "For z = xy + ln(x), ∂z/∂y = ___", answer: "x" },
      { type: "mc", q: "For most functions met in this course, the mixed partials fₓy and f_yx are:", options: ["Always different", "Equal", "Undefined"], answer: "Equal" },
      { type: "mc", q: "fₓₓ refers to:", options: ["The partial derivative of f with respect to x, twice", "The partial derivative with respect to x then y", "The value of f at x=0"], answer: "The partial derivative of f with respect to x, twice" },
      { type: "fill", q: "For z = xy + ln(x), ∂z/∂x = ___", answer: "y+1/x" },
      { type: "mc", q: "The domain of a function of two variables, like f(x,y), is:", options: ["One-dimensional", "Two-dimensional", "Always all real numbers"], answer: "Two-dimensional" },
      { type: "mc", q: "The range of any function f(x,y) is:", options: ["Always two-dimensional", "One-dimensional", "Undefined"], answer: "One-dimensional" },
      { type: "fill", q: "For z = x²y³, ∂z/∂x = ___", answer: "2xy^3" },
      { type: "fill", q: "For z = x²y³, ∂z/∂y = ___", answer: "3x^2y^2" },
      { type: "fill", q: "For z = x²y³, ∂²z/∂x² = ___", answer: "2y^3" },
      { type: "fill", q: "For z = x²y³, ∂²z/∂y² = ___", answer: "6x^2y" },
      { type: "mc", q: "∂f/∂x evaluated at a specific point (x₀,y₀) is often written:", options: ["fₓ(x₀,y₀)", "f(x₀)", "fₓₓ(x₀,y₀)"], answer: "fₓ(x₀,y₀)" },
    ],
  },

  // ================================================================= CAL-5
  {
    id: "integration",
    code: "CAL 150",
    week: "Chapter 4",
    title: "Integration",
    subtitle: "Standard integrals, substitution, integration by parts, and partial fractions",
    subtopics: [
      {
        id: "standard-substitution",
        title: "Standard Integrals & Substitution",
        concepts: [
          concept(
            "Reversing differentiation",
            [
              teach("Integration undoes differentiation. For ∫axⁿ dx (n ≠ −1), the result is [a/(n+1)]·xⁿ⁺¹ + c — always add the arbitrary constant c, since many functions share the same derivative."),
              example("∫(6x² + 4x − 5) dx", "Integrate term by term: 2x³ + 2x² − 5x + c", "The integral of a sum is the sum of the integrals — same principle as differentiation."),
              teach("When a function isn't in standard form, substitution can simplify it: pick u equal to some inner expression, rewrite dx in terms of du, then integrate the simpler expression in u before substituting back."),
              example("∫cos(3x+7) dx", "Let u = 3x+7, so du = 3 dx, meaning dx = du/3. Then ∫cos(u)·(du/3) = (1/3)sin(u) + c = (1/3)sin(3x+7) + c.", "Substitution is most useful when the 'inside' of a function is more complex than a bare x."),
              example("∫(2x−5)⁷ dx", "Let u=2x−5, du=2dx, so dx=du/2. Then ∫u⁷·(du/2) = u⁸/16 + c = (2x−5)⁸/16 + c.", "Any 'linear expression raised to a power' pattern is a strong hint to substitute."),
            ],
            [
              card("What is ∫axⁿ dx for n ≠ −1?", "[a/(n+1)]·xⁿ⁺¹ + c"),
              card("Why do we always add + c after integrating?", "Because many different functions share the same derivative — the constant can't be recovered from the derivative alone."),
              card("∫(6x² + 4x − 5) dx = ?", "2x³ + 2x² − 5x + c"),
              card("∫(2x−5)⁷ dx = ?", "(2x−5)⁸/16 + c"),
            ]
          ),
        ],
      },
      {
        id: "parts-partial-fractions",
        title: "Integration by Parts & Partial Fractions",
        concepts: [
          concept(
            "Products and rational functions",
            [
              teach("Integration by parts handles a product of two functions where neither is the derivative of the other: ∫u dv = uv − ∫v du. Choosing which factor is 'u' matters — prefer log functions, then powers of x, then exponentials, in that priority order."),
              example("∫x² ln(x) dx", "Let u=ln(x), dv=x²dx, so du=(1/x)dx, v=x³/3. Then ∫x²ln(x)dx = (x³/3)ln(x) − ∫(x³/3)(1/x)dx = (x³/3)ln(x) − x³/9 + c.", "Log factor was chosen as u, following the priority order."),
              teach("For a rational function where the numerator isn't the derivative of the denominator, and it doesn't match a standard form, split it into partial fractions first — simpler pieces that integrate directly to logarithms."),
              example("∫(x+1)/(x²−3x+2) dx", "Factor the denominator: (x−1)(x−2). Split into A/(x−1) + B/(x−2), solve for A=−2, B=3. Integrate: −2ln(x−1) + 3ln(x−2) + c.", "The partial fraction constants are found by substituting the roots of each linear factor."),
              example("∫x sin(3x) dx", "Let u=x, dv=sin(3x)dx, so du=dx, v=−(1/3)cos(3x). Then ∫x sin(3x)dx = −(x/3)cos(3x) + (1/3)∫cos(3x)dx = −(x/3)cos(3x) + (1/9)sin(3x) + c.", "Power of x chosen as u here, since there's no log factor present."),
            ],
            [
              card("State the integration-by-parts formula.", "∫u dv = uv − ∫v du"),
              card("When choosing 'u' in integration by parts, what's the priority order?", "Log functions first, then powers of x, then exponential functions."),
              card("What is the first step in integrating a rational function that isn't a standard form?", "Split it into partial fractions."),
              card("∫x sin(3x) dx = ?", "−(x/3)cos(3x) + (1/9)sin(3x) + c"),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "fill", q: "∫axⁿ dx (n ≠ −1) = ___", answer: "a x^(n+1)/(n+1)+c" },
      { type: "fill", q: "∫(6x² + 4x − 5) dx = ___", answer: "2x^3+2x^2-5x+c" },
      { type: "mc", q: "Integration by parts states ∫u dv equals:", options: ["uv − ∫v du", "uv + ∫v du", "∫v du − uv"], answer: "uv − ∫v du" },
      { type: "mc", q: "When choosing 'u' in integration by parts, which is prioritized first?", options: ["Exponential functions", "Log functions", "Powers of x"], answer: "Log functions" },
      { type: "mc", q: "Before integrating a rational function with no standard form, you should:", options: ["Differentiate the denominator", "Split into partial fractions", "Substitute u = the whole fraction"], answer: "Split into partial fractions" },
      { type: "fill", q: "∫cos(3x+7) dx = ___", answer: "(1/3)sin(3x+7)+c" },
      { type: "mc", q: "Why is a constant of integration c always added?", options: ["It's a formatting convention only", "Many functions share the same derivative", "To make the answer longer"], answer: "Many functions share the same derivative" },
      { type: "fill", q: "For (x+1)/(x²−3x+2) split into A/(x−1)+B/(x−2), A = ___", answer: "-2" },
      { type: "mc", q: "Substitution is most useful when:", options: ["The function is already a simple polynomial", "The 'inside' of a function is more complex than a bare x", "You want to avoid using standard integrals"], answer: "The 'inside' of a function is more complex than a bare x" },
      { type: "fill", q: "∫(2x−5)⁷ dx = ___", answer: "(2x-5)^8/16+c" },
      { type: "fill", q: "For (x+1)/(x²−3x+2) split into A/(x−1)+B/(x−2), B = ___", answer: "3" },
      { type: "mc", q: "In ∫x²ln(x)dx, which factor is chosen as u?", options: ["x²", "ln(x)", "Neither — substitution is used instead"], answer: "ln(x)" },
      { type: "fill", q: "∫x sin(3x) dx = ___", answer: "-(x/3)cos(3x)+(1/9)sin(3x)+c" },
      { type: "mc", q: "A quadratic factor (ax²+bx+c) in a partial fraction decomposition gives a numerator of the form:", options: ["A (a single constant)", "Ax + B", "A/x"], answer: "Ax + B" },
    ],
  },
];
